import type { LandParcel, LandQueryResult, BuildingInput } from '@/types'

// ─── Mock 地號資料庫 ───────────────────────────────────────────

const MOCK_PARCELS: LandParcel[] = [
  {
    city: '台中市',
    district: '西屯區',
    section: '惠來段',
    number: '123-5',
    area: 1250.8,
    zoneType: '第三種住宅區',
    maxBuildingCoverage: 45,
    maxFar: 225,
    planAreaId: 'seventh_phase',
    planAreaName: '七期重劃區',
    overlayZones: ['urban_design'],
    urbanDesignRequired: true,
    urbanDesignAuthority: '台中市政府都市發展局',
    isHillside: false,
    isGeologicalSensitive: false,
    isCulturalHeritage: false,
    isFloodRisk: false,
    notes: ['位於七期重劃區，都審門檻較低（1,500㎡）', '建築外觀景觀管制嚴格'],
    dataSource: 'Mock Data（正式版將串接台中市地政局地籍查詢）',
    lastUpdated: '2024-01-01',
  },
  {
    city: '台中市',
    district: '西屯區',
    section: '水湳段',
    number: '456-2',
    area: 3800.0,
    zoneType: '國際商務區',
    maxBuildingCoverage: 60,
    maxFar: 800,
    planAreaId: 'water_nan',
    planAreaName: '水湳經貿園區',
    overlayZones: ['water_nan'],
    urbanDesignRequired: true,
    urbanDesignAuthority: '台中市水湳經貿園區管理局',
    isHillside: false,
    isGeologicalSensitive: false,
    isCulturalHeritage: false,
    isFloodRisk: false,
    notes: [
      '水湳園區採獨立都審，所有案件無面積門檻',
      '容積率依特定區計畫書（最高 800%）',
      '建築外觀需符合國際商務形象設計準則',
    ],
    dataSource: 'Mock Data（正式版將串接台中市地政局地籍查詢）',
    lastUpdated: '2024-01-01',
  },
  {
    city: '台中市',
    district: '北屯區',
    section: '軍功段',
    number: '789-1',
    area: 650.5,
    zoneType: '第二種住宅區',
    maxBuildingCoverage: 45,
    maxFar: 160,
    planAreaId: 'general_taichung',
    planAreaName: '台中市一般都市計畫區',
    overlayZones: ['urban_design', 'mrt_station'],
    urbanDesignRequired: false,
    urbanDesignAuthority: '台中市政府都市發展局',
    isHillside: false,
    isGeologicalSensitive: false,
    isCulturalHeritage: false,
    isFloodRisk: false,
    notes: ['位於台中捷運場站 500 公尺範圍內，可申請捷運容積獎勵'],
    dataSource: 'Mock Data（正式版將串接台中市地政局地籍查詢）',
    lastUpdated: '2024-01-01',
  },
  {
    city: '台中市',
    district: '太平區',
    section: '頭汴段',
    number: '321-8',
    area: 1500.0,
    zoneType: '農業區',
    maxBuildingCoverage: 10,
    maxFar: 40,
    planAreaId: 'general_taichung',
    planAreaName: '台中市一般都市計畫區',
    overlayZones: ['hillside', 'geological_sensitive'],
    urbanDesignRequired: false,
    urbanDesignAuthority: '台中市政府都市發展局',
    isHillside: true,
    isGeologicalSensitive: true,
    isCulturalHeritage: false,
    isFloodRisk: false,
    notes: [
      '位於山坡地範圍，需依山坡地建築管理辦法辦理水土保持計畫',
      '位於地質敏感區，建照申請前需取得地質調查報告',
    ],
    dataSource: 'Mock Data（正式版將串接台中市地政局地籍查詢）',
    lastUpdated: '2024-01-01',
  },
  {
    city: '台中市',
    district: '中區',
    section: '台中段',
    number: '88-3',
    area: 420.0,
    zoneType: '商業區',
    maxBuildingCoverage: 70,
    maxFar: 560,
    planAreaId: 'general_taichung',
    planAreaName: '台中市一般都市計畫區',
    overlayZones: ['urban_design', 'cultural_heritage'],
    urbanDesignRequired: true,
    urbanDesignAuthority: '台中市政府都市發展局',
    isHillside: false,
    isGeologicalSensitive: false,
    isCulturalHeritage: true,
    isFloodRisk: false,
    notes: [
      '位於台中歷史風貌特定專用區範圍，需取得文化局審查同意',
      '建築設計需符合周邊歷史風貌',
    ],
    dataSource: 'Mock Data（正式版將串接台中市地政局地籍查詢）',
    lastUpdated: '2024-01-01',
  },
]

const TAICHUNG_SECTIONS: Record<string, string[]> = {
  西屯區: ['惠來段', '水湳段', '西屯段', '福科段', '中港段'],
  北屯區: ['軍功段', '大坑段', '北屯段', '四民段'],
  南屯區: ['南屯段', '大容段', '文山段'],
  東區:   ['東區段', '旱溪段'],
  西區:   ['西區段', '梅川段'],
  北區:   ['北區段', '崇德段'],
  中區:   ['台中段', '綠川段'],
  太平區: ['頭汴段', '太平段'],
  大里區: ['大里段', '塗城段'],
  霧峰區: ['霧峰段', '峰谷段'],
  潭子區: ['潭子段', '頭家段'],
  豐原區: ['豐原段', '翁子段'],
}

// ─── 查詢函式 ─────────────────────────────────────────────────

export function queryLandParcel(
  city: string,
  district: string,
  section: string,
  number: string
): LandQueryResult {
  const query = { city, district, section, number }

  const parcel = MOCK_PARCELS.find(
    (p) =>
      p.city === city &&
      p.district === district &&
      p.section === section &&
      p.number === number
  )

  if (parcel) {
    const nearby = MOCK_PARCELS.filter(
      (p) => p.district === district && p.number !== number
    ).slice(0, 2)
    return { query, found: true, parcel, nearbyParcels: nearby }
  }

  return {
    query,
    found: false,
    message: `查無「${city}${district}${section}${number}地號」資料。目前為 Mock 資料模式，正式版將串接台中市地政局地籍查詢系統。`,
  }
}

// ─── 地號資料 → BuildingInput 自動帶入映射 ──────────────────────

/**
 * 將查詢結果自動帶入 BuildingInput 初始值，
 * 讓使用者進入法規檢核時已預填好基地資訊。
 */
export function parcelToBuildingInput(parcel: LandParcel): Partial<BuildingInput> {
  // 整合特殊管制區（overlayZones + 各 flag）
  const specialZoneIds = [...parcel.overlayZones]
  if (parcel.isHillside && !specialZoneIds.includes('hillside')) {
    specialZoneIds.push('hillside')
  }
  if (parcel.isGeologicalSensitive && !specialZoneIds.includes('geological_sensitive')) {
    specialZoneIds.push('geological_sensitive')
  }
  if (parcel.isCulturalHeritage && !specialZoneIds.includes('cultural_heritage')) {
    specialZoneIds.push('cultural_heritage')
  }

  return {
    district:       parcel.district,
    planAreaId:     parcel.planAreaId,
    specialZoneIds,
    zoneType:       parcel.zoneType,
    landArea:       parcel.area,
    // 其他欄位（用途、樓層等）由使用者手動補填
  }
}

export { TAICHUNG_SECTIONS }
