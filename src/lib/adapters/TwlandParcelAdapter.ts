/**
 * TwlandParcelAdapter — 地號 → WGS84 座標 + 地籍面積
 *
 * 資料來源：twland.ronny.tw（整合自內政部 easymap，2015 年前資料）
 *
 * ── API 正確格式 ────────────────────────────────────────────────
 *   GET https://twland.ronny.tw/index/search?lands[]={縣市},{地段名稱},{地號}
 *
 *   ⚠ 不含「行政區」！格式為 3 段：縣市、地段、地號。
 *   ⚠ 地號直接傳入（如 "459"），twland 自行處理格式。
 *   ⚠ 同段名可能存在多個鄉鎮，回應會含所有命中。
 *
 * ── 資料年齡限制 ─────────────────────────────────────────────────
 *   資料截至 2015 年前，新劃設地段（如大里區部分新地段）可能查無資料。
 *   查無時回傳 ok:false，明確說明，不補假資料。
 *
 * ── Response Properties 關鍵欄位 ──────────────────────────────────
 *   xcenter / ycenter  : 重心座標（WGS84，由 twland 預算好）
 *   縣市               : 縣市名稱
 *   鄉鎮               : 行政區（用於比對使用者輸入的 district）
 *   地段               : 地段名稱
 *   地號               : 地號
 *   （面積欄位不存在，若需要需自行由 Polygon 計算）
 *
 * ── 授權說明 ─────────────────────────────────────────────────────
 *   民間整合服務，無公開 ToS。使用時需標示來源並附免責聲明。
 *   僅供 Server-side 呼叫（無 CORS 問題）。
 */

// ─── 型別 ─────────────────────────────────────────────────────────

export interface TwlandInput {
  county:   string   // 縣市，例：臺中市（台 → 臺 自動正規化）
  district: string   // 行政區（用於比對，不送進 API）
  section:  string   // 地段，例：大仁段
  number:   string   // 地號，例：459、459-1
}

export type TwlandResult =
  | {
      ok:              true
      coordinate:      [number, number]   // [longitude, latitude] WGS84
      landArea:        number             // 地籍面積 ㎡（0 = 查無面積）
      formattedQuery:  string             // 送出的查詢字串
      featureCount:    number             // twland 回傳的 feature 總數
      matchedDistrict: string             // 命中的行政區（可能與輸入不同）
      districtMismatch: boolean           // true = 行政區不符（同段名不同鄉鎮）
      districtWarning: string | null      // 行政區不符時的警告說明
    }
  | {
      ok:             false
      error:          string
      formattedQuery: string
    }

// ─── 常數 ─────────────────────────────────────────────────────────

const TWLAND_BASE    = 'https://twland.ronny.tw/index/search'
const FETCH_TIMEOUT  = 12_000   // 12 秒超時

// ─── 工具函式 ─────────────────────────────────────────────────────

/** 縣市名稱正規化：台 → 臺 */
function normalizeCounty(county: string): string {
  return county.replace(/^台/, '臺')
}

/**
 * 從 Feature Properties 提取重心座標。
 * twland 已預先計算 xcenter / ycenter，優先使用；
 * 若無則從 xmin/xmax/ymin/ymax 估算（次優）。
 */
function extractCentroidFromProps(
  props: Record<string, unknown>
): [number, number] | null {
  const xc = Number(props['xcenter'])
  const yc = Number(props['ycenter'])
  if (!isNaN(xc) && !isNaN(yc) && xc !== 0 && yc !== 0) {
    return [xc, yc]
  }
  // fallback: bounding box center
  const xmin = Number(props['xmin']), xmax = Number(props['xmax'])
  const ymin = Number(props['ymin']), ymax = Number(props['ymax'])
  if (!isNaN(xmin) && !isNaN(xmax) && !isNaN(ymin) && !isNaN(ymax)) {
    return [(xmin + xmax) / 2, (ymin + ymax) / 2]
  }
  return null
}

/**
 * 從 MultiPolygon/Polygon 座標計算算術平均重心（後備方案）。
 */
function centroidFromGeometry(
  geometry: { type: string; coordinates: unknown }
): [number, number] {
  let ring: number[][]
  if (geometry.type === 'MultiPolygon') {
    ring = (geometry.coordinates as number[][][][])[0][0]
  } else if (geometry.type === 'Polygon') {
    ring = (geometry.coordinates as number[][][])[0]
  } else if (geometry.type === 'Point') {
    const c = geometry.coordinates as [number, number]
    return [c[0], c[1]]
  } else {
    throw new Error(`不支援的幾何型別：${geometry.type}`)
  }
  // 去除閉合重複點
  const pts = (ring.at(-1)?.[0] === ring[0][0] && ring.at(-1)?.[1] === ring[0][1])
    ? ring.slice(0, -1) : ring
  if (pts.length === 0) throw new Error('polygon ring is empty')
  const n = pts.length
  return [
    pts.reduce((s, p) => s + p[0], 0) / n,
    pts.reduce((s, p) => s + p[1], 0) / n,
  ]
}

/**
 * 用 Shoelace 公式估算 WGS84 polygon 面積（㎡）。
 * 因使用角度座標，精確度約 ±5%，僅供參考。
 */
function estimateAreaM2(ring: number[][]): number {
  const R = 6_371_000   // 地球半徑（公尺）
  const toRad = (d: number) => (d * Math.PI) / 180
  const pts = (ring.at(-1)?.[0] === ring[0][0] && ring.at(-1)?.[1] === ring[0][1])
    ? ring.slice(0, -1) : ring
  if (pts.length < 3) return 0
  let area = 0
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length
    const xi = toRad(pts[i][0]), yi = toRad(pts[i][1])
    const xj = toRad(pts[j][0]), yj = toRad(pts[j][1])
    area += (xj - xi) * (2 + Math.sin(yi) + Math.sin(yj))
  }
  return Math.abs(area * R * R / 2)
}

function extractAreaFromGeometry(
  geometry: { type: string; coordinates: unknown }
): number {
  try {
    if (geometry.type === 'MultiPolygon') {
      const rings = (geometry.coordinates as number[][][][])
      return rings.reduce((sum, poly) => sum + estimateAreaM2(poly[0]), 0)
    }
    if (geometry.type === 'Polygon') {
      return estimateAreaM2((geometry.coordinates as number[][][])[0])
    }
  } catch { /* ignore */ }
  return 0
}

/** 正規化行政區名稱（無/有「區」字） */
function normalizeDistrict(d: string): string {
  return d.endsWith('區') || d.endsWith('市') || d.endsWith('鎮') || d.endsWith('鄉')
    ? d : d + '區'
}

// ─── 主要查詢函式 ──────────────────────────────────────────────────

/**
 * 依地號查詢 twland.ronny.tw，取得 WGS84 座標與地籍面積。
 *
 * ⚠ 僅供 Server-side 呼叫（Next.js API Route），無 CORS 問題。
 * ⚠ 資料為 2015 年前，新劃設地段可能查無。
 */
export async function queryTwland(input: TwlandInput): Promise<TwlandResult> {
  const county      = normalizeCounty(input.county)
  // 格式：縣市,地段,地號（無行政區）
  const landsVal    = `${county},${input.section},${input.number}`
  const url         = `${TWLAND_BASE}?lands[]=${encodeURIComponent(landsVal)}`

  // ── fetch with timeout ─────────────────────────────────────────
  let res: Response
  try {
    const ctrl  = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT)
    res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        Accept:       'application/json, */*',
        'User-Agent': 'youngfeng-ai-checker/1.0 (internal tool)',
        Referer:      'https://twland.ronny.tw/',
      },
    })
    clearTimeout(timer)
  } catch (e: unknown) {
    const msg      = e instanceof Error ? e.message : String(e)
    const timeout  = msg.includes('abort') || msg.includes('signal')
    return {
      ok: false,
      error: timeout
        ? `twland 查詢逾時（>${FETCH_TIMEOUT / 1000}s），請稍後再試`
        : `無法連線至 twland.ronny.tw：${msg}`,
      formattedQuery: landsVal,
    }
  }

  if (!res.ok) {
    return {
      ok: false,
      error: `twland 回傳 HTTP ${res.status}`,
      formattedQuery: landsVal,
    }
  }

  // ── 解析 GeoJSON ───────────────────────────────────────────────
  let json: unknown
  try { json = await res.json() }
  catch {
    return { ok: false, error: 'twland 回傳非 JSON', formattedQuery: landsVal }
  }

  const fc = json as { type?: string; features?: unknown[]; notfound?: unknown[] }
  if (fc?.type !== 'FeatureCollection' || !Array.isArray(fc.features)) {
    return {
      ok: false,
      error: `twland 回傳非預期格式（type=${String(fc?.type)}）`,
      formattedQuery: landsVal,
    }
  }

  if (fc.features.length === 0) {
    // notfound 欄位提供更多說明
    const nf = Array.isArray(fc.notfound) && fc.notfound.length > 0
      ? (fc.notfound[0] as { message?: string }).message ?? ''
      : ''
    return {
      ok: false,
      error: [
        `twland 查無「${county} ${input.district} ${input.section} ${input.number}號」。`,
        nf ? `（twland 說明：${nf}）` : '',
        '可能原因：① 地段為 2015 年後新劃設（twland 資料截至 2015 年前）',
        '② 地號或地段名稱有誤，請確認。',
      ].filter(Boolean).join(' '),
      formattedQuery: landsVal,
    }
  }

  // ── 選取最佳 Feature（優先選行政區相符者）──────────────────────
  const districtNorm = normalizeDistrict(input.district)
  type Feat = {
    geometry?: { type: string; coordinates: unknown }
    properties?: Record<string, unknown>
  }
  const feats = fc.features as Feat[]

  const matched = feats.find(f => {
    const town = String(f.properties?.['鄉鎮'] ?? '')
    return normalizeDistrict(town) === districtNorm
  }) ?? feats[0]   // fallback: 第一筆

  if (!matched?.geometry) {
    return { ok: false, error: 'twland Feature 無幾何資料', formattedQuery: landsVal }
  }

  const props          = matched.properties ?? {}
  const matchedTown    = String(props['鄉鎮'] ?? '')
  const districtMismatch = normalizeDistrict(matchedTown) !== districtNorm

  // ── 座標（優先用 twland 預算的 xcenter/ycenter）────────────────
  let coordinate: [number, number]
  try {
    const fromProps = extractCentroidFromProps(props)
    coordinate = fromProps ?? centroidFromGeometry(matched.geometry)
  } catch (e) {
    return { ok: false, error: `座標提取失敗：${String(e)}`, formattedQuery: landsVal }
  }

  // ── 面積（從幾何 Polygon 估算）───────────────────────────────────
  const landArea = extractAreaFromGeometry(matched.geometry)

  return {
    ok: true,
    coordinate,
    landArea: Math.round(landArea),
    formattedQuery:   landsVal,
    featureCount:     feats.length,
    matchedDistrict:  matchedTown,
    districtMismatch,
    districtWarning: districtMismatch
      ? `twland 查到的「${input.section}」位於${matchedTown}，` +
        `非您輸入的${input.district}。` +
        `原因：twland 資料截至 2015 年前，${input.district}的${input.section}可能為 2015 年後新設，` +
        `或同段名分佈於不同鄉鎮。座標僅供參考，請以 158/LUZ 人工查證。`
      : null,
  }
}

// ─── Adapter 類別（供 AdapterRegistry 使用）────────────────────────

import type { GISAdapter, LandParcelInput, ZoningQueryResult } from './types'

export class TwlandParcelAdapter implements GISAdapter {
  readonly name        = 'TwlandParcelAdapter'
  readonly description = 'twland.ronny.tw — 地號轉 WGS84 座標（2015 年前地籍資料）'
  readonly priority    = 0

  isAvailable(): boolean {
    return typeof window === 'undefined'   // 僅 Server-side
  }

  async queryByParcel(parcel: LandParcelInput): Promise<ZoningQueryResult> {
    const r = await queryTwland({
      county:   parcel.county,
      district: parcel.district,
      section:  parcel.section,
      number:   parcel.number,
    })

    return {
      parcel,
      zoning: null,
      confidence: r.ok ? 'medium' : 'low',
      source: 'twland.ronny.tw',
      sourceUrl: 'https://twland.ronny.tw/',
      queryTime: new Date().toISOString(),
      error: r.ok
        ? '座標取得成功，請接續 queryByCoordinate 完成 PIP 查詢'
        : r.error,
    }
  }
}

export const twlandParcelAdapter = new TwlandParcelAdapter()
