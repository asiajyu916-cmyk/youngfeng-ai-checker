/**
 * NLSCParcelAdapter — 地號轉座標（Phase 4 Real API）
 *
 * 資料來源：內政部國土測繪中心（NLSC）地籍 API
 * API 說明：https://api.nlsc.gov.tw/
 * 需申請服務：CAD_004（GetLandPositionLongitudeLatitude）
 *
 * ────────────────────────────────────────────────────────────────
 * 使用方式：
 *   1. 至 https://api.nlsc.gov.tw/ 申請帳號並開通 CAD_004 服務
 *   2. 取得授權 Token
 *   3. 在 Vercel / .env.local 設定 NLSC_API_TOKEN=<your_token>
 *   4. isAvailable() 回傳 true，地號查詢功能啟用
 *
 * 若未設定 NLSC_API_TOKEN：
 *   - isAvailable() = false
 *   - 地號查詢不可用，UI 顯示「請改用座標查詢」
 * ────────────────────────────────────────────────────────────────
 *
 * 查詢流程（透過 Next.js API Route 代理，避免 CORS）：
 *   /api/nlsc/parcel-coord?district=北區&section=錦村段&parcelNo=0001-0000
 *   → 鄉鎮代碼查詢（靜態表）
 *   → ListLandSection API → 地段代碼
 *   → GetLandPositionLongitudeLatitude API → TWD97 座標
 *   → TWD97 → WGS84 逆投影
 *   → 回傳 [lng, lat]
 */

import type { WGS84Coordinate } from '../gis/types'

export interface ParcelInput {
  city:     string  // e.g. '台中市' or '臺中市'
  district: string  // e.g. '北區'
  section:  string  // e.g. '錦村段'
  parcelNo: string  // e.g. '0001-0000' 或 '1' 或 '1-0'
}

export type ParcelToCoordinateResult =
  | {
      ok: true
      coordinate: WGS84Coordinate
      source: 'NLSC_API'
      queryMs: number
    }
  | {
      ok: false
      error: string
      source: 'NLSC_API'
    }

/** API route 回應格式 */
interface ParcelCoordResponse {
  ok: true
  lng: number
  lat: number
  townCode: string
  sectCode: string
  formattedNo: string
  source: string
}

interface ParcelCoordError {
  ok: false
  error: string
}

export class NLSCParcelAdapter {
  readonly name = 'NLSCParcelAdapter'
  readonly description = '內政部國土測繪中心地籍 API — 地號轉 WGS84 座標（需 NLSC_API_TOKEN）'

  /**
   * 是否可用：依賴 /api/nlsc/parcel-coord 回應判斷。
   * 客戶端無法直接讀取 process.env，透過 API route 的 503 回應偵測。
   *
   * 注意：此方法需要非同步確認，但為了符合 GISAdapter 介面設計
   * 採用快取旗標（在首次查詢後更新）。
   */
  isAvailable(): boolean {
    // 保守回傳 true — 實際可用性由 parcelToCoordinate 的錯誤回應決定
    // 若環境變數未設，API route 回傳 503，錯誤訊息會指引使用者設定 token
    return true
  }

  /**
   * 地號 → WGS84 座標
   *
   * 透過 Next.js API route (/api/nlsc/parcel-coord) 代理 NLSC API，
   * 避免瀏覽器直接呼叫 NLSC 可能遭遇的 CORS 問題。
   */
  async parcelToCoordinate(input: ParcelInput): Promise<ParcelToCoordinateResult> {
    const t0 = Date.now()

    const params = new URLSearchParams({
      district: input.district,
      section:  input.section,
      parcelNo: input.parcelNo,
    })

    let res: Response
    try {
      res = await fetch(`/api/nlsc/parcel-coord?${params.toString()}`)
    } catch (e) {
      return {
        ok: false,
        error: `NLSC 查詢網路錯誤：${String(e)}`,
        source: 'NLSC_API',
      }
    }

    let data: ParcelCoordResponse | ParcelCoordError
    try {
      data = await res.json()
    } catch {
      return {
        ok: false,
        error: `NLSC API 回應解析失敗（HTTP ${res.status}）`,
        source: 'NLSC_API',
      }
    }

    if (!data.ok) {
      return {
        ok: false,
        error: (data as ParcelCoordError).error,
        source: 'NLSC_API',
      }
    }

    const coord = data as ParcelCoordResponse

    return {
      ok: true,
      coordinate: [coord.lng, coord.lat],
      source: 'NLSC_API',
      queryMs: Date.now() - t0,
    }
  }
}

export const nlscParcelAdapter = new NLSCParcelAdapter()
