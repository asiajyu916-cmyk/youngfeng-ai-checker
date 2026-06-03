// ─── 地區架構型別 ──────────────────────────────────────────────

export interface UrbanDesignThreshold {
  required: number
  manualReview: number
  isIndependent: boolean
  authority: string
  note?: string
}

export interface FarBonusRules {
  committeeThreshold: number
  maxTotalBonus: number
  note?: string
}

export interface ZoningRule {
  zoneType: string
  maxBuildingCoverage: number
  maxFar: number
  maxHeight?: number
  notes?: string
}

export interface PlanArea {
  id: string
  name: string
  shortName: string
  description: string
  districts: string[]
  urbanDesign: UrbanDesignThreshold
  farBonus: FarBonusRules
  zoningRules: ZoningRule[]
  specialRules: string[]
  appliesGeneralZoning: boolean
  ruleVersion: string
  effectiveDate: string
}

export type SpecialZoneType =
  | 'urban_design'
  | 'water_nan'
  | 'far_transfer_restriction'
  | 'hsr_special'
  | 'mrt_station'
  | 'cultural_heritage'
  | 'hillside'
  | 'geological_sensitive'

export interface SpecialZone {
  id: string
  type: SpecialZoneType
  name: string
  description: string
  triggeredModules: string[]
  notes: string
}

// ─── 輸入資料 ─────────────────────────────────────────────────

export interface BuildingInput {
  district: string
  planAreaId: string
  specialZoneIds: string[]
  zoneType: string
  landArea: number
  buildingUse: string
  buildingOwnership: 'public' | 'private'
  floorsAbove: number
  floorsBelow: number
  heightM: number
  totalFloorArea: number
  residentialUnits: number
  isHazardRebuild: boolean
  isFarTransfer: boolean
  isOpenSpace: boolean
}

// ─── 檢核結果型別 ──────────────────────────────────────────────

export type CheckStatus = 'required' | 'conditional' | 'manual_review' | 'not_required'

export interface CheckResult {
  moduleCode: string
  moduleName: string
  status: CheckStatus
  triggerReason: string
  legalBasis: string[]
  priority: 1 | 2 | 3
  notes?: string
}

export interface RulesetInfo {
  planAreaId: string
  planAreaName: string
  planAreaShortName: string
  district: string
  urbanDesignThresholdRequired: number
  urbanDesignAuthority: string
  isIndependentUDReview: boolean
  specialZonesApplied: string[]
  appliesGeneralZoning: boolean
  ruleVersion: string
}

export interface CheckReport {
  required: CheckResult[]
  conditional: CheckResult[]
  manualReview: CheckResult[]
  notRequired: CheckResult[]
  rulesetInfo: RulesetInfo
  generatedAt: string
  inputSummary: BuildingInput
}

// ─── V2：地號查詢 ──────────────────────────────────────────────

export interface LandParcel {
  city: string
  district: string
  section: string     // 地段
  number: string      // 地號
  area: number        // 地號面積（㎡）
  // 用途管制
  zoneType: string
  subZoneType?: string
  maxBuildingCoverage: number
  maxFar: number
  maxHeightM?: number
  // 計畫區歸屬
  planAreaId: string
  planAreaName: string
  // 特殊管制疊加
  overlayZones: string[]
  // 都審
  urbanDesignRequired: boolean
  urbanDesignAuthority: string
  // 環境條件
  isHillside: boolean
  isGeologicalSensitive: boolean
  isCulturalHeritage: boolean
  isFloodRisk: boolean
  // 備註
  notes: string[]
  dataSource: string
  lastUpdated: string
}

export interface LandQueryResult {
  query: {
    city: string
    district: string
    section: string
    number: string
  }
  found: boolean
  parcel?: LandParcel
  nearbyParcels?: LandParcel[]
  message?: string
}

// ─── V2：AI 法規助理 ───────────────────────────────────────────

export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  relatedModules?: string[]
  relatedLaws?: string[]
}

export interface AIAssistantState {
  messages: AIMessage[]
  isTyping: boolean
  suggestedQuestions: string[]
}

// ─── V2：儀表板統計 ───────────────────────────────────────────

export interface MonthlyCheckStat {
  month: string
  count: number
  required: number
  manualReview: number
}

export interface TopTriggerStat {
  moduleCode: string
  moduleName: string
  count: number
  percentage: number
}

export interface CaseStatusStat {
  status: string
  label: string
  count: number
  color: string
}

export interface DashboardStats {
  thisMonth: {
    cases: number
    checks: number
    manualReviews: number
    regulationUpdates: number
  }
  monthlyTrend: MonthlyCheckStat[]
  topTriggers: TopTriggerStat[]
  caseStatus: CaseStatusStat[]
  recentCases: RecentCase[]
}

export interface RecentCase {
  id: string
  name: string
  district: string
  buildingUse: string
  checkedAt: string
  status: 'in_progress' | 'pending_review' | 'completed' | 'approved'
  requiredCount: number
  manualReviewCount: number
}

// ─── V2：案件管理 ─────────────────────────────────────────────

export type AppView =
  | 'dashboard'
  | 'check'
  | 'cases'
  | 'history'
  | 'land_query'
  | 'zoning_rules'
  | 'regulation_db'
  | 'article_search'
  | 'related_laws'
  | 'ai_rulings'
  | 'ai_assistant'
  | 'version_mgmt'
  | 'rule_engine'
  | 'user_mgmt'
