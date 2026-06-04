import type { BuildingInput, CheckResult, CheckReport, RulesetInfo, PlanArea } from '@/types'
import {
  getPlanAreaById,
  getSpecialZoneById,
  SPECIAL_ZONES,
  resolvePlanAreaIdFromName,
} from '@/data/regionRules'
import { getModulesForCaseType } from '@/data/lawModules'

// ─── Helper：由 urbanPlanName 或 planAreaId 取得 PlanArea ───────

function resolveCurrentPlanArea(input: BuildingInput): PlanArea | undefined {
  if (input.planAreaId) {
    const direct = getPlanAreaById(input.planAreaId)
    if (direct) return direct
  }
  if (input.urbanPlanName) {
    const id = resolvePlanAreaIdFromName(input.urbanPlanName)
    return getPlanAreaById(id)
  }
  return undefined
}

// ─── Step 1: 解析區域規則集 ───────────────────────────────────

function resolveRuleset(input: BuildingInput): RulesetInfo {
  const planArea = resolveCurrentPlanArea(input)

  const specialZonesApplied = input.specialZoneIds
    .map((id) => getSpecialZoneById(id)?.name ?? id)
    .filter(Boolean)

  return {
    planAreaId:   input.planAreaId || resolvePlanAreaIdFromName(input.urbanPlanName),
    planAreaName: input.urbanPlanName || planArea?.name || '未選擇都市計畫區',
    planAreaShortName: planArea?.shortName ?? '—',
    district: input.district,
    urbanDesignThresholdRequired: planArea?.urbanDesign.required ?? 3000,
    urbanDesignAuthority: planArea?.urbanDesign.authority ?? '台中市政府都市發展局',
    isIndependentUDReview: planArea?.urbanDesign.isIndependent ?? false,
    specialZonesApplied,
    appliesGeneralZoning: planArea?.appliesGeneralZoning ?? true,
    ruleVersion: planArea?.ruleVersion ?? 'V1.0',
  }
}

// ─── 主要匯出函式 ─────────────────────────────────────────────

export function runCheck(input: BuildingInput): CheckReport {
  const rulesetInfo = resolveRuleset(input)

  // 1. 依案件類型篩選適用法規模組（空字串 → 回傳全部，向後相容）
  const modules = getModulesForCaseType(input.caseType)

  // 2. 每個模組執行 check()
  const allResults: CheckResult[] = modules.map((m) => m.check(input))

  // 3. 依 status 分類 + priority 排序
  const sort = (arr: CheckResult[]) => arr.sort((a, b) => a.priority - b.priority)

  return {
    required:     sort(allResults.filter((r) => r.status === 'required')),
    conditional:  sort(allResults.filter((r) => r.status === 'conditional')),
    manualReview: sort(allResults.filter((r) => r.status === 'manual_review')),
    notRequired:  sort(allResults.filter((r) => r.status === 'not_required')),
    rulesetInfo,
    generatedAt: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
    inputSummary: input,
  }
}

// 匯出特殊管制區清單供 UI 使用
export { SPECIAL_ZONES }
