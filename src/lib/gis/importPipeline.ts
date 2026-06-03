/**
 * GeoJSON / SHP 匯入解析器
 *
 * 台中市都市計畫 GIS 資料（114年版）欄位對應表：
 *   GeoJSON 屬性名      → 系統欄位
 *   ─────────────────────────────────────
 *   ZONE_NAME / 使用分區  → zone_name
 *   ZONE_CODE / 分區代碼  → zone_short_name
 *   PLAN_NAME / 都計名稱  → urban_plan_name
 *   DETAIL_PLAN / 細計   → detail_plan_name
 *   BC_RATIO / 建蔽率     → coverage_ratio
 *   FAR / 容積率           → floor_area_ratio
 *   MAX_FAR / 上限容積    → max_far
 *   DISTRICT / 行政區     → district
 *   NOTE / 備註           → note
 *   ANNOUNCE_NO / 公告文號 → announcement_no
 *   PROJECT / 計畫案名    → project_name
 *
 * ⚠️  實際欄位名稱依台中市 OpenData 下載的 GeoJSON 為準，
 *     匯入前請確認 properties 欄位名稱並更新 FIELD_MAP。
 */

import type {
  GeoJSONFeatureCollection,
  GeoJSONFeature,
  ZoningFeature,
  ZoningProperties,
  ImportResult,
} from './types'

// ─── 欄位映射表（優先匹配第一個找到的欄位名）────────────────

const FIELD_MAP: Record<keyof ZoningProperties, string[]> = {
  district:         ['DISTRICT', 'district', '行政區', 'TOWN', 'town'],
  zone_name:        ['FIELD_A', 'ZONE_NAME', 'zoneName', '使用分區', 'ZONE', 'zone'],
  zone_short_name:  ['ZONE_CODE', 'zoneCode', '分區代碼', 'ZONE_SHORT', 'shortName'],
  urban_plan_name:  ['PLAN_NAME', 'planName', '都計名稱', 'URBAN_PLAN', 'urbanPlan'],
  detail_plan_name: ['DETAIL_PLAN', 'detailPlan', '細部計畫', 'DETAIL'],
  coverage_ratio:   ['FIELD_B', 'BC_RATIO', 'bcRatio', '建蔽率', 'COVERAGE', 'BC'],
  floor_area_ratio: ['FIELD_C', 'FAR', 'far', '容積率', 'FLOOR_AREA_RATIO', 'FAR_RATIO'],
  max_far:          ['MAX_FAR', 'maxFar', '上限容積', 'MAX_FAR_RATIO'],
  note:             ['NOTE', 'note', '備註', 'REMARK', 'remark'],
  announcement_no:  ['ANNOUNCE_NO', 'announceNo', '公告文號', 'ANNOUNCEMENT'],
  project_name:     ['PROJECT', 'projectName', '計畫案名', 'PROJECT_NAME'],
  source_file:      [], // 由程式填入，不從 GeoJSON 讀取
  imported_at:      [], // 由程式填入
}

/** 從 GeoJSON properties 物件中讀取欄位（不區分大小寫） */
function readField(
  props: Record<string, unknown>,
  candidates: string[]
): unknown {
  for (const key of candidates) {
    if (key in props) return props[key]
    // 不區分大小寫
    const found = Object.keys(props).find(k => k.toLowerCase() === key.toLowerCase())
    if (found) return props[found]
  }
  return undefined
}

function toNumber(v: unknown): number | undefined {
  if (v === null || v === undefined || v === '') return undefined
  const n = Number(v)
  return isNaN(n) ? undefined : n
}

function toString(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v).trim()
}

// ─── 單一 Feature 解析 ────────────────────────────────────────

function parseFeature(
  feature: GeoJSONFeature,
  index: number,
  sourceFile: string,
  importedAt: string,
): ZoningFeature | null {
  // 跳過無幾何資料
  if (!feature.geometry) return null
  const geomType = feature.geometry.type
  if (geomType !== 'Polygon' && geomType !== 'MultiPolygon') return null

  const p = feature.properties ?? {}

  // 必要條件：有有效的 Polygon 幾何即可匯入
  // 欄位若對應不到，以空字串或 0 補齊，不中斷匯入
  const zone_name       = toString(readField(p, FIELD_MAP.zone_name))
  const coverage_ratio  = toNumber(readField(p, FIELD_MAP.coverage_ratio))  ?? 0
  const floor_area_ratio= toNumber(readField(p, FIELD_MAP.floor_area_ratio)) ?? 0

  const properties: ZoningProperties = {
    district:         toString(readField(p, FIELD_MAP.district)) || '未知行政區',
    zone_name:        zone_name || '未知分區',
    zone_short_name:  toString(readField(p, FIELD_MAP.zone_short_name)) || zone_name || '—',
    urban_plan_name:  toString(readField(p, FIELD_MAP.urban_plan_name)) || '台中市都市計畫區',
    detail_plan_name: toString(readField(p, FIELD_MAP.detail_plan_name)) || '',
    coverage_ratio,
    floor_area_ratio,
    max_far:          toNumber(readField(p, FIELD_MAP.max_far)),
    note:             toString(readField(p, FIELD_MAP.note)) || undefined,
    announcement_no:  toString(readField(p, FIELD_MAP.announcement_no)) || undefined,
    project_name:     toString(readField(p, FIELD_MAP.project_name)) || undefined,
    source_file:      sourceFile,
    imported_at:      importedAt,
  }

  return {
    id: feature.id != null ? String(feature.id) : `f_${index}`,
    geometry: feature.geometry as ZoningFeature['geometry'],
    properties,
  }
}

// ─── 主匯入函數 ───────────────────────────────────────────────

/**
 * 解析 GeoJSON FeatureCollection → ZoningFeature[]
 *
 * @param geojson  已解析的 GeoJSON 物件（來自檔案 JSON.parse）
 * @param fileName 原始檔案名稱（記錄用）
 * @returns ImportResult + features
 */
/** 偵測第一筆 feature 中實際對應到哪個原始欄位名稱 */
function detectMappedField(
  props: Record<string, unknown>,
  candidates: string[],
): string | null {
  for (const key of candidates) {
    if (key in props) return key
    const found = Object.keys(props).find(k => k.toLowerCase() === key.toLowerCase())
    if (found) return found
  }
  return null
}

export function importGeoJSON(
  geojson: unknown,
  fileName: string,
): {
  result: ImportResult
  features: ZoningFeature[]
  /** 實際對應到的原始欄位名稱（用於 UI 顯示） */
  detectedFields: { zone_name: string | null; coverage_ratio: string | null; floor_area_ratio: string | null }
} {
  const importedAt = new Date().toISOString()
  const errors: string[] = []
  const noField = { zone_name: null, coverage_ratio: null, floor_area_ratio: null }

  // 格式驗證
  if (!geojson || typeof geojson !== 'object') {
    return {
      result: { success: false, featuresTotal: 0, featuresImported: 0,
        featuresSkipped: 0, errors: ['無效的 JSON 格式'], sourceFile: fileName, importedAt },
      features: [], detectedFields: noField,
    }
  }

  const collection = geojson as Record<string, unknown>
  if (collection.type !== 'FeatureCollection' || !Array.isArray(collection.features)) {
    return {
      result: { success: false, featuresTotal: 0, featuresImported: 0,
        featuresSkipped: 0, errors: ['非 FeatureCollection 格式'], sourceFile: fileName, importedAt },
      features: [], detectedFields: noField,
    }
  }

  const rawFeatures = (collection as unknown as GeoJSONFeatureCollection).features
  const featuresTotal = rawFeatures.length

  // 從第一筆 feature 偵測實際欄位名稱
  const firstProps = (rawFeatures[0] as GeoJSONFeature)?.properties ?? {}
  const detectedFields = {
    zone_name:       detectMappedField(firstProps, FIELD_MAP.zone_name),
    coverage_ratio:  detectMappedField(firstProps, FIELD_MAP.coverage_ratio),
    floor_area_ratio:detectMappedField(firstProps, FIELD_MAP.floor_area_ratio),
  }

  const parsed: ZoningFeature[] = []
  let skipped = 0

  rawFeatures.forEach((f, i) => {
    try {
      const feature = parseFeature(f, i, fileName, importedAt)
      if (feature) {
        parsed.push(feature)
      } else {
        skipped++
      }
    } catch (e) {
      skipped++
      errors.push(`Feature[${i}] 解析失敗：${String(e)}`)
    }
  })

  // 成功條件：只要有解析到至少一個 Polygon 即視為成功
  return {
    result: {
      success: parsed.length > 0,
      featuresTotal,
      featuresImported: parsed.length,
      featuresSkipped: skipped,
      errors,
      sourceFile: fileName,
      importedAt,
    },
    features: parsed,
    detectedFields,
  }
}

/**
 * 驗證 GeoJSON 欄位是否符合預期
 * 在實際匯入前可先呼叫此函數提示使用者欄位對應狀況
 */
export function previewFields(geojson: unknown): {
  detected: Partial<Record<keyof ZoningProperties, string>>
  missing: (keyof ZoningProperties)[]
  rawFields: string[]
} {
  const rawFields: string[] = []
  const detected: Partial<Record<keyof ZoningProperties, string>> = {}
  const missing: (keyof ZoningProperties)[] = []

  try {
    const collection = geojson as GeoJSONFeatureCollection
    const firstFeature = collection?.features?.[0]
    if (firstFeature?.properties) {
      rawFields.push(...Object.keys(firstFeature.properties))
      const p = firstFeature.properties as Record<string, unknown>
      for (const [field, candidates] of Object.entries(FIELD_MAP) as [keyof ZoningProperties, string[]][]) {
        if (candidates.length === 0) continue
        const found = candidates.find(c =>
          rawFields.some(r => r.toLowerCase() === c.toLowerCase())
        )
        if (found) {
          detected[field] = found
        } else {
          missing.push(field)
        }
      }
    }
  } catch (_) { /* ignore */ }

  return { detected, missing, rawFields }
}
