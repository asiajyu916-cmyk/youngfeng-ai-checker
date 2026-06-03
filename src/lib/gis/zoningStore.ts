/**
 * Zoning Store
 *
 * 儲存策略：
 *   - ZoningFeature[]（大型 GeoJSON）→ IndexedDB（無大小上限）
 *   - 元資料（檔名、數量、匯入時間等）→ localStorage（少量文字）
 *   - 記憶體快取（_memCache）→ 頁面存活期間避免重複讀取 IndexedDB
 *
 * 不再嘗試將整份 GeoJSON 寫入 localStorage（會觸發 QuotaExceededError）。
 */

import type { ZoningFeature, ImportResult, DataSourceStatus } from './types'
import { idbSaveFeatures, idbLoadFeatures, idbClearFeatures, idbHasFeatures } from './idbStore'

// ─── 型別 ─────────────────────────────────────────────────────────

export interface ZoningStoreMeta {
  sourceFile:   string
  importedAt:   string
  featuresCount: number
  dataStatus:   DataSourceStatus
  /** 實際對應到的原始欄位名稱 */
  mappingResult?: {
    zone_name?:        string | null
    coverage_ratio?:   string | null
    floor_area_ratio?: string | null
  }
}

// ─── Keys ────────────────────────────────────────────────────────

const META_KEY = 'yf_zoning_meta_v2'

// ─── 記憶體快取 ───────────────────────────────────────────────────

/** 頁面存活期間的記憶體快取，避免重複讀取 IndexedDB */
let _memCache: ZoningFeature[] | null = null

// ─── 元資料（localStorage）────────────────────────────────────────

export function loadZoningMeta(): ZoningStoreMeta | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(META_KEY)
    return raw ? (JSON.parse(raw) as ZoningStoreMeta) : null
  } catch {
    return null
  }
}

function saveMeta(meta: ZoningStoreMeta): void {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta))
  } catch {
    // 元資料極小，通常不會失敗；若仍失敗則靜默忽略
  }
}

function clearMeta(): void {
  try { localStorage.removeItem(META_KEY) } catch { /* ignore */ }
}

// ─── 可用性（同步快速判斷）──────────────────────────────────────

/**
 * 同步判斷是否有已匯入資料。
 * 依據 localStorage 元資料（不讀 IndexedDB）。
 * 頁面刷新後若元資料存在即視為有資料。
 */
export function hasImportedData(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem(META_KEY)
}

// ─── 讀取 ────────────────────────────────────────────────────────

/**
 * 讀取 ZoningFeature[]。
 * 優先從記憶體快取讀取；若快取為空則從 IndexedDB 讀取並填充快取。
 */
export async function loadZoningFeatures(): Promise<ZoningFeature[]> {
  if (_memCache !== null) return _memCache
  const features = await idbLoadFeatures()
  _memCache = features
  return features
}

/**
 * 同步讀取（僅讀記憶體快取）。
 * 若快取尚未填充（頁面剛刷新）則回傳空陣列。
 * 使用前請先呼叫 loadZoningFeatures() 確保快取已填充。
 */
export function loadZoningFeaturesSync(): ZoningFeature[] {
  return _memCache ?? []
}

/** 預熱快取（頁面載入時呼叫） */
export async function warmupCache(): Promise<void> {
  if (_memCache !== null) return
  if (!hasImportedData()) return
  _memCache = await idbLoadFeatures()
}

// ─── 寫入 ────────────────────────────────────────────────────────

/**
 * 儲存 ZoningFeature[] 至 IndexedDB，元資料至 localStorage。
 * @returns ok: true 代表 IndexedDB 寫入成功；localStorage 失敗僅為 warning。
 */
export async function saveZoningFeatures(
  features: ZoningFeature[],
  result: ImportResult,
  mappingResult?: ZoningStoreMeta['mappingResult'],
): Promise<{ ok: boolean; warning?: string; error?: string }> {
  if (typeof window === 'undefined') {
    return { ok: false, error: 'Server side — cannot use IndexedDB' }
  }

  try {
    // 1. 寫入 IndexedDB（主要儲存）
    await idbSaveFeatures(features)

    // 2. 更新記憶體快取
    _memCache = features

    // 3. 寫入元資料至 localStorage（若失敗僅 warning，不影響匯入成功）
    let lsWarning: string | undefined
    try {
      saveMeta({
        sourceFile:    result.sourceFile,
        importedAt:    result.importedAt,
        featuresCount: features.length,
        dataStatus:    'IMPORTED_GIS',
        mappingResult,
      })
    } catch {
      lsWarning = 'localStorage 元資料寫入失敗（不影響查詢功能）'
    }

    return { ok: true, ...(lsWarning ? { warning: lsWarning } : {}) }

  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, error: `IndexedDB 寫入失敗：${msg}` }
  }
}

// ─── 清除 ────────────────────────────────────────────────────────

export async function clearZoningStore(): Promise<void> {
  _memCache = null
  clearMeta()
  await idbClearFeatures()
}

/** 非同步確認 IndexedDB 是否確實有資料（用於診斷） */
export async function checkIDBHasFeatures(): Promise<boolean> {
  return idbHasFeatures()
}
