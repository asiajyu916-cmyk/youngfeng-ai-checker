import type { PlanArea, SpecialZone } from '@/types'

// ─── 台中市行政區（29 區）────────────────────────────────────

export const TAICHUNG_DISTRICTS = [
  '中區', '東區', '南區', '西區', '北區',
  '西屯區', '南屯區', '北屯區',
  '豐原區', '后里區', '石岡區', '東勢區', '和平區',
  '新社區', '潭子區', '大雅區', '神岡區',
  '大肚區', '沙鹿區', '龍井區', '梧棲區',
  '清水區', '大甲區', '外埔區', '大安區',
  '烏日區', '大里區', '太平區', '霧峰區',
] as const

export type TaichungDistrict = (typeof TAICHUNG_DISTRICTS)[number]

// ─── 使用分區列表 ─────────────────────────────────────────────

export const ZONE_TYPES = [
  '住一', '住二', '住三', '住四', '住五',
  '商一', '商二', '商三', '商四',
  '工業區', '行政區', '文教區', '農業區', '其他',
] as const

// ─── 建築用途列表 ─────────────────────────────────────────────

export const BUILDING_USES = [
  '住宅', '集合住宅', '住商混合', '住辦混合',
  '辦公', '商業', '旅館', '醫療', '學校',
  '政府機關', '倉儲', '工廠', '其他',
] as const

// ─── 都市計畫區 Mock Data ─────────────────────────────────────

export const PLAN_AREAS: PlanArea[] = [
  // ── 1. 一般台中市都市計畫區 ──────────────────────────────
  {
    id: 'general_taichung',
    name: '台中市都市計畫區（一般）',
    shortName: '一般都計區',
    description: '適用台中市一般都市計畫管制規定，涵蓋大部分行政區之一般住商工業用地',
    districts: [
      '中區', '東區', '南區', '西區', '北區',
      '西屯區', '南屯區', '北屯區',
      '潭子區', '大雅區', '神岡區',
      '大肚區', '沙鹿區', '龍井區', '梧棲區',
      '烏日區', '大里區', '太平區', '霧峰區',
    ],
    urbanDesign: {
      required: 3000,
      manualReview: 1000,
      isIndependent: false,
      authority: '台中市政府都市發展局',
      note: '依台中市都市設計審議辦法，位於管制範圍且達3,000㎡者需送審',
    },
    farBonus: {
      committeeThreshold: 1.30,
      maxTotalBonus: 1.50,
      note: '容積獎勵加總超過法定容積130%需提都委會審議',
    },
    zoningRules: [
      { zoneType: '住一', maxBuildingCoverage: 40, maxFar: 80 },
      { zoneType: '住二', maxBuildingCoverage: 50, maxFar: 120 },
      { zoneType: '住三', maxBuildingCoverage: 50, maxFar: 180 },
      { zoneType: '住四', maxBuildingCoverage: 50, maxFar: 240 },
      { zoneType: '住五', maxBuildingCoverage: 50, maxFar: 300 },
      { zoneType: '商一', maxBuildingCoverage: 60, maxFar: 240 },
      { zoneType: '商二', maxBuildingCoverage: 60, maxFar: 360 },
      { zoneType: '商三', maxBuildingCoverage: 60, maxFar: 480 },
      { zoneType: '商四', maxBuildingCoverage: 60, maxFar: 560 },
      { zoneType: '工業區', maxBuildingCoverage: 70, maxFar: 300 },
    ],
    specialRules: [
      '依台中市土地使用分區管制自治條例辦理',
      '部分地區另有細部計畫管制，需個別查詢',
    ],
    appliesGeneralZoning: true,
    ruleVersion: 'V1.0',
    effectiveDate: '2024-01-01',
  },

  // ── 2. 水湳經貿園區 ──────────────────────────────────────
  {
    id: 'water_nan',
    name: '水湳經貿園區特定區',
    shortName: '水湳園區',
    description: '台中市西屯區水湳地區特定區計畫，採獨立審議機制，有別於一般台中市都市計畫規定',
    districts: ['西屯區'],
    urbanDesign: {
      required: 0,
      manualReview: 0,
      isIndependent: true,
      authority: '台中市政府都市發展局（水湳專案辦公室）',
      note: '水湳園區所有開發案均需辦理水湳都市設計審議，無面積門檻限制',
    },
    farBonus: {
      committeeThreshold: 1.20,
      maxTotalBonus: 1.40,
      note: '水湳園區容積獎勵上限依特定區計畫規定，另有綠建築強制要求',
    },
    zoningRules: [
      {
        zoneType: '商業核心區',
        maxBuildingCoverage: 60,
        maxFar: 400,
        notes: '水湳商業核心區，需符合水湳都市設計準則',
      },
      {
        zoneType: '商務辦公區',
        maxBuildingCoverage: 55,
        maxFar: 350,
        notes: '水湳商務辦公區',
      },
      {
        zoneType: '住宅區',
        maxBuildingCoverage: 45,
        maxFar: 250,
        notes: '水湳住宅區，公設比規定另有規範',
      },
      {
        zoneType: '創新研發區',
        maxBuildingCoverage: 50,
        maxFar: 300,
        notes: '水湳創新研發區',
      },
    ],
    specialRules: [
      '不適用一般台中市土地使用分區管制自治條例',
      '建蔽率、容積率依水湳特定區計畫書規定',
      '所有案件均需辦理水湳都審，無面積門檻',
      '建築外觀需符合水湳都市設計準則（國際商務形象）',
      '部分分區要求取得綠建築標章',
      '地下室出入口位置有特別管制',
    ],
    appliesGeneralZoning: false,
    ruleVersion: 'V1.0',
    effectiveDate: '2024-01-01',
  },

  // ── 3. 七期重劃區 ─────────────────────────────────────────
  {
    id: 'seventh_phase',
    name: '台中市第七期市地重劃區',
    shortName: '七期重劃區',
    description: '位於台中市西屯區、南屯區交界，為台中市高端商業住宅精華區，景觀管制嚴格，都審門檻較一般都計區低',
    districts: ['西屯區', '南屯區'],
    urbanDesign: {
      required: 1500,
      manualReview: 500,
      isIndependent: false,
      authority: '台中市政府都市發展局',
      note: '七期重劃區都審門檻較一般都計區低（1,500㎡），景觀計畫要求嚴格',
    },
    farBonus: {
      committeeThreshold: 1.30,
      maxTotalBonus: 1.50,
      note: '同一般都計規定，但七期地價高，容積移轉換算量較少',
    },
    zoningRules: [
      {
        zoneType: '住三',
        maxBuildingCoverage: 50,
        maxFar: 180,
        notes: '七期住三，鄰近公園有額外景觀退縮要求',
      },
      {
        zoneType: '住四',
        maxBuildingCoverage: 50,
        maxFar: 240,
        notes: '七期住四',
      },
      {
        zoneType: '商三',
        maxBuildingCoverage: 60,
        maxFar: 480,
        notes: '七期商三，建築量體及外觀需符合七期都市設計準則',
      },
      {
        zoneType: '商四',
        maxBuildingCoverage: 60,
        maxFar: 560,
        notes: '七期商四，高層建築林立，視覺走廊管制',
      },
    ],
    specialRules: [
      '適用台中市土地使用分區管制自治條例，但有額外景觀管制',
      '都審門檻：1,500㎡（低於一般台中市都計區3,000㎡）',
      '建築外觀、材料、色彩有嚴格規定，需符合七期都市設計準則',
      '部分路段有視覺走廊管制，限制建築高度',
      '臨公園基地有額外退縮規定',
    ],
    appliesGeneralZoning: true,
    ruleVersion: 'V1.0',
    effectiveDate: '2024-01-01',
  },

  // ── 4. 單元重劃區 ─────────────────────────────────────────
  {
    id: 'unit_redevelopment',
    name: '台中市單元開發區（市地重劃）',
    shortName: '單元重劃區',
    description: '台中市各行政區辦理市地重劃之單元開發地區，依各單元計畫書規定，都審門檻及特別管制依各單元不同',
    districts: [
      '北屯區', '南屯區', '西屯區',
      '大里區', '太平區', '烏日區',
      '潭子區', '大雅區',
    ],
    urbanDesign: {
      required: 2000,
      manualReview: 800,
      isIndependent: false,
      authority: '台中市政府都市發展局',
      note: '單元重劃區都審門檻通常為2,000㎡，但各單元可能不同，需個別查詢',
    },
    farBonus: {
      committeeThreshold: 1.30,
      maxTotalBonus: 1.50,
      note: '依一般都市計畫規定，各單元可能有獨立容積獎勵辦法',
    },
    zoningRules: [
      {
        zoneType: '住三',
        maxBuildingCoverage: 50,
        maxFar: 180,
        notes: '依各單元計畫書規定',
      },
      {
        zoneType: '住四',
        maxBuildingCoverage: 50,
        maxFar: 240,
        notes: '依各單元計畫書規定',
      },
      {
        zoneType: '商三',
        maxBuildingCoverage: 60,
        maxFar: 480,
        notes: '依各單元計畫書規定',
      },
    ],
    specialRules: [
      '適用台中市土地使用分區管制自治條例',
      '都審門檻：2,000㎡（各單元可能不同，需查詢各單元計畫書）',
      '各單元計畫書可能有額外退縮、景觀、停車等管制規定',
      '建議查詢所在單元之計畫書確認詳細規定',
    ],
    appliesGeneralZoning: true,
    ruleVersion: 'V1.0',
    effectiveDate: '2024-01-01',
  },

  // ── 5. 豐原都市計畫區 ────────────────────────────────────
  {
    id: 'fengyuan',
    name: '豐原都市計畫區',
    shortName: '豐原都計區',
    description: '台中市豐原區都市計畫範圍',
    districts: ['豐原區', '后里區', '石岡區', '新社區'],
    urbanDesign: {
      required: 3000,
      manualReview: 1000,
      isIndependent: false,
      authority: '台中市政府都市發展局',
    },
    farBonus: {
      committeeThreshold: 1.30,
      maxTotalBonus: 1.50,
    },
    zoningRules: [
      { zoneType: '住三', maxBuildingCoverage: 50, maxFar: 180 },
      { zoneType: '商三', maxBuildingCoverage: 60, maxFar: 480 },
    ],
    specialRules: ['依豐原都市計畫書規定'],
    appliesGeneralZoning: true,
    ruleVersion: 'V1.0',
    effectiveDate: '2024-01-01',
  },

  // ── 6. 大里都市計畫區 ────────────────────────────────────
  {
    id: 'dali',
    name: '大里都市計畫區',
    shortName: '大里都計區',
    description: '台中市大里區都市計畫範圍',
    districts: ['大里區', '霧峰區'],
    urbanDesign: {
      required: 3000,
      manualReview: 1000,
      isIndependent: false,
      authority: '台中市政府都市發展局',
    },
    farBonus: {
      committeeThreshold: 1.30,
      maxTotalBonus: 1.50,
    },
    zoningRules: [
      { zoneType: '住三', maxBuildingCoverage: 50, maxFar: 180 },
      { zoneType: '商三', maxBuildingCoverage: 60, maxFar: 480 },
    ],
    specialRules: ['依大里都市計畫書規定'],
    appliesGeneralZoning: true,
    ruleVersion: 'V1.0',
    effectiveDate: '2024-01-01',
  },
]

// ─── 特殊管制區 Mock Data ─────────────────────────────────────

export const SPECIAL_ZONES: SpecialZone[] = [
  {
    id: 'urban_design',
    type: 'urban_design',
    name: '都市設計審議管制區',
    description: '位於台中市都市設計審議管制範圍，依所在計畫區適用不同都審門檻',
    triggeredModules: ['MOD_02'],
    notes: '需確認所屬管制分區及門檻，向台中市都市發展局查詢',
  },
  {
    id: 'water_nan',
    type: 'water_nan',
    name: '水湳經貿園區',
    description: '台中市水湳經貿園區特定區計畫範圍，採獨立審議機制',
    triggeredModules: ['MOD_03'],
    notes: '水湳都審取代一般台中市都審，建蔽率容積率依水湳特定區計畫',
  },
  {
    id: 'far_transfer_restriction',
    type: 'far_transfer_restriction',
    name: '容積移轉限制區',
    description: '部分地區對容積移轉有特別限制或條件',
    triggeredModules: ['MOD_09'],
    notes: '需向台中市都市發展局確認是否有容積移轉限制',
  },
  {
    id: 'hsr_special',
    type: 'hsr_special',
    name: '高鐵特定區',
    description: '台中高鐵站周邊特定區計畫範圍（烏日區）',
    triggeredModules: [],
    notes: '依高鐵特定區計畫書規定，建蔽率容積率另有規定，需人工確認',
  },
  {
    id: 'mrt_station',
    type: 'mrt_station',
    name: '捷運場站周邊',
    description: '台中捷運場站500公尺範圍內，可能有容積獎勵',
    triggeredModules: [],
    notes: '可申請捷運場站周邊容積獎勵，需查閱台中市大眾捷運系統土地開發辦法',
  },
  {
    id: 'cultural_heritage',
    type: 'cultural_heritage',
    name: '文化資產保存範圍',
    description: '古蹟、歷史建築、文化景觀周邊保存範圍',
    triggeredModules: [],
    notes: '需取得文化局同意，並符合文化資產保存法規定',
  },
  {
    id: 'hillside',
    type: 'hillside',
    name: '山坡地',
    description: '建築基地位於山坡地範圍',
    triggeredModules: [],
    notes: '需符合山坡地建築管理辦法，可能需辦理水土保持計畫',
  },
  {
    id: 'geological_sensitive',
    type: 'geological_sensitive',
    name: '地質敏感區',
    description: '地質法公告之地質敏感區（活動斷層、山崩及地滑等）',
    triggeredModules: [],
    notes: '需辦理基地地質調查及安全評估，取得地質調查報告',
  },
]

// ─── 查詢輔助函式 ─────────────────────────────────────────────

export function getPlanAreaById(id: string): PlanArea | undefined {
  return PLAN_AREAS.find((p) => p.id === id)
}

export function getSpecialZoneById(id: string): SpecialZone | undefined {
  return SPECIAL_ZONES.find((z) => z.id === id)
}

export function getPlanAreasByDistrict(district: string): PlanArea[] {
  if (!district) return PLAN_AREAS
  return PLAN_AREAS.filter((p) => p.districts.includes(district))
}

export function getZoningRule(planArea: PlanArea, zoneType: string) {
  return planArea.zoningRules.find((r) => r.zoneType === zoneType)
}

/**
 * 由 zoning_rules.db 的 urban_plan_name 推導 PlanArea ID
 * 用於 Rule Engine 在不需要使用者選擇 planAreaId 的情況下自動對應。
 *
 * 邏輯：跳過 general_taichung，找第一個 shortName 關鍵字包含於計畫名稱的 PlanArea；
 * 若找不到則回傳 'general_taichung'。
 */
export function resolvePlanAreaIdFromName(urbanPlanName: string): string {
  if (!urbanPlanName) return ''
  for (const p of PLAN_AREAS) {
    if (p.id === 'general_taichung') continue
    const key = p.shortName
      .replace('都計區', '').replace('重劃區', '').replace('園區', '').trim()
    if (key && urbanPlanName.includes(key)) return p.id
  }
  return 'general_taichung'
}
