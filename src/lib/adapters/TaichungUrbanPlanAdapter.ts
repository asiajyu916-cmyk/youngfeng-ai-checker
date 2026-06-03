/**
 * TaichungUrbanPlanAdapter（Phase 4）
 *
 * 台中市都市計畫GIS資料介面
 * 資料來源：臺中市都市計畫圖GIS（114年版）
 * https://opendata.taichung.gov.tw/search/13717923-3e4b-4032-9072-3a51ab985883
 *
 * ─── 資料狀態說明 ────────────────────────────────────────────────
 * IMPORTED_GIS  — 使用者已匯入 GeoJSON，透過 PIP 查詢回傳真實分區
 * MOCK          — 尚未匯入 GeoJSON，isAvailable() 回傳 false
 *
 * ⚠️  本 Adapter 不再使用假資料表（zoningAreas.ts）。
 *     若 zoningStore 無匯入資料，此 Adapter isAvailable() = false，
 *     不會冒充真實資料。
 * ────────────────────────────────────────────────────────────────
 *
 * 查詢流程（Phase 4）：
 *   地號
 *   → NLSCParcelAdapter.parcelToCoordinate()   [Live API — /api/nlsc/parcel-coord]
 *   → 若轉換失敗，提示使用者手動輸入座標
 *   → queryPointInPolygon(coord, zoningFeatures)
 *   → 回傳 ZoningQueryResult（IMPORTED_GIS）
 */

import type { GISAdapter, LandParcelInput, ZoningQueryResult, ZoningArea } from './types'
import { loadZoningFeatures, hasImportedData } from '../gis/zoningStore'
import { queryPointInPolygon } from '../gis/pointInPolygon'
import type { WGS84Coordinate, ZoningProperties } from '../gis/types'
import { nlscParcelAdapter } from './NLSCParcelAdapter'

const SOURCE_NAME = '臺中市都市計畫圖GIS（114年）'
const SOURCE_URL  = 'https://opendata.taichung.gov.tw/search/13717923-3e4b-4032-9072-3a51ab985883'

/** 將匯入的 ZoningProperties 轉為 Adapter 層的 ZoningArea */
function toZoningArea(props: ZoningProperties, featureId: string): ZoningArea {
  return {
    id: featureId,
    district:         props.district,
    section:          '',                     // GeoJSON 通常沒有地段欄位，留空
    zone_name:        props.zone_name,
    zone_short_name:  props.zone_short_name,
    urban_plan_name:  props.urban_plan_name,
    detail_plan_name: props.detail_plan_name,
    coverage_ratio:   props.coverage_ratio,
    floor_area_ratio: props.floor_area_ratio,
    max_far:          props.max_far,
    note:             props.note,
    announcement_no:  props.announcement_no,
    project_name:     props.project_name,
    updated_at:       props.imported_at?.slice(0, 10) ?? '',
  }
}

export class TaichungUrbanPlanAdapter implements GISAdapter {
  readonly name = 'TaichungUrbanPlanAdapter'
  readonly description = '台中市都市計畫GIS — 使用分區、建蔽率、容積率（需匯入 GeoJSON）'
  readonly priority = 1

  /**
   * 可用性：zoningStore 中有已匯入的 GeoJSON 資料才返回 true
   * 未匯入時明確不可用，不會產生假資料。
   */
  isAvailable(): boolean {
    return hasImportedData()
  }

  /**
   * Phase 4 查詢流程：
   * 1. 嘗試 NLSC API 地號→座標（目前 stub，會回傳 ok:false）
   * 2. 若有座標 → PIP 查詢
   * 3. 若 NLSC 不可用 → 回傳明確錯誤，提示使用者用座標查詢
   */
  async queryByParcel(parcel: LandParcelInput): Promise<ZoningQueryResult> {
    const base = {
      parcel,
      source: SOURCE_NAME,
      sourceUrl: SOURCE_URL,
      queryTime: new Date().toISOString(),
    }

    // ── Step 1：地號 → 座標（NLSC API）──────────────────────────
    const coordResult = await nlscParcelAdapter.parcelToCoordinate({
      city:     parcel.county,
      district: parcel.district,
      section:  parcel.section,
      parcelNo: parcel.number,
    })

    if (!coordResult.ok) {
      return {
        ...base,
        zoning: null,
        confidence: 'low',
        error: [
          `地號轉座標失敗（${coordResult.error}）`,
          '請改用「座標查詢」功能直接輸入 WGS84 座標進行分區查詢。',
        ].join(' '),
      }
    }

    // ── Step 2：座標 → PIP 查詢 ──────────────────────────────────
    return this.queryByCoordinate(coordResult.coordinate, parcel)
  }

  /**
   * 直接以座標查詢（給 LandQueryView 提供獨立入口）
   * 資料狀態：IMPORTED_GIS
   */
  async queryByCoordinate(
    coordinate: WGS84Coordinate,
    parcel?: LandParcelInput,
  ): Promise<ZoningQueryResult> {
    const features = await loadZoningFeatures()
    const base = {
      parcel: parcel ?? { county: '', district: '', section: '', number: '' },
      source: SOURCE_NAME,
      sourceUrl: SOURCE_URL,
      queryTime: new Date().toISOString(),
    }

    const pip = queryPointInPolygon(coordinate, features)

    if (!pip.found || pip.features.length === 0) {
      return {
        ...base,
        zoning: null,
        confidence: 'low',
        error: `座標 [${coordinate[1].toFixed(6)}, ${coordinate[0].toFixed(6)}] 未落在任何已匯入的分區 Polygon 內。請確認 GeoJSON 涵蓋範圍是否包含此座標。`,
      }
    }

    // 通常只有 1 個分區；若疊加取第一筆
    const best = pip.features[0]
    const zoning = toZoningArea(best.properties, best.id)

    return {
      ...base,
      zoning,
      confidence: 'high',
    }
  }
}
