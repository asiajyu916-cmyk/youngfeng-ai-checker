/**
 * Taichung158Adapter
 *
 * 158空間資訊網資料介面（預留架構）
 * 資料來源：https://www.158.gov.tw/
 *
 * 158空間資訊網提供：
 *   - 門牌地號查詢
 *   - 建物謄本連結
 *   - 地籍坐標轉換
 *
 * 目前狀態：Stub（尚未實作）
 * 正式版：需申請 158 API Token
 */

import type { GISAdapter, LandParcelInput, ZoningQueryResult } from './types'

export class Taichung158Adapter implements GISAdapter {
  readonly name = 'Taichung158Adapter'
  readonly description = '158空間資訊網 — 地籍坐標、門牌查詢'
  readonly priority = 2

  isAvailable(): boolean {
    // 尚未整合
    return false
  }

  async queryByParcel(parcel: LandParcelInput): Promise<ZoningQueryResult> {
    return {
      parcel,
      zoning: null,
      confidence: 'low',
      source: '158空間資訊網',
      sourceUrl: 'https://www.158.gov.tw/',
      queryTime: new Date().toISOString(),
      error: 'Taichung158Adapter 尚未整合，請設定 NEXT_PUBLIC_158_API_KEY',
    }
  }

  // ── 預留介面 ─────────────────────────────────────────────────
  // async queryCoordinateByParcel(parcel: LandParcelInput): Promise<[number, number]> { ... }
  // async getAddressByParcel(parcel: LandParcelInput): Promise<string> { ... }
}
