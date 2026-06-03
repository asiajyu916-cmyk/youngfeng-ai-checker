/**
 * GIS 核心型別定義
 *
 * 資料來源狀態說明：
 *   MOCK         — 系統內建假資料，僅供 UI 開發展示
 *   IMPORTED_GIS — 使用者已匯入正式 GeoJSON/SHP 檔案，資料來自台中市 OpenData
 *   LIVE_API     — 即時呼叫外部 API（目前尚未整合任何 Live API）
 */

// ─── 資料來源狀態 ──────────────────────────────────────────────

export type DataSourceStatus = 'MOCK' | 'IMPORTED_GIS' | 'LIVE_API'

export interface DataSourceLabel {
  status: DataSourceStatus
  label: string        // 顯示文字
  color: string        // Tailwind text color
  bg: string           // Tailwind bg color
  border: string       // Tailwind border color
  description: string  // 詳細說明
}

export const DATA_SOURCE_LABELS: Record<DataSourceStatus, DataSourceLabel> = {
  MOCK: {
    status: 'MOCK',
    label: 'Mock 資料',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    description: '系統內建測試資料，非真實查詢結果，請勿用於正式建築設計。',
  },
  IMPORTED_GIS: {
    status: 'IMPORTED_GIS',
    label: '已匯入 GIS',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    description: '資料來自台中市都市計畫圖 GIS（114年版），經 GeoJSON 匯入本機。',
  },
  LIVE_API: {
    status: 'LIVE_API',
    label: 'Live API',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    description: '即時查詢政府開放資料 API。',
  },
}

// ─── 座標 ─────────────────────────────────────────────────────

/** WGS84 座標 [經度, 緯度] */
export type WGS84Coordinate = [longitude: number, latitude: number]

/** TWD97 座標（台灣政府地籍系統慣用，需轉換至 WGS84 才能做 GeoJSON PIP） */
export type TWD97Coordinate = [easting: number, northing: number]

// ─── 使用分區 Feature ─────────────────────────────────────────

/** 標準化後的使用分區 polygon，來自匯入的 GeoJSON */
export interface ZoningFeature {
  id: string
  /** GeoJSON Polygon/MultiPolygon 幾何資料（WGS84） */
  geometry: GeoJSONPolygon | GeoJSONMultiPolygon
  /** 屬性資料 */
  properties: ZoningProperties
}

export interface ZoningProperties {
  district: string           // 行政區
  zone_name: string          // 使用分區全名
  zone_short_name: string    // 分區簡稱
  urban_plan_name: string    // 都市計畫區名稱
  detail_plan_name: string   // 細部計畫區名稱
  coverage_ratio: number     // 建蔽率 %
  floor_area_ratio: number   // 容積率 %
  max_far?: number           // 上限容積 %
  note?: string
  announcement_no?: string
  project_name?: string
  source_file?: string       // 匯入來源檔名
  imported_at?: string       // 匯入時間 ISO
}

// ─── 簡化 GeoJSON 型別 ────────────────────────────────────────

export interface GeoJSONPolygon {
  type: 'Polygon'
  coordinates: WGS84Coordinate[][]  // rings: [exterior, ...holes]
}

export interface GeoJSONMultiPolygon {
  type: 'MultiPolygon'
  coordinates: WGS84Coordinate[][][]
}

export interface GeoJSONFeature {
  type: 'Feature'
  id?: string | number
  geometry: GeoJSONPolygon | GeoJSONMultiPolygon | null
  properties: Record<string, unknown>
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

// ─── 匯入結果 ─────────────────────────────────────────────────

export interface ImportResult {
  success: boolean
  featuresTotal: number      // 原始 Feature 數量
  featuresImported: number   // 成功解析數量
  featuresSkipped: number    // 跳過（幾何無效、屬性缺失）
  errors: string[]           // 解析錯誤訊息
  sourceFile: string
  importedAt: string
}

// ─── PIP 查詢結果 ─────────────────────────────────────────────

export interface PIPResult {
  found: boolean
  features: ZoningFeature[]   // 落點所在的所有分區（通常為 1）
  coordinate: WGS84Coordinate
  queryMs: number
}
