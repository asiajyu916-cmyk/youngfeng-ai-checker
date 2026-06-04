/**
 * 法規模組登錄表
 *
 * 每個模組包含：
 *  - applicable_case_types  : 適用案件類型（篩選第一層）
 *  - check(input)           : 條件評估函式（篩選第二層）
 *
 * runCheck 流程：
 *  1. 依 caseType 篩選 applicable modules
 *  2. 每個 module 呼叫 check(input) 取得 CheckResult
 *  3. 依 status 分類輸出
 */

import type { BuildingInput, CheckResult } from '@/types'
import { getPlanAreaById, resolvePlanAreaIdFromName } from '@/data/regionRules'

// ─── 案件類型鍵值 ──────────────────────────────────────────────
export type CaseTypeKey = 'apartment' | 'office' | 'townhouse' | 'factory' | 'other'

// ─── 模組型別 ──────────────────────────────────────────────────
export interface LawModule {
  id:                    string
  title:                 string
  category:              string
  applicable_case_types: CaseTypeKey[]
  priority:              1 | 2 | 3
  source_law:            string[]
  note?:                 string
  check:                 (input: BuildingInput) => CheckResult
}

// ─── 輔助 ─────────────────────────────────────────────────────

const ALL: CaseTypeKey[] = ['apartment', 'office', 'townhouse', 'factory', 'other']

/** 由 input 推導 PlanArea（planAreaId 優先，次用 urbanPlanName） */
function resolvePlanArea(input: BuildingInput) {
  if (input.planAreaId) {
    const p = getPlanAreaById(input.planAreaId)
    if (p) return p
  }
  if (input.urbanPlanName) {
    return getPlanAreaById(resolvePlanAreaIdFromName(input.urbanPlanName))
  }
  return undefined
}

const UD_REMINDER = '請檢討本都市計畫區土地使用分區管制要點是否另有都市設計審議規定'

// ─── 模組清單 ─────────────────────────────────────────────────

export const LAW_MODULES: LawModule[] = [

  // ════════════════════════════════════════════════════════════
  //  核心（所有案件類型）
  // ════════════════════════════════════════════════════════════

  {
    id: 'MOD_01', title: '土地使用分區管制', category: '核心',
    applicable_case_types: ALL, priority: 1,
    source_law: ['都市計畫法 §32', '台中市土地使用分區管制自治條例'],
    check(input) {
      const zoneLine = input.zoneName || input.zoneType
      const notes: string[] = []
      if (zoneLine)                          notes.push(`使用分區：${zoneLine}`)
      if (input.coverageRatio  !== null)     notes.push(`建蔽率：${input.coverageRatio}%`)
      if (input.floorAreaRatio !== null)     notes.push(`容積率：${input.floorAreaRatio}%`)
      if (input.zoningRemarks)               notes.push(`備註：${input.zoningRemarks.replace(/\n/g, ' / ')}`)
      notes.push('請確認本案是否另需檢討該都市計畫區之土地使用分區管制要點')
      const planName = input.urbanPlanName || resolvePlanArea(input)?.name
      return {
        moduleCode: 'MOD_01', moduleName: '土地使用分區管制', status: 'required',
        triggerReason: `每案必辦：確認「${zoneLine || '使用分區'}」允許用途、建蔽率、容積率、高度限制`,
        legalBasis: [
          planName ? `${planName} 土地使用分區管制要點` : '台中市土地使用分區管制自治條例',
          '都市計畫法 §32',
        ],
        priority: 1, notes: notes.join('；'),
      }
    },
  },

  {
    id: 'MOD_06', title: '建築技術規則', category: '核心',
    applicable_case_types: ALL, priority: 1,
    source_law: ['建築技術規則建築設計施工編', '建築技術規則建築構造篇', '建築技術規則建築設備篇'],
    check(input) {
      const notes: string[] = []
      if (input.floorsAbove >= 5)          notes.push('5層以上需採防火構造')
      if (input.floorsAbove >= 4)          notes.push('4層以上需設昇降設備（電梯）')
      if (input.totalFloorArea >= 500)     notes.push('總樓地板面積 ≥ 500㎡ 需採防火構造')
      return {
        moduleCode: 'MOD_06', moduleName: '建築技術規則', status: 'required',
        triggerReason: '每案必辦：建蔽率、容積率、採光、通風、防火、避難等全面符合',
        legalBasis: ['建築技術規則建築設計施工編', '建築技術規則建築構造篇', '建築技術規則建築設備篇'],
        priority: 1, notes: notes.length ? notes.join('；') : undefined,
      }
    },
  },

  {
    id: 'MOD_11', title: '停車空間', category: '核心',
    applicable_case_types: ALL, priority: 1,
    source_law: ['建築技術規則設計施工編 §59～§62', '台中市停車場設置管理規則'],
    check(input) {
      const notes: string[] = []
      if (['住宅', '集合住宅', '住商混合', '住辦混合'].includes(input.buildingUse) && input.residentialUnits > 0)
        notes.push(`住宅 ${input.residentialUnits} 戶，依台中市規定計算停車需求`)
      notes.push('複合用途需分別計算各用途停車需求後加總')
      return {
        moduleCode: 'MOD_11', moduleName: '停車空間', status: 'required',
        triggerReason: '每案必辦：依建築用途及樓地板面積計算法定停車位數',
        legalBasis: ['建築技術規則設計施工編 §59～§62', '台中市停車場設置管理規則'],
        priority: 1, notes: notes.join('；'),
      }
    },
  },

  {
    id: 'MOD_13', title: '消防相關法規', category: '消防',
    applicable_case_types: ALL, priority: 1,
    source_law: ['消防法 §6、§9', '各類場所消防安全設備設置標準', '建築技術規則設計施工編 §106～§108'],
    check(input) {
      const notes: string[] = []
      const highRisk = ['旅館', '醫療', '百貨', '量販', 'KTV', '影城']
      if (input.floorsAbove >= 11)              notes.push(`${input.floorsAbove}層以上：需設消防搶救出入口、緊急電源插座`)
      if (input.floorsAbove >= 4)               notes.push('4層以上需設緊急廣播系統')
      if (highRisk.includes(input.buildingUse)) notes.push(`「${input.buildingUse}」屬高風險場所，建議辦理消防局預審`)
      if (input.totalFloorArea >= 1500)         notes.push('總樓地板面積達門檻，需評估自動灑水設備設置需求')
      return {
        moduleCode: 'MOD_13', moduleName: '消防相關法規', status: 'required',
        triggerReason: '每案必辦：依場所類別（甲/乙/丙/丁/戊）設置消防安全設備',
        legalBasis: ['消防法 §6、§9', '各類場所消防安全設備設置標準', '建築技術規則設計施工編 §106～§108'],
        priority: 1, notes: notes.length ? notes.join('；') : undefined,
      }
    },
  },

  // ════════════════════════════════════════════════════════════
  //  都市計畫
  // ════════════════════════════════════════════════════════════

  {
    id: 'MOD_02', title: '台中市都市設計審議', category: '都市計畫',
    applicable_case_types: ALL, priority: 1,
    source_law: ['台中市都市設計審議辦法', '都市計畫法 §16-1'],
    check(input) {
      const planArea = resolvePlanArea(input)
      const isWaterNan = input.planAreaId === 'water_nan' || input.specialZoneIds.includes('water_nan')
      const hasUDZone  = input.specialZoneIds.includes('urban_design')

      if (isWaterNan) return {
        moduleCode: 'MOD_02', moduleName: '台中市都市設計審議', status: 'not_required',
        triggerReason: '基地位於水湳經貿園區，改依 MOD_03 水湳獨立都審辦理，不適用一般台中市都審',
        legalBasis: ['台中市都市設計審議辦法'], priority: 3,
      }

      const hasPlanRule      = planArea !== undefined && planArea.urbanDesign.required > 0
      const threshold        = planArea?.urbanDesign.required     ?? 3000
      const reviewThreshold  = planArea?.urbanDesign.manualReview ?? 1000
      const authority        = planArea?.urbanDesign.authority    ?? '台中市政府都市發展局'
      const shortName        = planArea?.shortName ?? (input.urbanPlanName?.slice(0, 15) ?? '本計畫區')

      // A — 計畫區有門檻，面積達門檻
      if (hasPlanRule && input.totalFloorArea >= threshold) return {
        moduleCode: 'MOD_02', moduleName: '台中市都市設計審議', status: 'required',
        triggerReason: `【${shortName}】都審門檻 ${threshold.toLocaleString()}㎡，本案 ${input.totalFloorArea.toLocaleString()}㎡ 達門檻，需送審`,
        legalBasis: ['台中市都市設計審議辦法', '都市計畫法 §16-1'],
        priority: 1, notes: `審議機關：${authority}`,
      }

      // B — 灰色區間
      if (hasPlanRule && input.totalFloorArea >= reviewThreshold) return {
        moduleCode: 'MOD_02', moduleName: '台中市都市設計審議', status: 'manual_review',
        triggerReason: `【${shortName}】都審門檻 ${threshold.toLocaleString()}㎡，本案 ${input.totalFloorArea.toLocaleString()}㎡（${reviewThreshold.toLocaleString()}～${(threshold - 1).toLocaleString()}㎡ 灰色區間），需確認所屬管制分區細則`,
        legalBasis: ['台中市都市設計審議辦法'], priority: 1,
        notes: planArea?.urbanDesign.note ?? UD_REMINDER,
      }

      // C — 手動勾選，面積達預設門檻
      if (hasUDZone && input.totalFloorArea >= 3000) return {
        moduleCode: 'MOD_02', moduleName: '台中市都市設計審議', status: 'required',
        triggerReason: `手動勾選都市設計管制區，本案 ${input.totalFloorArea.toLocaleString()}㎡ 達預設門檻 3,000㎡，需送審`,
        legalBasis: ['台中市都市設計審議辦法', '都市計畫法 §16-1'],
        priority: 1, notes: `審議機關：${authority}`,
      }

      // D — 有計畫名稱或手動勾選，但面積未達門檻：土管未完整結構化，不得判定不需
      if (input.urbanPlanName || hasUDZone) {
        const areaDesc = input.totalFloorArea > 0
          ? `本案 ${input.totalFloorArea.toLocaleString()}㎡ 未達一般門檻（${hasPlanRule ? threshold.toLocaleString() : '3,000'}㎡），`
          : '面積資料尚未填入，'
        const src = hasUDZone && !input.urbanPlanName ? '手動勾選都市設計管制區' : `已命中「${shortName}」`
        return {
          moduleCode: 'MOD_02', moduleName: '台中市都市設計審議', status: 'manual_review',
          triggerReason: `${src}，${areaDesc}惟各細部計畫或特定區土管條文尚未完整結構化，不得逕行判定不需檢討`,
          legalBasis: ['台中市都市設計審議辦法'], priority: 2, notes: UD_REMINDER,
        }
      }

      // E — 都市計畫名稱未選定
      return {
        moduleCode: 'MOD_02', moduleName: '台中市都市設計審議', status: 'manual_review',
        triggerReason: '都市計畫名稱未選定，無法判定是否需辦理都審',
        legalBasis: ['台中市都市設計審議辦法'], priority: 3, notes: UD_REMINDER,
      }
    },
  },

  {
    id: 'MOD_03', title: '水湳經貿園區都審', category: '都市計畫',
    applicable_case_types: ALL, priority: 1,
    source_law: ['台中市水湳經貿園區都市設計管制要點', '台中市水湳經貿園區特定區計畫書'],
    check(input) {
      if (input.planAreaId === 'water_nan' || input.specialZoneIds.includes('water_nan')) return {
        moduleCode: 'MOD_03', moduleName: '水湳經貿園區都審', status: 'required',
        triggerReason: '基地位於水湳經貿園區，需依水湳獨立都審程序辦理，所有案件無面積門檻限制',
        legalBasis: ['台中市水湳經貿園區都市設計管制要點', '台中市水湳經貿園區特定區計畫書'],
        priority: 1, notes: '建蔽率、容積率需依水湳特定區計畫書規定（勿套用一般分區）；建築外觀需符合國際商務形象設計準則',
      }
      return {
        moduleCode: 'MOD_03', moduleName: '水湳經貿園區都審', status: 'not_required',
        triggerReason: '基地未位於水湳經貿園區', legalBasis: [], priority: 3,
      }
    },
  },

  // ════════════════════════════════════════════════════════════
  //  規模觸發
  // ════════════════════════════════════════════════════════════

  {
    id: 'MOD_04', title: '高層建築物', category: '規模',
    applicable_case_types: ['apartment', 'office', 'other'], priority: 1,
    source_law: ['建築技術規則設計施工編 §227～§281', '台中市高層建築物審查作業要點'],
    check(input) {
      if (input.floorsAbove >= 16 || input.heightM > 50) return {
        moduleCode: 'MOD_04', moduleName: '高層建築物', status: 'required',
        triggerReason: `地上 ${input.floorsAbove}F / 高度 ${input.heightM}m → 符合高層建築物定義（≥16層 或 >50m）`,
        legalBasis: ['建築技術規則設計施工編 §227～§281', '台中市高層建築物審查作業要點'],
        priority: 1, notes: '需辦理：台中市高層建築審查 → 結構審查 → 都審 → 建照（依序）',
      }
      if (input.floorsAbove === 15 || (input.heightM >= 45 && input.heightM <= 50)) return {
        moduleCode: 'MOD_04', moduleName: '高層建築物', status: 'manual_review',
        triggerReason: `地上 ${input.floorsAbove}F / 高度 ${input.heightM}m → 接近高層建築物門檻（15層 或 45～50m），請精確計算含屋突、機電層之總高度`,
        legalBasis: ['建築技術規則設計施工編 §227', '台中市高層建築物審查作業要點'],
        priority: 1, notes: '屋突面積超過建築面積 1/8 時計入建築高度，務必確認計算方式',
      }
      return {
        moduleCode: 'MOD_04', moduleName: '高層建築物', status: 'not_required',
        triggerReason: `地上 ${input.floorsAbove}F / 高度 ${input.heightM}m → 未達高層建築物門檻`,
        legalBasis: [], priority: 3,
      }
    },
  },

  // ════════════════════════════════════════════════════════════
  //  無障礙設施
  // ════════════════════════════════════════════════════════════

  {
    id: 'MOD_12', title: '無障礙設施', category: '建築規範',
    applicable_case_types: ['apartment', 'office', 'townhouse', 'other'], priority: 1,
    source_law: ['建築技術規則設計施工編 §167～§167-14', '建築物無障礙設施設計規範'],
    check(input) {
      // 透天：依樓層判斷，不強制
      if (input.caseType === 'townhouse') {
        if (input.floorsAbove >= 4) return {
          moduleCode: 'MOD_12', moduleName: '無障礙設施', status: 'manual_review',
          triggerReason: `透天 ${input.floorsAbove}F，4層以上設電梯時需符合無障礙規格，請確認是否設電梯及規格`,
          legalBasis: ['建築技術規則設計施工編 §167'], priority: 2,
        }
        return {
          moduleCode: 'MOD_12', moduleName: '無障礙設施', status: 'not_required',
          triggerReason: `透天住宅 ${input.floorsAbove}F，未達強制無障礙設施條件`,
          legalBasis: [], priority: 3,
        }
      }

      const publicUses      = ['辦公', '商業', '旅館', '醫療', '學校', '政府機關', '住商混合']
      const isPublicUse     = publicUses.includes(input.buildingUse)
      const isLargeResid    = input.residentialUnits >= 16
      const isPublicBuilding = input.buildingOwnership === 'public'

      if (isPublicUse || isLargeResid || isPublicBuilding) {
        const reasons: string[] = []
        if (isPublicUse)      reasons.push(`公眾使用建築物（${input.buildingUse}）`)
        if (isLargeResid)     reasons.push(`集合住宅 ${input.residentialUnits} 戶（≥16戶）`)
        if (isPublicBuilding) reasons.push('公有建築物')
        return {
          moduleCode: 'MOD_12', moduleName: '無障礙設施', status: 'required',
          triggerReason: reasons.join('、') + '，需設置無障礙設施',
          legalBasis: ['建築技術規則設計施工編 §167～§167-14', '建築物無障礙設施設計規範'],
          priority: 1, notes: '電梯需符合無障礙規格（轎廂深≥135cm×寬≥110cm）；廁所門需向外開',
        }
      }
      if (input.floorsAbove >= 4) return {
        moduleCode: 'MOD_12', moduleName: '無障礙設施', status: 'conditional',
        triggerReason: '4層以上建築物設電梯，電梯需符合無障礙規格',
        legalBasis: ['建築技術規則設計施工編 §167', '建築物無障礙設施設計規範'], priority: 2,
      }
      return {
        moduleCode: 'MOD_12', moduleName: '無障礙設施', status: 'not_required',
        triggerReason: '未達無障礙設施強制設置條件', legalBasis: [], priority: 3,
      }
    },
  },

  // ════════════════════════════════════════════════════════════
  //  特殊條件（申請類）
  // ════════════════════════════════════════════════════════════

  {
    id: 'MOD_05', title: '危老重建', category: '特殊條件',
    applicable_case_types: ['apartment', 'office', 'townhouse', 'other'], priority: 2,
    source_law: ['都市危險及老舊建築物加速重建條例 §3、§6', '台中市辦理都市危險及老舊建築物加速重建審查作業要點'],
    check(input) {
      if (input.isHazardRebuild) return {
        moduleCode: 'MOD_05', moduleName: '危老重建', status: 'required',
        triggerReason: '申請危老重建，需辦理危老認定及容積獎勵申請',
        legalBasis: ['都市危險及老舊建築物加速重建條例 §3、§6', '台中市辦理都市危險及老舊建築物加速重建審查作業要點'],
        priority: 1, notes: '時程獎勵逐年遞減，請確認當年度有效獎勵率。容積獎勵上限：法定容積 40%',
      }
      return {
        moduleCode: 'MOD_05', moduleName: '危老重建', status: 'not_required',
        triggerReason: '非危老重建案', legalBasis: [], priority: 3,
      }
    },
  },

  {
    id: 'MOD_09', title: '容積移轉', category: '特殊條件',
    applicable_case_types: ['apartment', 'office', 'other'], priority: 2,
    source_law: ['都市計畫容積移轉實施辦法 §6', '台中市辦理容積移轉審查作業要點'],
    check(input) {
      if (!input.isFarTransfer) return {
        moduleCode: 'MOD_09', moduleName: '容積移轉', status: 'not_required',
        triggerReason: '未申請容積移轉', legalBasis: [], priority: 3,
      }
      if (input.specialZoneIds.includes('far_transfer_restriction')) return {
        moduleCode: 'MOD_09', moduleName: '容積移轉', status: 'manual_review',
        triggerReason: '基地位於容積移轉限制區，需確認是否有限制條件或需特別審查',
        legalBasis: ['都市計畫容積移轉實施辦法', '台中市辦理容積移轉審查作業要點'],
        priority: 1, notes: '請向台中市都市發展局確認本基地適用之容積移轉條件',
      }
      return {
        moduleCode: 'MOD_09', moduleName: '容積移轉', status: 'required',
        triggerReason: '申請容積移轉，需辦理台中市容積移轉審查及地政登記',
        legalBasis: ['都市計畫容積移轉實施辦法 §6', '台中市辦理容積移轉審查作業要點'],
        priority: 1, notes: '移入容積上限：一般 ≤ 法定容積 30%；古蹟/歷史建築送出 ≤ 40%',
      }
    },
  },

  {
    id: 'MOD_10', title: '開放空間獎勵', category: '特殊條件',
    applicable_case_types: ['apartment', 'office', 'other'], priority: 2,
    source_law: ['台中市建築物提供開放空間獎勵辦法'],
    check(input) {
      if (input.isOpenSpace) return {
        moduleCode: 'MOD_10', moduleName: '開放空間獎勵', status: 'required',
        triggerReason: '申請開放空間獎勵，需提供符合規定之公共開放空間並辦理審查',
        legalBasis: ['台中市建築物提供開放空間獎勵辦法'],
        priority: 2, notes: '開放空間需 24 小時對公眾開放，獎勵容積需與其他獎勵加總確認上限',
      }
      return {
        moduleCode: 'MOD_10', moduleName: '開放空間獎勵', status: 'not_required',
        triggerReason: '未申請開放空間獎勵', legalBasis: [], priority: 3,
      }
    },
  },

  {
    id: 'MOD_20', title: '都市更新', category: '特殊條件',
    applicable_case_types: ['apartment', 'office', 'townhouse', 'other'], priority: 2,
    source_law: ['都市更新條例', '台中市都市更新自治條例'],
    note: '與危老重建通常擇一辦理；大型基地可評估申請',
    check(input) {
      if (input.isHazardRebuild) return {
        moduleCode: 'MOD_20', moduleName: '都市更新', status: 'not_required',
        triggerReason: '本案申請危老重建，與都市更新通常擇一辦理', legalBasis: [], priority: 3,
      }
      if (['apartment', 'office'].includes(input.caseType) && input.landArea >= 1000) return {
        moduleCode: 'MOD_20', moduleName: '都市更新', status: 'conditional',
        triggerReason: `基地面積 ${input.landArea.toLocaleString()}㎡，符合都市更新事業範圍條件，可考慮申請都市更新`,
        legalBasis: ['都市更新條例', '台中市都市更新自治條例'],
        priority: 2, notes: '都市更新可獲容積獎勵，但程序複雜，需委託都更顧問評估可行性',
      }
      return {
        moduleCode: 'MOD_20', moduleName: '都市更新', status: 'not_required',
        triggerReason: '非都市更新案件（如需申請都更，請聯絡都更顧問）', legalBasis: [], priority: 3,
      }
    },
  },

  // ════════════════════════════════════════════════════════════
  //  環境 / 綠化
  // ════════════════════════════════════════════════════════════

  {
    id: 'MOD_07', title: '綠建築', category: '環境',
    applicable_case_types: ['apartment', 'office', 'factory', 'other'], priority: 2,
    source_law: ['建築技術規則設計施工編 §298-1', '公有建築物應辦理綠建築之範圍及作業要點'],
    check(input) {
      const isWaterNan = input.planAreaId === 'water_nan' || input.specialZoneIds.includes('water_nan')
      if (input.buildingOwnership === 'public' && input.totalFloorArea >= 500) return {
        moduleCode: 'MOD_07', moduleName: '綠建築', status: 'required',
        triggerReason: `公有建築物，${input.totalFloorArea.toLocaleString()}㎡ ≥ 500㎡，強制取得合格級以上綠建築標章`,
        legalBasis: ['建築技術規則設計施工編 §298-1', '公有建築物應辦理綠建築之範圍及作業要點'],
        priority: 1, notes: '建照申請需同時附綠建築候選證書',
      }
      if (isWaterNan) return {
        moduleCode: 'MOD_07', moduleName: '綠建築', status: 'manual_review',
        triggerReason: '水湳經貿園區部分分區要求取得綠建築標章，需確認所在分區之要求等級',
        legalBasis: ['台中市水湳經貿園區特定區計畫書', '建築技術規則設計施工編 §298-1'], priority: 2,
      }
      if (input.totalFloorArea >= 1000) return {
        moduleCode: 'MOD_07', moduleName: '綠建築', status: 'conditional',
        triggerReason: `總樓地板面積 ${input.totalFloorArea.toLocaleString()}㎡ ≥ 1,000㎡，鼓勵申請綠建築標章（銀級以上可申請容積獎勵）`,
        legalBasis: ['建築技術規則設計施工編 §298-1'], priority: 2,
      }
      return {
        moduleCode: 'MOD_07', moduleName: '綠建築', status: 'not_required',
        triggerReason: `${input.totalFloorArea.toLocaleString()}㎡ 未達 1,000㎡ 門檻，非強制申請`, legalBasis: [], priority: 3,
      }
    },
  },

  {
    id: 'MOD_16', title: '雨水貯留', category: '環境',
    applicable_case_types: ['apartment', 'office'], priority: 2,
    source_law: ['建築技術規則設計施工編 §298-7', '台中市建築基地雨水貯留利用系統設置辦法'],
    note: '依台中市規定，一定規模以上建案需設置雨水貯留設施',
    check(input) {
      if (input.landArea >= 500 || input.totalFloorArea >= 3000) return {
        moduleCode: 'MOD_16', moduleName: '雨水貯留', status: 'conditional',
        triggerReason: `基地面積 ${input.landArea.toLocaleString()}㎡ / 樓地板 ${input.totalFloorArea.toLocaleString()}㎡，達雨水貯留設施設置門檻`,
        legalBasis: ['建築技術規則設計施工編 §298-7', '台中市建築基地雨水貯留利用系統設置辦法'],
        priority: 2, notes: '需計算貯留容量，設計圖說需附設置計畫書',
      }
      return {
        moduleCode: 'MOD_16', moduleName: '雨水貯留', status: 'manual_review',
        triggerReason: '面積資料尚未完整，請確認台中市最新雨水貯留設施設置規定',
        legalBasis: ['台中市建築基地雨水貯留利用系統設置辦法'], priority: 3,
        notes: '請向主管機關確認當前適用門檻',
      }
    },
  },

  {
    id: 'MOD_17', title: '景觀綠化', category: '環境',
    applicable_case_types: ['apartment', 'office'], priority: 2,
    source_law: ['台中市建築物景觀綠化自治條例', '建築技術規則設計施工編 §298-9'],
    note: '一定面積以上建案需依台中市景觀綠化自治條例辦理',
    check(input) {
      if (input.landArea >= 1000 || input.totalFloorArea >= 3000) return {
        moduleCode: 'MOD_17', moduleName: '景觀綠化', status: 'required',
        triggerReason: `基地面積 ${input.landArea.toLocaleString()}㎡ / 樓地板 ${input.totalFloorArea.toLocaleString()}㎡，需辦理景觀綠化計畫`,
        legalBasis: ['台中市建築物景觀綠化自治條例', '建築技術規則設計施工編 §298-9'],
        priority: 2, notes: '需附景觀計畫書；屋頂綠化面積比例需達規定',
      }
      if (input.landArea >= 500) return {
        moduleCode: 'MOD_17', moduleName: '景觀綠化', status: 'conditional',
        triggerReason: `基地面積 ${input.landArea.toLocaleString()}㎡，請確認是否達台中市景觀綠化自治條例適用門檻`,
        legalBasis: ['台中市建築物景觀綠化自治條例'], priority: 2,
      }
      return {
        moduleCode: 'MOD_17', moduleName: '景觀綠化', status: 'manual_review',
        triggerReason: '基地面積尚未填入，無法判定景觀綠化是否適用',
        legalBasis: ['台中市建築物景觀綠化自治條例'], priority: 3,
        notes: '請確認台中市景觀綠化自治條例適用門檻',
      }
    },
  },

  // ════════════════════════════════════════════════════════════
  //  集合住宅 / 透天 專屬
  // ════════════════════════════════════════════════════════════

  {
    id: 'MOD_08', title: '台中市宜居建築', category: '住宅',
    applicable_case_types: ['apartment', 'townhouse'], priority: 2,
    source_law: ['台中市宜居建築自治條例'],
    note: '台中市獨有地方法規，住宅用途適用',
    check(input) {
      const residUses = ['住宅', '集合住宅', '住商混合', '住辦混合']
      if (residUses.includes(input.buildingUse)) {
        const isApt = input.caseType === 'apartment'
        return {
          moduleCode: 'MOD_08', moduleName: '台中市宜居建築',
          status: isApt ? 'required' : 'conditional',
          triggerReason: isApt
            ? '集合住宅案件，台中市宜居建築自治條例為必辦，需全面符合公設比、採光、戶外空間等規定'
            : `建築用途「${input.buildingUse}」含住宅，需確認是否達台中市宜居建築自治條例適用門檻`,
          legalBasis: ['台中市宜居建築自治條例'],
          priority: isApt ? 1 : 2,
          notes: '台中市獨有地方法規，請查閱最新版本確認公設比、採光、戶外空間規定',
        }
      }
      return {
        moduleCode: 'MOD_08', moduleName: '台中市宜居建築', status: 'not_required',
        triggerReason: `建築用途「${input.buildingUse}」非住宅，不適用宜居建築條例`, legalBasis: [], priority: 3,
      }
    },
  },

  {
    id: 'MOD_14', title: '台中市建築管理自治條例', category: '建築規範',
    applicable_case_types: ['apartment', 'townhouse'], priority: 1,
    source_law: ['台中市建築管理自治條例'],
    note: '規範退縮、容積計算等在地規定，集合住宅及透天必辦',
    check(input) {
      return {
        moduleCode: 'MOD_14', moduleName: '台中市建築管理自治條例', status: 'required',
        triggerReason: `${input.caseType === 'apartment' ? '集合住宅' : '透天住宅'}，台中市建築管理自治條例為必辦事項（退縮、容積計算等）`,
        legalBasis: ['台中市建築管理自治條例'],
        priority: 1, notes: '請確認本案退縮距離、建築容積計算方式是否符合台中市建管自治條例最新版本',
      }
    },
  },

  {
    id: 'MOD_18', title: '畸零地', category: '基地',
    applicable_case_types: ['townhouse', 'apartment'], priority: 2,
    source_law: ['建築法 §44', '台中市畸零地使用自治條例'],
    note: '基地形狀不規則或面積過小時需辦理畸零地整合',
    check(_input) {
      return {
        moduleCode: 'MOD_18', moduleName: '畸零地', status: 'manual_review',
        triggerReason: '需確認基地形狀、臨路面寬是否符合畸零地規定，無法由系統自動判定',
        legalBasis: ['建築法 §44', '台中市畸零地使用自治條例'],
        priority: 2, notes: '畸零地判定需依地籍圖及現場勘查確認，建議向主管機關申請預查',
      }
    },
  },

  {
    id: 'MOD_19', title: '套繪 / 指定建築線', category: '基地',
    applicable_case_types: ['townhouse', 'apartment'], priority: 1,
    source_law: ['建築法 §48', '台中市建築線指定申請辦法'],
    note: '透天必辦，集合住宅需確認',
    check(input) {
      if (input.caseType === 'townhouse') return {
        moduleCode: 'MOD_19', moduleName: '套繪/指定建築線', status: 'required',
        triggerReason: '透天住宅必辦：需申請指定建築線，並辦理套繪管制',
        legalBasis: ['建築法 §48', '台中市建築線指定申請辦法'],
        priority: 1, notes: '指定建築線後需套繪至地籍圖，作為建照申請依據',
      }
      return {
        moduleCode: 'MOD_19', moduleName: '套繪/指定建築線', status: 'manual_review',
        triggerReason: '需確認基地建築線指定情形及套繪管制狀態',
        legalBasis: ['建築法 §48', '台中市建築線指定申請辦法'], priority: 2,
      }
    },
  },

  // ════════════════════════════════════════════════════════════
  //  商辦 / 廠房 專屬
  // ════════════════════════════════════════════════════════════

  {
    id: 'MOD_15', title: '防火避難', category: '消防',
    applicable_case_types: ['apartment', 'office', 'factory', 'other'], priority: 1,
    source_law: ['建築技術規則設計施工編 §88～§108'],
    note: '防火區劃、避難層、緊急出口、排煙設備綜合檢討',
    check(input) {
      const highRise    = input.floorsAbove >= 11
      const largeArea   = input.totalFloorArea >= 1500
      const publicUse   = ['辦公', '商業', '旅館', '醫療'].includes(input.buildingUse)
      if (highRise || largeArea || publicUse) {
        const reasons: string[] = []
        if (highRise)  reasons.push(`${input.floorsAbove}F（11層以上需特別防火避難設計）`)
        if (largeArea) reasons.push(`總樓地板 ${input.totalFloorArea.toLocaleString()}㎡（≥1,500㎡）`)
        if (publicUse) reasons.push(`「${input.buildingUse}」公眾使用場所`)
        return {
          moduleCode: 'MOD_15', moduleName: '防火避難', status: 'required',
          triggerReason: `需辦理防火避難綜合檢討：${reasons.join('、')}`,
          legalBasis: ['建築技術規則設計施工編 §88～§108'],
          priority: 1, notes: '防火區劃面積、避難路徑長度、緊急出口寬度需全面符合規定',
        }
      }
      return {
        moduleCode: 'MOD_15', moduleName: '防火避難', status: 'manual_review',
        triggerReason: '請確認本案防火區劃、避難設計是否符合建築技術規則規定',
        legalBasis: ['建築技術規則設計施工編 §88～§108'], priority: 2,
        notes: '依建築用途、樓層數及樓地板面積確認適用之防火避難規定',
      }
    },
  },

  {
    id: 'MOD_21', title: '招牌廣告', category: '商辦',
    applicable_case_types: ['office'], priority: 3,
    source_law: ['招牌廣告及樹立廣告管理辦法', '台中市廣告物設置管理自治條例'],
    note: '商業建築需符合廣告物管理規定',
    check(input) {
      const commercialUses = ['商業', '辦公', '旅館', '住商混合']
      if (commercialUses.includes(input.buildingUse)) return {
        moduleCode: 'MOD_21', moduleName: '招牌廣告', status: 'conditional',
        triggerReason: `「${input.buildingUse}」建築物通常設置招牌廣告，需符合台中市廣告物管理規定`,
        legalBasis: ['招牌廣告及樹立廣告管理辦法', '台中市廣告物設置管理自治條例'],
        priority: 3, notes: '廣告物尺寸、照明、結構安全需另申請，面積計入容積管制',
      }
      return {
        moduleCode: 'MOD_21', moduleName: '招牌廣告', status: 'not_required',
        triggerReason: '非商業用途，通常不設招牌廣告', legalBasis: [], priority: 3,
      }
    },
  },

  // ════════════════════════════════════════════════════════════
  //  特殊管制區（勾選觸發）
  // ════════════════════════════════════════════════════════════

  {
    id: 'SZ_MRT', title: '捷運場站周邊容積獎勵', category: '特殊管制區',
    applicable_case_types: ALL, priority: 2,
    source_law: ['台中市大眾捷運系統土地開發辦法'],
    check(input) {
      if (input.specialZoneIds.includes('mrt_station')) return {
        moduleCode: 'SZ_MRT', moduleName: '捷運場站周邊容積獎勵', status: 'conditional',
        triggerReason: '基地位於台中捷運場站 500 公尺範圍內，可申請捷運場站周邊容積獎勵',
        legalBasis: ['台中市大眾捷運系統土地開發辦法'],
        priority: 2, notes: '需查閱台中市當前有效之捷運場站周邊容積獎勵辦法，確認獎勵率與條件',
      }
      return { moduleCode: 'SZ_MRT', moduleName: '捷運場站周邊容積獎勵', status: 'not_required', triggerReason: '基地未位於捷運場站500公尺範圍', legalBasis: [], priority: 3 }
    },
  },

  {
    id: 'SZ_HSR', title: '高鐵特定區管制', category: '特殊管制區',
    applicable_case_types: ALL, priority: 1,
    source_law: ['台中高鐵特定區都市計畫書'],
    check(input) {
      if (input.specialZoneIds.includes('hsr_special')) return {
        moduleCode: 'SZ_HSR', moduleName: '高鐵特定區管制', status: 'manual_review',
        triggerReason: '基地位於台中高鐵特定區計畫範圍，建蔽率容積率依特定區計畫書規定',
        legalBasis: ['台中高鐵特定區都市計畫書'],
        priority: 1, notes: '請查詢高鐵特定區計畫書，確認本基地適用之管制規定',
      }
      return { moduleCode: 'SZ_HSR', moduleName: '高鐵特定區管制', status: 'not_required', triggerReason: '基地未位於高鐵特定區', legalBasis: [], priority: 3 }
    },
  },

  {
    id: 'SZ_HERITAGE', title: '文化資產保存範圍', category: '特殊管制區',
    applicable_case_types: ALL, priority: 1,
    source_law: ['文化資產保存法 §34、§42'],
    check(input) {
      if (input.specialZoneIds.includes('cultural_heritage')) return {
        moduleCode: 'SZ_HERITAGE', moduleName: '文化資產保存範圍', status: 'manual_review',
        triggerReason: '基地位於文化資產保存範圍內或周邊，需取得文化局審查同意',
        legalBasis: ['文化資產保存法 §34、§42'],
        priority: 1, notes: '建築設計需符合文化資產保存法規定，可能有高度、量體、外觀限制',
      }
      return { moduleCode: 'SZ_HERITAGE', moduleName: '文化資產保存範圍', status: 'not_required', triggerReason: '基地未位於文化資產保存範圍', legalBasis: [], priority: 3 }
    },
  },

  {
    id: 'SZ_HILLSIDE', title: '山坡地建築管制', category: '特殊管制區',
    applicable_case_types: ALL, priority: 1,
    source_law: ['山坡地建築管理辦法', '水土保持法'],
    check(input) {
      if (input.specialZoneIds.includes('hillside')) return {
        moduleCode: 'SZ_HILLSIDE', moduleName: '山坡地建築管制', status: 'required',
        triggerReason: '基地位於山坡地範圍，需依山坡地建築管理辦法辦理',
        legalBasis: ['山坡地建築管理辦法', '水土保持法'],
        priority: 1, notes: '需辦理水土保持計畫，基地坡度超過一定角度有建築限制',
      }
      return { moduleCode: 'SZ_HILLSIDE', moduleName: '山坡地建築管制', status: 'not_required', triggerReason: '基地未位於山坡地範圍', legalBasis: [], priority: 3 }
    },
  },

  {
    id: 'SZ_GEO', title: '地質敏感區基地調查', category: '特殊管制區',
    applicable_case_types: ALL, priority: 1,
    source_law: ['地質法 §8', '建築基地地質調查及地質安全評估辦法'],
    check(input) {
      if (input.specialZoneIds.includes('geological_sensitive')) return {
        moduleCode: 'SZ_GEO', moduleName: '地質敏感區基地調查', status: 'required',
        triggerReason: '基地位於地質法公告之地質敏感區，需辦理基地地質調查及安全評估',
        legalBasis: ['地質法 §8', '建築基地地質調查及地質安全評估辦法'],
        priority: 1, notes: '建照申請前需取得地質調查報告，活動斷層帶內禁止建造供人居住或公眾使用之建築物',
      }
      return { moduleCode: 'SZ_GEO', moduleName: '地質敏感區基地調查', status: 'not_required', triggerReason: '基地未位於地質敏感區', legalBasis: [], priority: 3 }
    },
  },

  // ════════════════════════════════════════════════════════════
  //  容積獎勵加總 / 高層時程
  // ════════════════════════════════════════════════════════════

  {
    id: 'MAN_FAR', title: '容積獎勵加總上限確認', category: '管理',
    applicable_case_types: ['apartment', 'office', 'other'], priority: 1,
    source_law: ['都市計畫法 §50-1'],
    check(input) {
      const planArea = resolvePlanArea(input)
      const bonusCount = (input.isHazardRebuild ? 1 : 0) + (input.isFarTransfer ? 1 : 0) + (input.isOpenSpace ? 1 : 0)
      if (bonusCount >= 2) {
        const threshold = Math.round((planArea?.farBonus.committeeThreshold ?? 1.30) * 100)
        return {
          moduleCode: 'MAN_FAR', moduleName: '容積獎勵加總上限確認', status: 'manual_review',
          triggerReason: `本案申請多項容積獎勵（${bonusCount} 項），需確認加總後是否超過法定容積 ${threshold}%（超過需提都委會審議）`,
          legalBasis: ['都市計畫法 §50-1', planArea?.name ? `${planArea.name} 容積獎勵規定` : '台中市相關容積獎勵辦法'],
          priority: 1, notes: `【${planArea?.shortName ?? '本計畫區'}】容積獎勵加總上限：${Math.round((planArea?.farBonus.maxTotalBonus ?? 1.5) * 100)}% 法定容積`,
        }
      }
      return { moduleCode: 'MAN_FAR', moduleName: '容積獎勵加總上限確認', status: 'not_required', triggerReason: '未申請多項容積獎勵，無需確認加總上限', legalBasis: [], priority: 3 }
    },
  },

  {
    id: 'MAN_HIGHRISE_SCHEDULE', title: '高層建築物審查時程規劃', category: '管理',
    applicable_case_types: ['apartment', 'office', 'other'], priority: 1,
    source_law: ['台中市高層建築物審查作業要點'],
    check(input) {
      if (input.floorsAbove >= 16 || input.heightM > 50) return {
        moduleCode: 'MAN_HIGHRISE_SCHEDULE', moduleName: '高層建築物審查時程規劃', status: 'manual_review',
        triggerReason: '高層建築物需多程序並行，需提前規劃整體時程',
        legalBasis: ['台中市高層建築物審查作業要點'],
        priority: 1, notes: '建議時程：台中市高層審查（2-3月）→ 都審（2-4月）→ 結構審查（1-2月）→ 建照申請',
      }
      return { moduleCode: 'MAN_HIGHRISE_SCHEDULE', moduleName: '高層建築物審查時程規劃', status: 'not_required', triggerReason: '非高層建築物，無需特別規劃審查時程', legalBasis: [], priority: 3 }
    },
  },
]

// ─── 查詢函式 ──────────────────────────────────────────────────

/** 依案件類型篩選適用法規模組。若 caseType 為空，回傳全部模組（向後相容）*/
export function getModulesForCaseType(caseType: string): LawModule[] {
  if (!caseType) return LAW_MODULES
  return LAW_MODULES.filter(m =>
    (m.applicable_case_types as string[]).includes(caseType)
  )
}
