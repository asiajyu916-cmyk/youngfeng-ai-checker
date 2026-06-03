/**
 * TWD97 TM2 (EPSG:3826) → WGS84 逆投影
 *
 * 台灣二度分帶座標（TWD97/TM2）轉換為 WGS84 經緯度。
 * 中央子午線：121°E（台灣本島），參數與 EPSG:3826 一致。
 *
 * 演算法：Transverse Mercator 逆投影（標準 Bowring 迭代法）
 * 參考：EPSG 投影參數 + 內政部座標轉換說明
 */

// ─── EPSG:3826 TM2 參數 ──────────────────────────────────────────

const a  = 6378137.0          // GRS80 長半軸（公尺）
const f  = 1 / 298.257222101  // 扁率
const b  = a * (1 - f)        // 短半軸
const e2 = 1 - (b * b) / (a * a)  // 第一離心率平方
const e  = Math.sqrt(e2)

const k0  = 0.9999            // 中央子午線尺度係數
const lon0 = 121 * Math.PI / 180  // 中央子午線（弧度）
const E0  = 250000.0          // 東向假原點（公尺）
const N0  = 0.0               // 北向假原點（公尺）

/**
 * TWD97 TM2 → WGS84
 *
 * @param easting  東向座標（公尺），即 X
 * @param northing 北向座標（公尺），即 Y
 * @returns [lng, lat] WGS84 十進制度（經度在前，緯度在後）
 */
export function twd97ToWgs84(easting: number, northing: number): [number, number] {
  const x = easting  - E0
  const y = northing - N0

  // 步驟 1：計算 M（子午弧長）初始估計
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2))

  const M = y / k0
  const mu = M / (a * (1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256))

  const phi1 = mu
    + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu)
    + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu)
    + (151 * e1 ** 3 / 96) * Math.sin(6 * mu)
    + (1097 * e1 ** 4 / 512) * Math.sin(8 * mu)

  // 步驟 2：計算輔助量
  const sinPhi1 = Math.sin(phi1)
  const cosPhi1 = Math.cos(phi1)
  const tanPhi1 = sinPhi1 / cosPhi1

  const N1 = a / Math.sqrt(1 - e2 * sinPhi1 ** 2)
  const T1 = tanPhi1 ** 2
  const C1 = (e2 / (1 - e2)) * cosPhi1 ** 2
  const R1 = a * (1 - e2) / Math.pow(1 - e2 * sinPhi1 ** 2, 1.5)
  const D  = x / (N1 * k0)

  // 步驟 3：緯度
  const lat = phi1
    - (N1 * tanPhi1 / R1) * (
        D ** 2 / 2
      - (5 + 3 * T1 + 10 * C1 - 4 * C1 ** 2 - 9 * (e2 / (1 - e2))) * D ** 4 / 24
      + (61 + 90 * T1 + 298 * C1 + 45 * T1 ** 2 - 252 * (e2 / (1 - e2)) - 3 * C1 ** 2) * D ** 6 / 720
    )

  // 步驟 4：經度
  const lon = lon0 + (
      D
    - (1 + 2 * T1 + C1) * D ** 3 / 6
    + (5 - 2 * C1 + 28 * T1 - 3 * C1 ** 2 + 8 * (e2 / (1 - e2)) + 24 * T1 ** 2) * D ** 5 / 120
  ) / cosPhi1

  const latDeg = lat * 180 / Math.PI
  const lonDeg = lon * 180 / Math.PI

  return [lonDeg, latDeg]  // [lng, lat] — GeoJSON / WGS84Coordinate 格式
}
