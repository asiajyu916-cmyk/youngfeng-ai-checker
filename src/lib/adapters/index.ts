/**
 * GIS Adapter Registry
 *
 * 統一的 GIS 資料查詢入口。
 * 依各 Adapter 的 priority 排序，使用第一個可用的 Adapter 查詢。
 * 若主要 Adapter 查無資料，自動嘗試次要 Adapter。
 *
 * ─── 資料狀態說明 ────────────────────────────────────────────────
 * TaichungUrbanPlanAdapter (priority 1)
 *   → isAvailable() = zoningStore 有已匯入 GeoJSON
 *   → 資料狀態：IMPORTED_GIS
 *   → 查詢流程：地號 → NLSC 轉座標 → PIP → 分區資料
 *
 * Taichung158Adapter (priority 2)
 *   → isAvailable() = false（尚未整合）
 *
 * TaichungUrbanDesignAdapter (priority 3)
 *   → isAvailable() = false（尚未整合）
 *
 * NLSCParcelAdapter — 地號轉座標輔助工具（非主查詢 Adapter）
 *   → isAvailable() = false（尚未整合）
 * ─────────────────────────────────────────────────────────────────
 */

import type { GISAdapter, LandParcelInput, ZoningQueryResult } from './types'
import { TaichungUrbanPlanAdapter } from './TaichungUrbanPlanAdapter'
import { Taichung158Adapter } from './Taichung158Adapter'
import { TaichungUrbanDesignAdapter } from './TaichungUrbanDesignAdapter'

// ─── Adapter 清單（依 priority 排序）─────────────────────────

const ADAPTERS: GISAdapter[] = [
  new TaichungUrbanPlanAdapter(),   // priority 1 — 主要：都市計畫GIS (IMPORTED_GIS)
  new Taichung158Adapter(),         // priority 2 — 輔助：158空間資訊網 (stub)
  new TaichungUrbanDesignAdapter(), // priority 3 — 輔助：都市設計服務網 (stub)
].sort((a, b) => a.priority - b.priority)

// ─── 主要查詢函數 ─────────────────────────────────────────────

/**
 * 依地號查詢使用分區資料。
 * 按 Adapter priority 依序嘗試，返回第一個有效結果。
 *
 * 注意：若所有 Adapter isAvailable() = false（尚未匯入 GeoJSON），
 * 回傳明確的「尚未匯入資料」錯誤，不產生假資料。
 */
export async function queryZoningByParcel(
  parcel: LandParcelInput
): Promise<ZoningQueryResult> {
  const errors: string[] = []
  let anyAvailable = false

  for (const adapter of ADAPTERS) {
    if (!adapter.isAvailable()) continue
    anyAvailable = true

    try {
      const result = await adapter.queryByParcel(parcel)
      if (result.zoning) return result
      if (result.error) errors.push(`[${adapter.name}] ${result.error}`)
    } catch (e) {
      errors.push(`[${adapter.name}] ${String(e)}`)
    }
  }

  if (!anyAvailable) {
    return {
      parcel,
      zoning: null,
      confidence: 'low',
      source: '尚未匯入 GIS 資料',
      queryTime: new Date().toISOString(),
      error: '請先至「GIS 資料管理」頁面匯入台中市都市計畫 GeoJSON 檔案，才能進行地號查詢。',
    }
  }

  return {
    parcel,
    zoning: null,
    confidence: 'low',
    source: '無可用資料來源',
    queryTime: new Date().toISOString(),
    error: errors.join(' | ') || '查無此地號資料，請確認輸入是否正確',
  }
}

/** 取得所有已設定 Adapter 的狀態清單（Debug 用） */
export function getAdapterStatus() {
  return ADAPTERS.map(a => ({
    name: a.name,
    description: a.description,
    priority: a.priority,
    available: a.isAvailable(),
  }))
}

// ─── 匯出型別與 Adapter 類別 ──────────────────────────────────

export type { GISAdapter, LandParcelInput, ZoningQueryResult, ZoningArea } from './types'
export { TaichungUrbanPlanAdapter } from './TaichungUrbanPlanAdapter'
export { Taichung158Adapter } from './Taichung158Adapter'
export { TaichungUrbanDesignAdapter } from './TaichungUrbanDesignAdapter'
export { NLSCParcelAdapter, nlscParcelAdapter } from './NLSCParcelAdapter'
export type { ParcelInput, ParcelToCoordinateResult } from './NLSCParcelAdapter'
