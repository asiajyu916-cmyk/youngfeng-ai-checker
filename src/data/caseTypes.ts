// ─── 案件類型設定 ──────────────────────────────────────────────
// 每種案件類型定義：
//   baseModules    — 此類型「必辦」法規模組（自動觸發）
//   conditionalHints — 依基地條件、面積、樓層額外觸發的模組提示

export interface ModuleTag {
  code: string
  name: string
  reason: string   // 必辦原因 / 觸發條件
}

export interface CaseTypeConfig {
  id: string
  label: string
  icon: string
  description: string
  defaultBuildingUse: string
  buildingUseOptions: string[]
  baseModules: ModuleTag[]
  conditionalHints: ModuleTag[]
}

export const CASE_TYPES: CaseTypeConfig[] = [
  // ── 1. 集合住宅 ─────────────────────────────────────────────
  {
    id: 'apartment',
    label: '集合住宅',
    icon: '🏢',
    description: '公寓、大廈、社區型住宅',
    defaultBuildingUse: '集合住宅',
    buildingUseOptions: ['集合住宅', '住宅', '住商混合', '住辦混合'],
    baseModules: [
      { code: 'MOD_01', name: '土管',         reason: '每案必辦' },
      { code: 'MOD_06', name: '建技規',        reason: '每案必辦' },
      { code: 'MOD_08', name: '宜居建築',      reason: '住宅用途必辦' },
      { code: 'MOD_11', name: '停車空間',      reason: '每案必辦' },
      { code: 'MOD_12', name: '無障礙',        reason: '≥16戶或4F以上' },
      { code: 'MOD_13', name: '消防',          reason: '每案必辦' },
      { code: 'MOD_14', name: '台中建管自治條例', reason: '退縮/容積計算必辦' },
    ],
    conditionalHints: [
      { code: 'MOD_02', name: '都審',       reason: '面積達都審門檻' },
      { code: 'MOD_04', name: '高層',       reason: '≥16F 或 >50m' },
      { code: 'MOD_05', name: '危老',       reason: '申請危老重建' },
      { code: 'MOD_07', name: '綠建築',     reason: '≥1,000㎡（鼓勵）' },
      { code: 'MOD_09', name: '容移',       reason: '申請容積移轉' },
      { code: 'MOD_10', name: '開放空間',   reason: '申請獎勵' },
      { code: 'MOD_15', name: '防火避難',   reason: '≥11F 或 ≥1,500㎡' },
      { code: 'MOD_16', name: '雨水貯留',   reason: '基地≥500㎡ 或 樓地板≥3,000㎡' },
      { code: 'MOD_17', name: '景觀綠化',   reason: '基地≥500㎡' },
      { code: 'MOD_18', name: '畸零地',     reason: '基地形狀不規則時' },
      { code: 'MOD_19', name: '建築線',     reason: '需確認套繪及建築線指定' },
      { code: 'MOD_20', name: '都市更新',   reason: '基地≥1,000㎡（可評估）' },
    ],
  },

  // ── 2. 商辦 ────────────────────────────────────────────────
  {
    id: 'office',
    label: '商辦',
    icon: '🏬',
    description: '辦公大樓、商業設施、零售',
    defaultBuildingUse: '辦公',
    buildingUseOptions: ['辦公', '商業', '住商混合', '住辦混合'],
    baseModules: [
      { code: 'MOD_01', name: '土管',     reason: '每案必辦' },
      { code: 'MOD_06', name: '建技規',   reason: '每案必辦' },
      { code: 'MOD_11', name: '停車空間', reason: '每案必辦' },
      { code: 'MOD_12', name: '無障礙',   reason: '公眾使用建築物' },
      { code: 'MOD_13', name: '消防',     reason: '每案必辦' },
      { code: 'MOD_15', name: '防火避難', reason: '公眾使用場所必辦' },
    ],
    conditionalHints: [
      { code: 'MOD_02', name: '都審',       reason: '面積達都審門檻' },
      { code: 'MOD_04', name: '高層',       reason: '≥16F 或 >50m' },
      { code: 'MOD_05', name: '危老',       reason: '申請危老重建' },
      { code: 'MOD_07', name: '綠建築',     reason: '公有≥500㎡ / 一般≥1,000㎡' },
      { code: 'MOD_09', name: '容移',       reason: '申請容積移轉' },
      { code: 'MOD_10', name: '開放空間',   reason: '申請獎勵' },
      { code: 'MOD_16', name: '雨水貯留',   reason: '基地≥500㎡ 或 樓地板≥3,000㎡' },
      { code: 'MOD_17', name: '景觀綠化',   reason: '基地≥500㎡' },
      { code: 'MOD_20', name: '都市更新',   reason: '基地≥1,000㎡（可評估）' },
      { code: 'MOD_21', name: '招牌廣告',   reason: '商業用途需符合廣告物管理' },
    ],
  },

  // ── 3. 透天 ────────────────────────────────────────────────
  {
    id: 'townhouse',
    label: '透天',
    icon: '🏠',
    description: '連棟透天、獨棟住宅',
    defaultBuildingUse: '住宅',
    buildingUseOptions: ['住宅', '住商混合'],
    baseModules: [
      { code: 'MOD_01', name: '土管',         reason: '每案必辦' },
      { code: 'MOD_06', name: '建技規',        reason: '每案必辦' },
      { code: 'MOD_13', name: '消防',          reason: '每案必辦' },
      { code: 'MOD_14', name: '台中建管自治條例', reason: '退縮/容積計算必辦' },
      { code: 'MOD_19', name: '建築線',        reason: '透天必辦：指定建築線及套繪' },
    ],
    conditionalHints: [
      { code: 'MOD_11', name: '停車空間',   reason: '依戶數及面積計算' },
      { code: 'MOD_12', name: '無障礙',     reason: '4F 以上（電梯規格）' },
      { code: 'MOD_08', name: '宜居建築',   reason: '確認是否適用（透天通常不適用）' },
      { code: 'MOD_05', name: '危老',       reason: '申請危老重建' },
      { code: 'MOD_02', name: '都審',       reason: '面積達都審門檻（透天少見）' },
      { code: 'MOD_18', name: '畸零地',     reason: '基地形狀不規則時' },
    ],
  },

]

export function getCaseTypeById(id: string): CaseTypeConfig | undefined {
  return CASE_TYPES.find(ct => ct.id === id)
}
