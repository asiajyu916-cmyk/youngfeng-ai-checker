/**
 * POST /api/parcel/lookup
 *
 * 地號查詢主線（Phase A）：
 *   地號 → twland.ronny.tw → WGS84 座標 + 地籍面積
 *        → 服務端 PIP（若 data/taichung_zoning.geojson 存在）
 *        → 都市計畫區、使用分區、建蔽率、容積率
 *
 * ─── 回應結構 ────────────────────────────────────────────────────
 * {
 *   ok: true,
 *   steps: {
 *     twland: { status:'ok', coordinate, landArea, formattedLandNo, ... }
 *     pip:    { status:'ok'|'no_geojson'|'not_found'|'error', ...分區資料 }
 *   },
 *   summary: { coordinate, landArea, urban_plan_name, zone_name, ... } | null,
 *   externalLinks: { luz, taichung158 },
 *   disclaimer: string,
 * }
 *
 * ─── 服務端 PIP 前提 ─────────────────────────────────────────────
 * 需先將台中市都市計畫 GeoJSON 放置於：
 *   data/taichung_zoning.geojson
 *
 * 若檔案不存在，steps.pip.status = 'no_geojson'，
 * 僅回傳座標資料（steps.twland），PIP 留給 Client-side 執行。
 *
 * ─── 請求格式 ────────────────────────────────────────────────────
 * POST /api/parcel/lookup
 * Content-Type: application/json
 * {
 *   "county":   "臺中市",
 *   "district": "大里區",
 *   "section":  "大仁段",
 *   "number":   "459"
 * }
 *
 * ─── 測試案例 ────────────────────────────────────────────────────
 * curl -X POST http://localhost:3000/api/parcel/lookup \
 *   -H "Content-Type: application/json" \
 *   -d '{"county":"臺中市","district":"大里區","section":"大仁段","number":"459"}'
 */

import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import { queryTwland } from '@/lib/adapters/TwlandParcelAdapter'
import { importGeoJSON } from '@/lib/gis/importPipeline'
import { queryPointInPolygon } from '@/lib/gis/pointInPolygon'
import type { ZoningFeature } from '@/lib/gis/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ─── 服務端 GeoJSON 快取（模組層級，避免重複讀取）──────────────
let _serverGeoJSON: ZoningFeature[] | null = null
let _serverGeoJSONLoadedAt = 0
const CACHE_TTL_MS = 60 * 60 * 1000   // 1 小時

const GEOJSON_PATH = path.join(process.cwd(), 'data', 'taichung_zoning.geojson')

function loadServerGeoJSON(): ZoningFeature[] | null {
  // 快取有效，直接回傳
  if (_serverGeoJSON && Date.now() - _serverGeoJSONLoadedAt < CACHE_TTL_MS) {
    return _serverGeoJSON
  }

  if (!fs.existsSync(GEOJSON_PATH)) return null

  try {
    const raw  = fs.readFileSync(GEOJSON_PATH, 'utf-8')
    const json = JSON.parse(raw)
    const { result, features } = importGeoJSON(json, 'taichung_zoning.geojson')

    if (!result.success || features.length === 0) {
      console.warn('[parcel/lookup] GeoJSON 解析失敗或無有效 Feature:', result.errors)
      return null
    }

    _serverGeoJSON = features
    _serverGeoJSONLoadedAt = Date.now()
    console.info(`[parcel/lookup] GeoJSON 已載入：${features.length} 個分區 Polygon`)
    return features

  } catch (e) {
    console.error('[parcel/lookup] 讀取 GeoJSON 失敗:', e)
    return null
  }
}

// ─── 外部查證連結 ────────────────────────────────────────────────
const EXTERNAL_LINKS = {
  luz:          'https://luz.nlma.gov.tw/web/',
  taichung158:  'https://lohas.taichung.gov.tw/webgis/',
}

const DISCLAIMER =
  '資料來源：座標查詢 twland.ronny.tw（地籍資料來自內政部）；使用分區 臺中市都市計畫圖 GIS 開放資料集。' +
  '本結果僅供內部初步檢核，實際仍應以主管機關公告、核發證明或書面認定為準。'

// ─── POST handler ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── 解析請求 body ────────────────────────────────────────────
  let body: { county?: string; district?: string; section?: string; number?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: '請求 body 格式錯誤，需為 JSON' }, { status: 400 })
  }

  const { county = '', district = '', section = '', number = '' } = body

  if (!county || !district || !section || !number) {
    return NextResponse.json({
      ok: false,
      error: '缺少必要欄位：county、district、section、number',
      required: { county: '臺中市', district: '大里區', section: '大仁段', number: '459' },
    }, { status: 400 })
  }

  // ══════════════════════════════════════════════════════════════
  // Step 1：地號 → twland.ronny.tw → 座標 + 地籍面積
  // ══════════════════════════════════════════════════════════════
  const twlandResult = await queryTwland({ county, district, section, number })

  if (!twlandResult.ok) {
    return NextResponse.json({
      ok: false,
      steps: {
        twland: { status: 'error', error: twlandResult.error, formattedQuery: twlandResult.formattedQuery },
        pip:    { status: 'skipped', reason: 'twland Step 1 失敗，跳過 PIP' },
      },
      summary: null,
      externalLinks: EXTERNAL_LINKS,
      disclaimer: DISCLAIMER,
    }, { status: 200 })   // 200 + ok:false，讓前端可讀取 error 訊息
  }

  const { coordinate, landArea, formattedQuery, featureCount,
          matchedDistrict, districtMismatch, districtWarning } = twlandResult

  // ══════════════════════════════════════════════════════════════
  // Step 2：座標 → 服務端 PIP（若 data/taichung_zoning.geojson 存在）
  // ══════════════════════════════════════════════════════════════
  const features = loadServerGeoJSON()

  if (!features) {
    // GeoJSON 不在伺服器端 → 只回傳座標，PIP 留給 Client-side
    return NextResponse.json({
      ok: true,
      steps: {
        twland: {
          status: 'ok',
          coordinate,
          landArea,
          formattedQuery,
          featureCount,
          matchedDistrict,
          districtMismatch,
          districtWarning,
        },
        pip: {
          status: 'no_geojson',
          message: `伺服器端無 data/taichung_zoning.geojson，` +
                   `PIP 查詢需在瀏覽器端執行（請先至「GIS 資料管理」頁面匯入 GeoJSON）。`,
          geojsonPath: GEOJSON_PATH,
        },
      },
      summary: {
        coordinate,
        landArea,
        urban_plan_name: null,
        zone_name: null,
        coverage_ratio: null,
        floor_area_ratio: null,
      },
      externalLinks: EXTERNAL_LINKS,
      disclaimer: DISCLAIMER,
    })
  }

  // ── 執行 PIP ────────────────────────────────────────────────
  const t0        = Date.now()
  const pipResult = queryPointInPolygon(coordinate, features)
  const pipMs     = Date.now() - t0

  if (!pipResult.found || pipResult.features.length === 0) {
    return NextResponse.json({
      ok: true,
      steps: {
        twland: { status: 'ok', coordinate, landArea, formattedQuery, featureCount,
                  matchedDistrict, districtMismatch, districtWarning },
        pip: {
          status: 'not_found',
          message: `座標 [${coordinate[1].toFixed(6)}, ${coordinate[0].toFixed(6)}] ` +
                   `未落在任何已匯入的分區 Polygon 內。` +
                   `請確認 GeoJSON 涵蓋範圍（共 ${features.length} 個 Polygon）是否包含此座標。`,
          queryMs: pipMs,
          featuresSearched: features.length,
        },
      },
      summary: {
        coordinate,
        landArea,
        urban_plan_name: null,
        zone_name: null,
        coverage_ratio: null,
        floor_area_ratio: null,
      },
      externalLinks: EXTERNAL_LINKS,
      disclaimer: DISCLAIMER,
    })
  }

  // ── PIP 命中 → 取最佳結果 ──────────────────────────────────
  const best  = pipResult.features[0]
  const props = best.properties

  // 組合 twland step 資訊（含行政區不符警告）
  const twlandStep = {
    status:           'ok',
    coordinate,
    landArea,
    formattedQuery:   twlandResult.formattedQuery,
    featureCount:     twlandResult.featureCount,
    matchedDistrict:  twlandResult.matchedDistrict,
    districtMismatch: twlandResult.districtMismatch,
    districtWarning:  twlandResult.districtWarning,
  }

  return NextResponse.json({
    ok: true,
    steps: {
      twland: twlandStep,
      pip: {
        status:           'ok',
        queryMs:          pipMs,
        featuresSearched: features.length,
        featuresMatched:  pipResult.features.length,
        featureId:        best.id,
        urban_plan_name:  props.urban_plan_name,
        detail_plan_name: props.detail_plan_name,
        zone_name:        props.zone_name,
        zone_short_name:  props.zone_short_name,
        coverage_ratio:   props.coverage_ratio,
        floor_area_ratio: props.floor_area_ratio,
        max_far:          props.max_far ?? null,
        district:         props.district,
        note:             props.note ?? null,
        announcement_no:  props.announcement_no ?? null,
        project_name:     props.project_name ?? null,
        source_file:      props.source_file ?? null,
      },
    },
    summary: {
      coordinate,
      landArea,
      urban_plan_name:  props.urban_plan_name,
      detail_plan_name: props.detail_plan_name,
      zone_name:        props.zone_name,
      zone_short_name:  props.zone_short_name,
      coverage_ratio:   props.coverage_ratio,
      floor_area_ratio: props.floor_area_ratio,
      max_far:          props.max_far ?? null,
      note:             props.note ?? null,
    },
    externalLinks: EXTERNAL_LINKS,
    disclaimer: DISCLAIMER,
  })
}

// ─── GET：快速狀態確認（curl 測試用）────────────────────────────

export async function GET() {
  const hasGeoJSON = fs.existsSync(GEOJSON_PATH)
  const cachedCount = _serverGeoJSON?.length ?? 0

  return NextResponse.json({
    ok: true,
    message: '地號查詢 API 正常運作中。請使用 POST 進行查詢。',
    pipeline: {
      step1_twland:    '✅ 可用（twland.ronny.tw proxy）',
      step2_pip:       hasGeoJSON
        ? `✅ 可用（${cachedCount > 0 ? `已快取 ${cachedCount} 個 Polygon` : '尚未載入，首次查詢時自動載入'}）`
        : `⚠️ 無 GeoJSON（${GEOJSON_PATH} 不存在，PIP 需在瀏覽器端執行）`,
    },
    example: {
      method: 'POST',
      url:    '/api/parcel/lookup',
      body: {
        county:   '臺中市',
        district: '大里區',
        section:  '大仁段',
        number:   '459',
      },
    },
  })
}
