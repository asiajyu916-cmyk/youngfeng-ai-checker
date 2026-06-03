/**
 * Point-in-Polygon 查詢（Phase 2）
 *
 * 使用 @turf/boolean-point-in-polygon 進行準確的 GeoJSON polygon 落點判斷。
 * 資料來源：zoningStore（使用者匯入的 GeoJSON）
 *
 * 資料狀態：IMPORTED_GIS（須先透過 importPipeline 匯入才會有資料）
 */

import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import type { WGS84Coordinate, ZoningFeature, PIPResult } from './types'

/**
 * 將 ZoningFeature 幾何轉為 turf 可接受的 GeoJSON Feature<Polygon|MultiPolygon>
 */
function toTurfPolygon(feature: ZoningFeature) {
  return {
    type: 'Feature' as const,
    geometry: feature.geometry,
    properties: {},
  }
}

/**
 * Point-in-Polygon 查詢
 *
 * @param coordinate  WGS84 [longitude, latitude]
 * @param features    已匯入的 ZoningFeature[]（來自 zoningStore）
 * @returns PIPResult
 */
export function queryPointInPolygon(
  coordinate: WGS84Coordinate,
  features: ZoningFeature[],
): PIPResult {
  const t0 = performance.now()
  const turfPoint = {
    type: 'Feature' as const,
    geometry: {
      type: 'Point' as const,
      coordinates: coordinate,
    },
    properties: {},
  }

  const matched: ZoningFeature[] = []

  for (const feature of features) {
    try {
      const polygon = toTurfPolygon(feature)
      if (booleanPointInPolygon(turfPoint, polygon)) {
        matched.push(feature)
      }
    } catch {
      // 幾何資料異常，略過此 feature
    }
  }

  const queryMs = performance.now() - t0

  return {
    found: matched.length > 0,
    features: matched,
    coordinate,
    queryMs,
  }
}
