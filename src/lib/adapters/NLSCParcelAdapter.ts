/**
 * NLSCParcelAdapter — 地號轉座標（目前不可用）
 *
 * ────────────────────────────────────────────────────────────────
 * ⚠️  CAD_004「地段號查詢坐標」需要向內政部國土測繪中心申請授權
 *
 * 授權機制：IP 白名單（非 Bearer Token）
 *   - NLSC 審核通過後，將你的伺服器固定 IP 加入白名單
 *   - 從白名單 IP 發出的請求直接有效，無需任何 Authorization Header
 *   - Vercel 的出口 IP 為動態浮動，無法做 IP 白名單，故此方案
 *     在 Vercel 平台上不可行
 *
 * 申請資訊：
 *   官方 API 清單   : https://maps.nlsc.gov.tw/S09SOA/pro/Api_ajax_list.jsp
 *   介接說明頁      : https://maps.nlsc.gov.tw/S09SOA/homePage.action?Language=ZH
 *   申請表下載      : https://maps.nlsc.gov.tw/S09SOA/Download.action?fileName=…
 *   聯絡電話        : (04) 2252-2966 分機 256
 *
 * 申請對象：
 *   - 政府機關 / 學術單位：免費，提交公文申請
 *   - 民營機構 / 私人公司：付費年訂閱制（115年度訂閱申請書）
 *
 * 目前狀態：isAvailable() = false，不產生任何假資料
 * ────────────────────────────────────────────────────────────────
 */

import type { WGS84Coordinate } from '../gis/types'

export interface ParcelInput {
  city:     string  // e.g. '台中市'
  district: string  // e.g. '北區'
  section:  string  // e.g. '錦村段'
  parcelNo: string  // e.g. '0001-0000'
}

export type ParcelToCoordinateResult =
  | { ok: true;  coordinate: WGS84Coordinate; source: 'NLSC_API'; queryMs: number }
  | { ok: false; error: string; source: 'NLSC_API' }

export class NLSCParcelAdapter {
  readonly name = 'NLSCParcelAdapter'
  readonly description = '內政部 NLSC 地籍 API（CAD_004）— 需申請 IP 白名單授權，目前不可用'

  /**
   * 目前不可用。
   * CAD_004 需向 NLSC 申請 IP 白名單，且 Vercel 動態 IP 不支援此機制。
   */
  isAvailable(): boolean {
    return false
  }

  async parcelToCoordinate(_input: ParcelInput): Promise<ParcelToCoordinateResult> {
    return {
      ok: false,
      error: [
        'NLSC CAD_004 地籍 API 目前不可用。',
        '此 API 採用 IP 白名單授權機制，需向內政部國土測繪中心申請固定伺服器 IP 綁定。',
        'Vercel 平台使用動態出口 IP，無法取得白名單資格。',
        '請改用「座標查詢」功能，直接輸入 WGS84 座標進行分區查詢。',
      ].join(' '),
      source: 'NLSC_API',
    }
  }
}

export const nlscParcelAdapter = new NLSCParcelAdapter()
