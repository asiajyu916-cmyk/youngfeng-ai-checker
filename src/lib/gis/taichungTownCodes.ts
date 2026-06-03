/**
 * 台中市行政區 → NLSC 鄉鎮代碼對應表
 *
 * NLSC 縣市代碼：B（臺中市）
 * 資料來源：COM_004 代碼服務－鄉鎮市區清單（開放 API，無需授權）
 * API：https://api.nlsc.gov.tw/other/ListLandTown/B
 */

/** 行政區名稱 → NLSC 鄉鎮代碼 */
export const TAICHUNG_TOWN_CODES: Record<string, string> = {
  '中區': 'B01',
  '東區': 'B02',
  '南區': 'B03',
  '西區': 'B04',
  '北區': 'B05',
  '西屯區': 'B06',
  '南屯區': 'B07',
  '北屯區': 'B08',
  '豐原區': 'B09',
  '東勢區': 'B10',
  '大甲區': 'B11',
  '清水區': 'B12',
  '沙鹿區': 'B13',
  '梧棲區': 'B14',
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

/** 行政區名稱 → NLSC 鄉鎮代碼（支援有無「區」字） */
export function getTownCode(district: string): string | undefined {
  if (TAICHUNG_TOWN_CODES[district]) return TAICHUNG_TOWN_CODES[district]
  const withSuffix = district.endsWith('區') ? district : district + '區'
  return TAICHUNG_TOWN_CODES[withSuffix]
}

/** 所有行政區名稱（依代碼排序） */
export const TAICHUNG_DISTRICTS_ORDERED = Object.keys(TAICHUNG_TOWN_CODES)
