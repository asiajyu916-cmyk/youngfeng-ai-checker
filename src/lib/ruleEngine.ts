import type { BuildingInput, CheckResult, CheckReport, RulesetInfo } from '@/types'
import {
  getPlanAreaById,
  getSpecialZoneById,
  SPECIAL_ZONES,
} from '@/data/regionRules'

// ─── 判斷順序：縣市 → 行政區 → 都市計畫區 → 特殊管制區 → 使用分區 → 用途 → 面積/高度/樓層 ───

// ─── Step 1: 解析區域規則集 ───────────────────────────────────

function resolveRuleset(input: BuildingInput): RulesetInfo {
  const planArea = getPlanAreaById(input.planAreaId)

  const specialZonesApplied = input.specialZoneIds
    .map((id) => getSpecialZoneById(id)?.name ?? id)
    .filter(Boolean)

  return {
    planAreaId: input.planAreaId,
    planAreaName: planArea?.name ?? '未選擇都市計畫區',
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

// ─── 各模組判斷函式 ───────────────────────────────────────────

function checkMOD01(input: BuildingInput): CheckResult {
  const planArea = getPlanAreaById(input.planAreaId)
  const zoningRule = planArea?.zoningRules.find((r) => r.zoneType === input.zoneType)

  const notes: string[] = []
  if (!planArea?.appliesGeneralZoning) {
    notes.push(`${planArea?.shortName ?? '本計畫區'}有獨立分區管制規定，請勿套用一般台中市分區管制`)
  }
  if (zoningRule) {
    notes.push(`${input.zoneType}：建蔽率 ${zoningRule.maxBuildingCoverage}%、容積率 ${zoningRule.maxFar}%${zoningRule.maxHeight ? `、限高 ${zoningRule.maxHeight}m` : ''}`)
  } else if (input.zoneType) {
    notes.push(`${input.zoneType}：請查詢${planArea?.shortName ?? '所在計畫區'}之管制規定`)
  }

  return {
    moduleCode: 'MOD_01',
    moduleName: '土地使用分區管制',
    status: 'required',
    triggerReason: '每案必辦：確認使用分區允許用途、建蔽率、容積率、高度限制',
    legalBasis: [
      planArea?.appliesGeneralZoning
        ? '台中市土地使用分區管制自治條例'
        : `${planArea?.name ?? '所在計畫區'} 計畫書`,
      '都市計畫法 §32',
    ],
    priority: 1,
    notes: notes.join('；'),
  }
}

function checkMOD02(input: BuildingInput): CheckResult {
  const planArea = getPlanAreaById(input.planAreaId)
  const isWaterNan = input.planAreaId === 'water_nan'
  const hasUrbanDesignZone = input.specialZoneIds.includes('urban_design')

  // 水湳園區改用 MOD_03
  if (isWaterNan) {
    return {
      moduleCode: 'MOD_02',
      moduleName: '台中市都市設計審議',
      status: 'not_required',
      triggerReason: '基地位於水湳經貿園區，改依 MOD_03 水湳獨立都審辦理，不適用一般台中市都審',
      legalBasis: ['台中市都市設計審議辦法'],
      priority: 3,
    }
  }

  // 未勾選都市設計管制區
  if (!hasUrbanDesignZone) {
    return {
      moduleCode: 'MOD_02',
      moduleName: '台中市都市設計審議',
      status: 'not_required',
      triggerReason: '未勾選位於都市設計審議管制範圍，如有疑問請向台中市都市發展局確認',
      legalBasis: ['台中市都市設計審議辦法'],
      priority: 3,
    }
  }

  // 取得本計畫區的都審門檻
  const threshold = planArea?.urbanDesign.required ?? 3000
  const reviewThreshold = planArea?.urbanDesign.manualReview ?? 1000
  const authority = planArea?.urbanDesign.authority ?? '台中市政府都市發展局'
  const planAreaShortName = planArea?.shortName ?? '本計畫區'

  if (input.totalFloorArea >= threshold) {
    return {
      moduleCode: 'MOD_02',
      moduleName: '台中市都市設計審議',
      status: 'required',
      triggerReason: `【${planAreaShortName}】都審門檻 ${threshold.toLocaleString()}㎡，本案 ${input.totalFloorArea.toLocaleString()}㎡ 達門檻，需送審`,
      legalBasis: ['台中市都市設計審議辦法', '都市計畫法 §16-1'],
      priority: 1,
      notes: `審議機關：${authority}`,
    }
  }

  if (input.totalFloorArea >= reviewThreshold) {
    return {
      moduleCode: 'MOD_02',
      moduleName: '台中市都市設計審議',
      status: 'manual_review',
      triggerReason: `【${planAreaShortName}】都審門檻 ${threshold.toLocaleString()}㎡，本案 ${input.totalFloorArea.toLocaleString()}㎡（${reviewThreshold.toLocaleString()}～${(threshold - 1).toLocaleString()}㎡ 區間），需確認所屬管制分區細則`,
      legalBasis: ['台中市都市設計審議辦法'],
      priority: 1,
      notes: `${planArea?.urbanDesign.note ?? '請向台中市都市發展局確認是否達當地分區門檻'}`,
    }
  }

  return {
    moduleCode: 'MOD_02',
    moduleName: '台中市都市設計審議',
    status: 'not_required',
    triggerReason: `【${planAreaShortName}】都審門檻 ${threshold.toLocaleString()}㎡，本案 ${input.totalFloorArea.toLocaleString()}㎡ 未達門檻`,
    legalBasis: ['台中市都市設計審議辦法'],
    priority: 3,
  }
}

function checkMOD03(input: BuildingInput): CheckResult {
  const isWaterNan =
    input.planAreaId === 'water_nan' || input.specialZoneIds.includes('water_nan')

  if (isWaterNan) {
    return {
      moduleCode: 'MOD_03',
      moduleName: '水湳經貿園區都審',
      status: 'required',
      triggerReason: '基地位於水湳經貿園區，需依水湳獨立都審程序辦理，所有案件無面積門檻限制',
      legalBasis: [
        '台中市水湳經貿園區都市設計管制要點',
        '台中市水湳經貿園區特定區計畫書',
      ],
      priority: 1,
      notes: '建蔽率、容積率需依水湳特定區計畫書規定（勿套用一般分區）；建築外觀需符合國際商務形象設計準則',
    }
  }

  return {
    moduleCode: 'MOD_03',
    moduleName: '水湳經貿園區都審',
    status: 'not_required',
    triggerReason: '基地未位於水湳經貿園區',
    legalBasis: [],
    priority: 3,
  }
}

function checkMOD04(input: BuildingInput): CheckResult {
  const isHighRise = input.floorsAbove >= 16 || input.heightM > 50
  const isNearThreshold =
    input.floorsAbove === 15 || (input.heightM >= 45 && input.heightM <= 50)

  if (isHighRise) {
    return {
      moduleCode: 'MOD_04',
      moduleName: '高層建築物',
      status: 'required',
      triggerReason: `地上 ${input.floorsAbove}F / 高度 ${input.heightM}m → 符合高層建築物定義（≥16層 或 >50m）`,
      legalBasis: [
        '建築技術規則設計施工編 §227～§281',
        '台中市高層建築物審查作業要點',
      ],
      priority: 1,
      notes: '需辦理：台中市高層建築審查 → 結構審查 → 都審 → 建照（依序）',
    }
  }

  if (isNearThreshold) {
    return {
      moduleCode: 'MOD_04',
      moduleName: '高層建築物',
      status: 'manual_review',
      triggerReason: `地上 ${input.floorsAbove}F / 高度 ${input.heightM}m → 接近高層建築物門檻（15層 或 45～50m），請精確計算含屋突、機電層之總高度`,
      legalBasis: ['建築技術規則設計施工編 §227', '台中市高層建築物審查作業要點'],
      priority: 1,
      notes: '屋突面積超過建築面積 1/8 時計入建築高度，務必確認計算方式',
    }
  }

  return {
    moduleCode: 'MOD_04',
    moduleName: '高層建築物',
    status: 'not_required',
    triggerReason: `地上 ${input.floorsAbove}F / 高度 ${input.heightM}m → 未達高層建築物門檻`,
    legalBasis: [],
    priority: 3,
  }
}

function checkMOD05(input: BuildingInput): CheckResult {
  if (input.isHazardRebuild) {
    return {
      moduleCode: 'MOD_05',
      moduleName: '危老重建',
      status: 'required',
      triggerReason: '申請危老重建，需辦理危老認定及容積獎勵申請',
      legalBasis: [
        '都市危險及老舊建築物加速重建條例 §3、§6',
        '台中市辦理都市危險及老舊建築物加速重建審查作業要點',
      ],
      priority: 1,
      notes: '時程獎勵逐年遞減，請確認當年度有效獎勵率。容積獎勵上限：法定容積 40%',
    }
  }

  return {
    moduleCode: 'MOD_05',
    moduleName: '危老重建',
    status: 'not_required',
    triggerReason: '非危老重建案',
    legalBasis: [],
    priority: 3,
  }
}

function checkMOD06(input: BuildingInput): CheckResult {
  const notes: string[] = []
  if (input.floorsAbove >= 5) notes.push('5層以上需採防火構造')
  if (input.floorsAbove >= 4) notes.push('4層以上需設昇降設備（電梯）')
  if (input.totalFloorArea >= 500) notes.push('總樓地板面積 ≥ 500㎡ 需採防火構造')

  return {
    moduleCode: 'MOD_06',
    moduleName: '建築技術規則',
    status: 'required',
    triggerReason: '每案必辦：建蔽率、容積率、採光、通風、防火、避難等全面符合',
    legalBasis: [
      '建築技術規則建築設計施工編',
      '建築技術規則建築構造篇',
      '建築技術規則建築設備篇',
    ],
    priority: 1,
    notes: notes.length > 0 ? notes.join('；') : undefined,
  }
}

function checkMOD07(input: BuildingInput): CheckResult {
  const isWaterNan = input.planAreaId === 'water_nan'

  if (input.buildingOwnership === 'public' && input.totalFloorArea >= 500) {
    return {
      moduleCode: 'MOD_07',
      moduleName: '綠建築',
      status: 'required',
      triggerReason: `公有建築物，${input.totalFloorArea.toLocaleString()}㎡ ≥ 500㎡，強制取得合格級以上綠建築標章`,
      legalBasis: ['建築技術規則設計施工編 §298-1', '公有建築物應辦理綠建築之範圍及作業要點'],
      priority: 1,
      notes: '建照申請需同時附綠建築候選證書',
    }
  }

  if (isWaterNan) {
    return {
      moduleCode: 'MOD_07',
      moduleName: '綠建築',
      status: 'manual_review',
      triggerReason: '水湳經貿園區部分分區要求取得綠建築標章，需確認所在分區之要求等級',
      legalBasis: [
        '台中市水湳經貿園區特定區計畫書',
        '建築技術規則設計施工編 §298-1',
      ],
      priority: 2,
    }
  }

  if (input.totalFloorArea >= 1000) {
    return {
      moduleCode: 'MOD_07',
      moduleName: '綠建築',
      status: 'conditional',
      triggerReason: `總樓地板面積 ${input.totalFloorArea.toLocaleString()}㎡ ≥ 1,000㎡，鼓勵申請綠建築標章（銀級以上可申請容積獎勵）`,
      legalBasis: ['建築技術規則設計施工編 §298-1'],
      priority: 2,
    }
  }

  return {
    moduleCode: 'MOD_07',
    moduleName: '綠建築',
    status: 'not_required',
    triggerReason: `${input.totalFloorArea.toLocaleString()}㎡ 未達 1,000㎡ 門檻，非強制申請`,
    legalBasis: [],
    priority: 3,
  }
}

function checkMOD08(input: BuildingInput): CheckResult {
  const residentialUses = ['住宅', '集合住宅', '住商混合', '住辦混合']
  if (residentialUses.includes(input.buildingUse)) {
    return {
      moduleCode: 'MOD_08',
      moduleName: '台中市宜居建築',
      status: 'conditional',
      triggerReason: `建築用途「${input.buildingUse}」含住宅，需確認是否達台中市宜居建築自治條例適用門檻`,
      legalBasis: ['台中市宜居建築自治條例'],
      priority: 2,
      notes: '台中市獨有地方法規，請查閱最新版本確認公設比、採光、戶外空間規定',
    }
  }

  return {
    moduleCode: 'MOD_08',
    moduleName: '台中市宜居建築',
    status: 'not_required',
    triggerReason: `建築用途「${input.buildingUse}」非住宅，不適用宜居建築條例`,
    legalBasis: [],
    priority: 3,
  }
}

function checkMOD09(input: BuildingInput): CheckResult {
  if (!input.isFarTransfer) {
    return {
      moduleCode: 'MOD_09',
      moduleName: '容積移轉',
      status: 'not_required',
      triggerReason: '未申請容積移轉',
      legalBasis: [],
      priority: 3,
    }
  }

  // 容積移轉限制區
  if (input.specialZoneIds.includes('far_transfer_restriction')) {
    return {
      moduleCode: 'MOD_09',
      moduleName: '容積移轉',
      status: 'manual_review',
      triggerReason: '基地位於容積移轉限制區，需確認是否有限制條件或需特別審查',
      legalBasis: ['都市計畫容積移轉實施辦法', '台中市辦理容積移轉審查作業要點'],
      priority: 1,
      notes: '請向台中市都市發展局確認本基地適用之容積移轉條件',
    }
  }

  return {
    moduleCode: 'MOD_09',
    moduleName: '容積移轉',
    status: 'required',
    triggerReason: '申請容積移轉，需辦理台中市容積移轉審查及地政登記',
    legalBasis: [
      '都市計畫容積移轉實施辦法 §6',
      '台中市辦理容積移轉審查作業要點',
    ],
    priority: 1,
    notes: '移入容積上限：一般 ≤ 法定容積 30%；古蹟/歷史建築送出 ≤ 40%',
  }
}

function checkMOD10(input: BuildingInput): CheckResult {
  if (input.isOpenSpace) {
    return {
      moduleCode: 'MOD_10',
      moduleName: '開放空間獎勵',
      status: 'required',
      triggerReason: '申請開放空間獎勵，需提供符合規定之公共開放空間並辦理審查',
      legalBasis: ['台中市建築物提供開放空間獎勵辦法'],
      priority: 2,
      notes: '開放空間需 24 小時對公眾開放，獎勵容積需與其他獎勵加總確認上限',
    }
  }

  return {
    moduleCode: 'MOD_10',
    moduleName: '開放空間獎勵',
    status: 'not_required',
    triggerReason: '未申請開放空間獎勵',
    legalBasis: [],
    priority: 3,
  }
}

function checkMOD11(input: BuildingInput): CheckResult {
  const notes: string[] = []
  if (['住宅', '集合住宅', '住商混合', '住辦混合'].includes(input.buildingUse) && input.residentialUnits > 0) {
    notes.push(`住宅 ${input.residentialUnits} 戶，依台中市規定計算停車需求`)
  }
  notes.push('複合用途需分別計算各用途停車需求後加總')

  return {
    moduleCode: 'MOD_11',
    moduleName: '停車空間',
    status: 'required',
    triggerReason: '每案必辦：依建築用途及樓地板面積計算法定停車位數',
    legalBasis: [
      '建築技術規則設計施工編 §59～§62',
      '台中市停車場設置管理規則',
    ],
    priority: 1,
    notes: notes.join('；'),
  }
}

function checkMOD12(input: BuildingInput): CheckResult {
  const publicUses = ['辦公', '商業', '旅館', '醫療', '學校', '政府機關', '住商混合']
  const isPublicUse = publicUses.includes(input.buildingUse)
  const isLargeResidential = input.residentialUnits >= 16
  const isPublicBuilding = input.buildingOwnership === 'public'

  if (isPublicUse || isLargeResidential || isPublicBuilding) {
    const reasons: string[] = []
    if (isPublicUse) reasons.push(`公眾使用建築物（${input.buildingUse}）`)
    if (isLargeResidential) reasons.push(`集合住宅 ${input.residentialUnits} 戶（≥16戶）`)
    if (isPublicBuilding) reasons.push('公有建築物')

    return {
      moduleCode: 'MOD_12',
      moduleName: '無障礙設施',
      status: 'required',
      triggerReason: reasons.join('、') + '，需設置無障礙設施',
      legalBasis: [
        '建築技術規則設計施工編 §167～§167-14',
        '建築物無障礙設施設計規範',
      ],
      priority: 1,
      notes: '電梯需符合無障礙規格（轎廂深≥135cm×寬≥110cm）；廁所門需向外開',
    }
  }

  if (input.floorsAbove >= 4) {
    return {
      moduleCode: 'MOD_12',
      moduleName: '無障礙設施',
      status: 'conditional',
      triggerReason: '4層以上建築物設電梯，電梯需符合無障礙規格',
      legalBasis: ['建築技術規則設計施工編 §167', '建築物無障礙設施設計規範'],
      priority: 2,
    }
  }

  return {
    moduleCode: 'MOD_12',
    moduleName: '無障礙設施',
    status: 'not_required',
    triggerReason: '未達無障礙設施強制設置條件',
    legalBasis: [],
    priority: 3,
  }
}

function checkMOD13(input: BuildingInput): CheckResult {
  const notes: string[] = []
  const highRiskUses = ['旅館', '醫療', '百貨', '量販', 'KTV', '影城']

  if (input.floorsAbove >= 11) {
    notes.push(`${input.floorsAbove}層以上：需設消防搶救出入口（每3層一處）、緊急電源插座`)
  }
  if (input.floorsAbove >= 4) {
    notes.push('4層以上需設緊急廣播系統')
  }
  if (highRiskUses.includes(input.buildingUse)) {
    notes.push(`「${input.buildingUse}」屬高風險場所，建議辦理消防局預審`)
  }
  if (input.totalFloorArea >= 1500) {
    notes.push('總樓地板面積達門檻，需評估自動灑水設備設置需求')
  }

  return {
    moduleCode: 'MOD_13',
    moduleName: '消防相關法規',
    status: 'required',
    triggerReason: '每案必辦：依場所類別（甲/乙/丙/丁/戊）設置消防安全設備',
    legalBasis: [
      '消防法 §6、§9',
      '各類場所消防安全設備設置標準',
      '建築技術規則設計施工編 §106～§108',
    ],
    priority: 1,
    notes: notes.length > 0 ? notes.join('；') : undefined,
  }
}

// ─── 特殊管制區觸發額外模組 ───────────────────────────────────

function checkSpecialZones(input: BuildingInput): CheckResult[] {
  const results: CheckResult[] = []

  // 捷運場站周邊
  if (input.specialZoneIds.includes('mrt_station')) {
    results.push({
      moduleCode: 'SZ_MRT',
      moduleName: '捷運場站周邊容積獎勵',
      status: 'conditional',
      triggerReason: '基地位於台中捷運場站 500 公尺範圍內，可申請捷運場站周邊容積獎勵',
      legalBasis: ['台中市大眾捷運系統土地開發辦法'],
      priority: 2,
      notes: '需查閱台中市當前有效之捷運場站周邊容積獎勵辦法，確認獎勵率與條件',
    })
  }

  // 高鐵特定區
  if (input.specialZoneIds.includes('hsr_special')) {
    results.push({
      moduleCode: 'SZ_HSR',
      moduleName: '高鐵特定區管制',
      status: 'manual_review',
      triggerReason: '基地位於台中高鐵特定區計畫範圍，建蔽率容積率依特定區計畫書規定',
      legalBasis: ['台中高鐵特定區都市計畫書'],
      priority: 1,
      notes: '請查詢高鐵特定區計畫書，確認本基地適用之管制規定',
    })
  }

  // 文化資產保存範圍
  if (input.specialZoneIds.includes('cultural_heritage')) {
    results.push({
      moduleCode: 'SZ_HERITAGE',
      moduleName: '文化資產保存範圍',
      status: 'manual_review',
      triggerReason: '基地位於文化資產保存範圍內或周邊，需取得文化局審查同意',
      legalBasis: ['文化資產保存法 §34、§42'],
      priority: 1,
      notes: '建築設計需符合文化資產保存法規定，可能有高度、量體、外觀限制',
    })
  }

  // 山坡地
  if (input.specialZoneIds.includes('hillside')) {
    results.push({
      moduleCode: 'SZ_HILLSIDE',
      moduleName: '山坡地建築管制',
      status: 'required',
      triggerReason: '基地位於山坡地範圍，需依山坡地建築管理辦法辦理',
      legalBasis: ['山坡地建築管理辦法', '水土保持法'],
      priority: 1,
      notes: '需辦理水土保持計畫，基地坡度超過一定角度有建築限制',
    })
  }

  // 地質敏感區
  if (input.specialZoneIds.includes('geological_sensitive')) {
    results.push({
      moduleCode: 'SZ_GEO',
      moduleName: '地質敏感區基地調查',
      status: 'required',
      triggerReason: '基地位於地質法公告之地質敏感區，需辦理基地地質調查及安全評估',
      legalBasis: ['地質法 §8', '建築基地地質調查及地質安全評估辦法'],
      priority: 1,
      notes: '建照申請前需取得地質調查報告，活動斷層帶內禁止建造供人居住或公眾使用之建築物',
    })
  }

  return results
}

// ─── 多重容積獎勵加總警告 ─────────────────────────────────────

function checkFarBonusTotal(input: BuildingInput): CheckResult[] {
  const results: CheckResult[] = []
  const planArea = getPlanAreaById(input.planAreaId)
  const committeeThreshold = planArea?.farBonus.committeeThreshold ?? 1.30

  const bonusCount =
    (input.isHazardRebuild ? 1 : 0) +
    (input.isFarTransfer ? 1 : 0) +
    (input.isOpenSpace ? 1 : 0)

  if (bonusCount >= 2) {
    const thresholdPct = Math.round(committeeThreshold * 100)
    results.push({
      moduleCode: 'MAN_FAR',
      moduleName: '容積獎勵加總上限確認',
      status: 'manual_review',
      triggerReason: `本案申請多項容積獎勵（${bonusCount} 項），需確認加總後是否超過法定容積 ${thresholdPct}%（超過需提都委會審議）`,
      legalBasis: ['都市計畫法 §50-1', planArea?.name ? `${planArea.name} 容積獎勵規定` : '台中市相關容積獎勵辦法'],
      priority: 1,
      notes: `【${planArea?.shortName ?? '本計畫區'}】容積獎勵加總上限：${Math.round((planArea?.farBonus.maxTotalBonus ?? 1.5) * 100)}% 法定容積`,
    })
  }

  // 高層建築時程提醒
  if (input.floorsAbove >= 16 || input.heightM > 50) {
    results.push({
      moduleCode: 'MAN_HIGHRISE_SCHEDULE',
      moduleName: '高層建築物審查時程規劃',
      status: 'manual_review',
      triggerReason: '高層建築物需多程序並行，需提前規劃整體時程',
      legalBasis: ['台中市高層建築物審查作業要點'],
      priority: 1,
      notes: '建議時程：台中市高層審查（2-3月）→ 都審（2-4月）→ 結構審查（1-2月）→ 建照申請',
    })
  }

  return results
}

// ─── 主要匯出函式 ─────────────────────────────────────────────

export function runCheck(input: BuildingInput): CheckReport {
  const rulesetInfo = resolveRuleset(input)

  const allResults: CheckResult[] = [
    checkMOD01(input),
    checkMOD02(input),
    checkMOD03(input),
    checkMOD04(input),
    checkMOD05(input),
    checkMOD06(input),
    checkMOD07(input),
    checkMOD08(input),
    checkMOD09(input),
    checkMOD10(input),
    checkMOD11(input),
    checkMOD12(input),
    checkMOD13(input),
    ...checkSpecialZones(input),
    ...checkFarBonusTotal(input),
  ]

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
