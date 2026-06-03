/**
 * TaichungUrbanDesignAdapter
 *
 * 台中市都市設計服務網資料介面（預留架構）
 * 資料來源：https://uds.taichung.gov.tw/
 *
 * 都市設計服務網提供：
 *   - 都市設計審議門檻查詢
 *   - 都市設計管制範圍圖
 *   - 歷次都審案件查詢
 *   - 建築景觀管制規定
 *
 * 目前狀態：Stub（尚未實作）
 * 正式版：需與台中市政府都市發展局合作取得 API
 */

import type { GISAdapter, LandParcelInput, ZoningQueryResult } from './types'

export interface UrbanDesignInfo {
  isInManagedArea: boolean        // 是否在都市設計管制範圍
  reviewThresholdSqm: number      // 都審門檻（㎡），0 = 無門檻（全部需審）
  isIndependentReview: boolean    // 是否獨立都審機制
  authority: string               // 審議主管機關
  designGuidelines?: string       // 適用設計準則名稱
  managedAreaName?: string        // 管制範圍名稱
}

export class TaichungUrbanDesignAdapter implements GISAdapter {
  readonly name = 'TaichungUrbanDesignAdapter'
  readonly description = '台中市都市設計服務網 — 都審門檻、景觀管制範圍'
  readonly priority = 3

  isAvailable(): boolean {
    // 尚未整合
    return false
  }

  async queryByParcel(parcel: LandParcelInput): Promise<ZoningQueryResult> {
    return {
      parcel,
      zoning: null,
      confidence: 'low',
      source: '台中市都市設計服務網',
      sourceUrl: 'https://uds.taichung.gov.tw/',
      queryTime: new Date().toISOString(),
      error: 'TaichungUrbanDesignAdapter 尚未整合',
    }
  }

  // ── 預留介面 ─────────────────────────────────────────────────
  // async queryUrbanDesignInfo(parcel: LandParcelInput): Promise<UrbanDesignInfo> { ... }
  // async getDesignGuidelines(planAreaId: string): Promise<string> { ... }
}
