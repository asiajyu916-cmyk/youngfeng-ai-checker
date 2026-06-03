/**
 * 台中市都市計畫土地使用分區資料表（Mock）
 * 資料來源：臺中市都市計畫圖GIS（114年版）
 * https://opendata.taichung.gov.tw/search/13717923-3e4b-4032-9072-3a51ab985883
 *
 * 正式版將由 TaichungUrbanPlanAdapter 自動匯入 SHP / GeoJSON / CSV。
 * 建蔽率、容積率依《台中市都市計畫土地使用分區管制自治條例》。
 */

import type { ZoningArea } from '@/lib/adapters/types'

// ─── 輔助：建立地段資料 ────────────────────────────────────────

function z(
  id: string,
  district: string,
  section: string,
  zone_name: string,
  zone_short_name: string,
  coverage_ratio: number,
  floor_area_ratio: number,
  urban_plan_name: string,
  detail_plan_name: string,
  opts: Partial<ZoningArea> = {}
): ZoningArea {
  return {
    id,
    district,
    section,
    zone_name,
    zone_short_name,
    urban_plan_name,
    detail_plan_name,
    coverage_ratio,
    floor_area_ratio,
    updated_at: '2025-03-01',
    ...opts,
  }
}

// ─── 主資料表 ─────────────────────────────────────────────────

export const ZONING_AREAS: ZoningArea[] = [

  // ════════════════════════════════════════════════════════════
  // 中區
  // ════════════════════════════════════════════════════════════
  z('Z001','中區','中正地段','第二種商業區','商二',65,360,
    '台中市都市計畫區','台中市中心商業區細部計畫',
    { max_far:432, project_name:'台中市都市計畫（中區商業區）',
      announcement_no:'中市府都計字第1130000123號',
      suggested_plan_area_id:'general_taichung', suggested_zone_type:'商二',
      note:'臺中舊城核心，部分路段有騎樓強制規定' }),

  z('Z002','中區','自由地段','第三種商業區','商三',70,480,
    '台中市都市計畫區','台中市中心商業區細部計畫',
    { max_far:576, suggested_plan_area_id:'general_taichung', suggested_zone_type:'商三' }),

  z('Z003','中區','台灣大道地段','第三種住宅區','住三',50,180,
    '台中市都市計畫區','台中市舊市區細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住三' }),

  // ════════════════════════════════════════════════════════════
  // 北區
  // ════════════════════════════════════════════════════════════
  z('Z010','北區','賴源地段','第三種住宅區','住三',50,180,
    '台中市都市計畫區','台中市北區細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住三' }),

  z('Z011','北區','漢口地段','第三種住宅區','住三',50,180,
    '台中市都市計畫區','台中市北區細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住三' }),

  z('Z012','北區','文心地段','第四種住宅區','住四',50,240,
    '台中市都市計畫區','台中市北區細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住四',
      note:'鄰近文心路商業帶，部分路段為住商混合' }),

  z('Z013','北區','北平地段','第二種住宅區','住二',40,120,
    '台中市都市計畫區','台中市北區細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住二' }),

  // ════════════════════════════════════════════════════════════
  // 西區
  // ════════════════════════════════════════════════════════════
  z('Z020','西區','美村地段','第三種住宅區','住三',50,180,
    '台中市都市計畫區','台中市西區細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住三' }),

  z('Z021','西區','台中地段','第三種商業區','商三',70,480,
    '台中市都市計畫區','台中市西區細部計畫',
    { max_far:576, suggested_plan_area_id:'general_taichung', suggested_zone_type:'商三' }),

  // ════════════════════════════════════════════════════════════
  // 東區
  // ════════════════════════════════════════════════════════════
  z('Z030','東區','進化地段','第三種住宅區','住三',50,180,
    '台中市都市計畫區','台中市東區細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住三' }),

  z('Z031','東區','旱溪地段','第二種住宅區','住二',40,120,
    '台中市都市計畫區','台中市東區細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住二',
      note:'部分地區為工業區轉型中，請確認實際使用分區' }),

  z('Z032','東區','復興地段','第三種住宅區','住三',50,180,
    '台中市都市計畫區','台中市東區細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住三' }),

  // ════════════════════════════════════════════════════════════
  // 南區
  // ════════════════════════════════════════════════════════════
  z('Z040','南區','建國地段','第三種住宅區','住三',50,180,
    '台中市都市計畫區','台中市南區細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住三' }),

  z('Z041','南區','崇德地段','第二種住宅區','住二',40,120,
    '台中市都市計畫區','台中市南區細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住二' }),

  // ════════════════════════════════════════════════════════════
  // 北屯區
  // ════════════════════════════════════════════════════════════
  z('Z050','北屯區','北屯地段','第三種住宅區','住三',50,180,
    '台中市都市計畫區','台中市北屯區細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住三' }),

  z('Z051','北屯區','軍功地段','第二種住宅區','住二',40,120,
    '台中市都市計畫區','台中市北屯區細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住二' }),

  z('Z052','北屯區','水湳地段','第四種住宅區','住四',50,240,
    '台中市都市計畫區','台中市北屯區細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住四',
      note:'鄰近水湳園區，注意分區邊界' }),

  z('Z053','北屯區','松竹地段','第三種住宅區','住三',50,180,
    '台中市都市計畫區','台中市北屯區細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住三' }),

  z('Z054','北屯區','四平地段','第三種商業區','商三',70,480,
    '台中市都市計畫區','台中市北屯區細部計畫',
    { max_far:576, suggested_plan_area_id:'general_taichung', suggested_zone_type:'商三' }),

  // ════════════════════════════════════════════════════════════
  // 西屯區
  // ════════════════════════════════════════════════════════════
  z('Z060','西屯區','惠來地段','第三種住宅區','住三',50,180,
    '台中市第七期市地重劃區','七期重劃區細部計畫',
    { max_far:216, project_name:'台中市第七期市地重劃區都市計畫',
      announcement_no:'中市府都計字第1130007001號',
      suggested_plan_area_id:'seventh_phase', suggested_zone_type:'住三',
      note:'都審門檻1,500㎡，景觀管制嚴格，臨公園基地另有退縮規定' }),

  z('Z061','西屯區','惠來地段','第四種商業區','商四',60,560,
    '台中市第七期市地重劃區','七期重劃區細部計畫',
    { max_far:672, suggested_plan_area_id:'seventh_phase', suggested_zone_type:'商四',
      note:'視覺走廊管制範圍，建築高度需符合七期都市設計準則' }),

  z('Z062','西屯區','水湳地段','商業核心區','商業核心',60,400,
    '水湳經貿園區特定區','水湳經貿園區細部計畫',
    { max_far:480, project_name:'台中市水湳經貿園區特定區計畫',
      announcement_no:'中市府都計字第1130008888號',
      suggested_plan_area_id:'water_nan', suggested_zone_type:'商三',
      note:'獨立都審，所有案件無面積門檻。容積率依特定區計畫書（最高800%）' }),

  z('Z063','西屯區','水湳地段','商務辦公區','商辦',55,350,
    '水湳經貿園區特定區','水湳經貿園區細部計畫',
    { max_far:420, suggested_plan_area_id:'water_nan', suggested_zone_type:'商三',
      note:'建築外觀需符合水湳國際商務形象設計準則' }),

  z('Z064','西屯區','台灣大道地段','第三種商業區','商三',70,480,
    '台中市都市計畫區','台中市西屯區細部計畫',
    { max_far:576, suggested_plan_area_id:'general_taichung', suggested_zone_type:'商三' }),

  z('Z065','西屯區','西屯地段','第三種住宅區','住三',50,180,
    '台中市都市計畫區','台中市西屯區細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住三' }),

  // ════════════════════════════════════════════════════════════
  // 南屯區
  // ════════════════════════════════════════════════════════════
  z('Z070','南屯區','南屯地段','第三種住宅區','住三',50,180,
    '台中市第七期市地重劃區','七期重劃區細部計畫（南側）',
    { suggested_plan_area_id:'seventh_phase', suggested_zone_type:'住三',
      note:'都審門檻1,500㎡' }),

  z('Z071','南屯區','文心地段','第四種住宅區','住四',50,240,
    '台中市都市計畫區','台中市南屯區細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住四' }),

  z('Z072','南屯區','大墩地段','第三種商業區','商三',70,480,
    '台中市都市計畫區','台中市南屯區細部計畫',
    { max_far:576, suggested_plan_area_id:'general_taichung', suggested_zone_type:'商三' }),

  z('Z073','南屯區','工業地段','甲種工業區','工業',70,300,
    '台中市都市計畫區','台中市南屯區細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'工業區',
      note:'甲種工業區，建築用途受工業使用限制' }),

  // ════════════════════════════════════════════════════════════
  // 豐原區
  // ════════════════════════════════════════════════════════════
  z('Z080','豐原區','豐原地段','第三種住宅區','住三',50,180,
    '豐原都市計畫區','豐原都市計畫細部計畫',
    { suggested_plan_area_id:'fengyuan', suggested_zone_type:'住三' }),

  z('Z081','豐原區','豐樂地段','第三種商業區','商三',70,480,
    '豐原都市計畫區','豐原都市計畫細部計畫',
    { max_far:576, suggested_plan_area_id:'fengyuan', suggested_zone_type:'商三' }),

  z('Z082','豐原區','陽明地段','第二種住宅區','住二',40,120,
    '豐原都市計畫區','豐原都市計畫細部計畫',
    { suggested_plan_area_id:'fengyuan', suggested_zone_type:'住二' }),

  // ════════════════════════════════════════════════════════════
  // 大里區
  // ════════════════════════════════════════════════════════════
  z('Z090','大里區','大里地段','第三種住宅區','住三',50,180,
    '大里都市計畫區','大里都市計畫細部計畫',
    { suggested_plan_area_id:'dali', suggested_zone_type:'住三' }),

  z('Z091','大里區','東湖地段','第二種住宅區','住二',40,120,
    '大里都市計畫區','大里都市計畫細部計畫',
    { suggested_plan_area_id:'dali', suggested_zone_type:'住二' }),

  z('Z092','大里區','工業地段','乙種工業區','工業',60,210,
    '大里都市計畫區','大里都市計畫細部計畫',
    { suggested_plan_area_id:'dali', suggested_zone_type:'工業區',
      note:'乙種工業區，限制工業及倉儲使用' }),

  // ════════════════════════════════════════════════════════════
  // 太平區
  // ════════════════════════════════════════════════════════════
  z('Z100','太平區','太平地段','第三種住宅區','住三',50,180,
    '太平都市計畫區','太平都市計畫細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住三' }),

  z('Z101','太平區','頭汴坑地段','第二種住宅區','住二',40,120,
    '太平都市計畫區','太平都市計畫細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住二' }),

  // ════════════════════════════════════════════════════════════
  // 清水區
  // ════════════════════════════════════════════════════════════
  z('Z110','清水區','清水地段','第三種住宅區','住三',50,180,
    '台中港特定區都市計畫區','清水市區細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住三' }),

  z('Z111','清水區','田寮地段','第二種商業區','商二',65,360,
    '台中港特定區都市計畫區','清水市區細部計畫',
    { max_far:432, suggested_plan_area_id:'general_taichung', suggested_zone_type:'商二' }),

  // ════════════════════════════════════════════════════════════
  // 沙鹿區
  // ════════════════════════════════════════════════════════════
  z('Z120','沙鹿區','沙鹿地段','第三種住宅區','住三',50,180,
    '台中港特定區都市計畫區','沙鹿市區細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住三' }),

  z('Z121','沙鹿區','鹿峰地段','第二種住宅區','住二',40,120,
    '台中港特定區都市計畫區','沙鹿市區細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住二' }),

  // ════════════════════════════════════════════════════════════
  // 梧棲區
  // ════════════════════════════════════════════════════════════
  z('Z130','梧棲區','梧棲地段','第二種商業區','商二',65,360,
    '台中港特定區都市計畫區','梧棲市區細部計畫',
    { max_far:432, suggested_plan_area_id:'general_taichung', suggested_zone_type:'商二' }),

  z('Z131','梧棲區','大庄地段','甲種工業區','工業',70,300,
    '台中港特定區都市計畫區','台中港工業區細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'工業區',
      note:'台中港工業區，需注意港區特別管制規定' }),

  // ════════════════════════════════════════════════════════════
  // 烏日區
  // ════════════════════════════════════════════════════════════
  z('Z140','烏日區','烏日地段','第三種住宅區','住三',50,180,
    '台中市都市計畫區','烏日細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住三' }),

  z('Z141','烏日區','高鐵地段','高鐵特定區（商業）','高鐵商',65,400,
    '高鐵台中站特定區都市計畫','高鐵台中站特定區細部計畫',
    { max_far:480, project_name:'高鐵台中站特定區都市計畫',
      announcement_no:'中市府都計字第1130006000號',
      suggested_plan_area_id:'general_taichung', suggested_zone_type:'商三',
      note:'高鐵特定區，容積率及建築計畫依特定區計畫書規定' }),

  // ════════════════════════════════════════════════════════════
  // 大甲區
  // ════════════════════════════════════════════════════════════
  z('Z150','大甲區','大甲地段','第三種住宅區','住三',50,180,
    '大甲都市計畫區','大甲市區細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住三' }),

  z('Z151','大甲區','鎮政地段','第二種商業區','商二',65,360,
    '大甲都市計畫區','大甲市區細部計畫',
    { max_far:432, suggested_plan_area_id:'general_taichung', suggested_zone_type:'商二' }),

  // ════════════════════════════════════════════════════════════
  // 潭子區
  // ════════════════════════════════════════════════════════════
  z('Z160','潭子區','潭子地段','第三種住宅區','住三',50,180,
    '台中市都市計畫區','潭子細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住三' }),

  z('Z161','潭子區','聚興地段','乙種工業區','工業',60,210,
    '台中市都市計畫區','潭子工業區細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'工業區' }),

  // ════════════════════════════════════════════════════════════
  // 大雅區
  // ════════════════════════════════════════════════════════════
  z('Z170','大雅區','大雅地段','第三種住宅區','住三',50,180,
    '台中市都市計畫區','大雅細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住三' }),

  // ════════════════════════════════════════════════════════════
  // 神岡區
  // ════════════════════════════════════════════════════════════
  z('Z180','神岡區','神岡地段','第三種住宅區','住三',50,180,
    '台中市都市計畫區','神岡細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住三' }),

  // ════════════════════════════════════════════════════════════
  // 霧峰區
  // ════════════════════════════════════════════════════════════
  z('Z190','霧峰區','霧峰地段','第三種住宅區','住三',50,180,
    '台中市都市計畫區','霧峰細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'住三' }),

  z('Z191','霧峰區','霧峰地段','文化資產保存區','文資',30,60,
    '台中市都市計畫區','霧峰光復新村細部計畫',
    { suggested_plan_area_id:'general_taichung', suggested_zone_type:'其他',
      note:'光復新村文化資產保存區，需依文化資產保存法規定辦理' }),
]

// ─── 查詢工具 ─────────────────────────────────────────────────

/** 取得某行政區所有地段（去重排序） */
export function getSectionsByDistrict(district: string): string[] {
  const sections = ZONING_AREAS
    .filter(z => z.district === district)
    .map(z => z.section)
  return [...new Set(sections)].sort()
}

/** 依行政區 + 地段查詢分區（可能有複數筆——同地段跨分區） */
export function queryZoningAreas(district: string, section: string): ZoningArea[] {
  return ZONING_AREAS.filter(
    z => z.district === district && z.section === section
  )
}

/** 取得所有有資料的行政區（去重排序） */
export function getAvailableDistricts(): string[] {
  return [...new Set(ZONING_AREAS.map(z => z.district))].sort()
}
