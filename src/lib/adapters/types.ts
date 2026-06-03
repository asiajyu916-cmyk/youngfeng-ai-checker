/**
 * GIS Adapter 共用型別定義
 *
 * 架構：
 *   使用者輸入地號
 *   → AdapterRegistry 查詢所有可用 Adapter
 *   → 各 Adapter 返回 ZoningQueryResult
 *   → 系統選用最高信心度結果帶入 Rule Engine
 */

// ─── 地號輸入 ──────────────────────────────────────────────────

export interface LandParcelInput {
  county: string     // 縣市（目前固定：台中市）
  district: string   // 行政區
  section: string    // 地段
  number: string     // 地號（例：123-5）
}

// ─── 使用分區資料（對應 zoning_areas 資料表）──────────────────

export interface ZoningArea {
  id: string
  district: string           // 行政區
  section: string            // 地段名稱
  zone_name: string          // 使用分區全名（例：第三種住宅區）
  zone_short_name: string    // 分區簡稱（例：住三）
  urban_plan_name: string    // 都市計畫區名稱
  detail_plan_name: string   // 細部計畫區名稱
  coverage_ratio: number     // 建蔽率 % (e.g., 50)
  floor_area_ratio: number   // 容積率 % (e.g., 180)
  max_far?: number           // 上限容積 %（含獎勵上限）
  note?: string              // 備註
  announcement_no?: string   // 公告文號
  project_name?: string      // 計畫案名
  updated_at: string         // 資料更新日期 YYYY-MM-DD

  // 衍生欄位（供 Rule Engine 使用）
  suggested_plan_area_id?: string  // 對應 regionRules 的 planAreaId
  suggested_zone_type?: string     // 對應 ZONE_TYPES 的代碼（住三、商二…）
}

// ─── 查詢結果 ─────────────────────────────────────────────────

export type QueryConfidence = 'high' | 'medium' | 'low' | 'mock'

export interface ZoningQueryResult {
  parcel: LandParcelInput
  zoning: ZoningArea | null       // null = 查無資料
  confidence: QueryConfidence
  source: string                  // 資料來源名稱
  sourceUrl?: string              // 資料來源連結
  queryTime: string               // ISO 格式查詢時間
  error?: string                  // 錯誤訊息（若查詢失敗）
}

// ─── Adapter 介面 ─────────────────────────────────────────────

export interface GISAdapter {
  /** Adapter 識別名稱 */
  readonly name: string
  /** Adapter 說明 */
  readonly description: string
  /** 資料來源優先權（數字越小越優先） */
  readonly priority: number

  /** 查詢可用性（API 未設定時返回 false） */
  isAvailable(): boolean

  /** 依地號查詢使用分區 */
  queryByParcel(parcel: LandParcelInput): Promise<ZoningQueryResult>
}
