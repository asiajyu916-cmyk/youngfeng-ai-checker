/**
 * 台中市行政區 → NLSC 鄉鎮代碼對應表
 *
 * NLSC API 縣市代碼：B（臺中市）
 * 資料來源：TownVillagePointQuery 實際回應值
 * 最後更新：2026-06
 */

export const TAICHUNG_TOWN_CODES: Record<string, string> = {
  // 原台中市區
  '中區': 'B01',
  '東區': 'B02',
  '南區': 'B03',
  '西區': 'B04',
  '北區': 'B05',
  '西屯區': 'B06',
  '南屯區': 'B07',
  '北屯區': 'B08',
  // 原台中縣轄市
  '豐原區': 'B09',
  '東勢區': 'B10',
  '大甲區': 'B11',
  '清水區': 'B12',
  '沙鹿區': 'B13',
  '梧棲區': 'B14',
  // 鄉
  '后里區': 'B15',
  '神岡區': 'B16',
  '潭子區': 'B17',
  '大雅區': 'B18',
  '新社區': 'B19',
  '石岡區': 'B20',
  '外埔區': 'B21',
  '大安區': 'B22',
  '烏日區': 'B23',
  '大肚區': 'B24',
  '龍井區': 'B25',
  '霧峰區': 'B26',
  '太平區': 'B27',
  '大里區': 'B28',
  '和平區': 'B29',
}

/** 根據行政區中文名稱取得 NLSC 鄉鎮代碼。支援有無「區」字。 */
export function getTownCode(district: string): string | undefined {
  // 嘗試完整名稱
  if (TAICHUNG_TOWN_CODES[district]) return TAICHUNG_TOWN_CODES[district]
  // 補「區」後再找（e.g. 輸入「北」→「北區」）
  const withSuffix = district.endsWith('區') ? district : district + '區'
  return TAICHUNG_TOWN_CODES[withSuffix]
}
