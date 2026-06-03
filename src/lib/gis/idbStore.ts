/**
 * IndexedDB Store — ZoningFeature[] 持久化
 *
 * localStorage 限制 ~5MB，無法存放台中市都市計畫 GeoJSON（~50-300MB）。
 * IndexedDB 無硬性大小上限（通常數百 MB 至數 GB），適合存放大型 GeoJSON。
 *
 * 架構：
 *   DB 名稱：yf_gis_db
 *   版本：1
 *   Object Store：zoning_features
 *     key: 'default'（整份 features 作為單一記錄）
 */

import type { ZoningFeature } from './types'

const DB_NAME    = 'yf_gis_db'
const DB_VERSION = 1
const STORE_NAME = 'zoning_features'
const RECORD_KEY = 'default'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result)
    req.onerror   = (e) => reject((e.target as IDBOpenDBRequest).error)
  })
}

/** 將 ZoningFeature[] 寫入 IndexedDB */
export async function idbSaveFeatures(features: ZoningFeature[]): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const req   = store.put(features, RECORD_KEY)
    req.onsuccess = () => resolve()
    req.onerror   = (e) => reject((e.target as IDBRequest).error)
  })
}

/** 從 IndexedDB 讀取 ZoningFeature[] */
export async function idbLoadFeatures(): Promise<ZoningFeature[]> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req   = store.get(RECORD_KEY)
      req.onsuccess = (e) => resolve((e.target as IDBRequest).result ?? [])
      req.onerror   = (e) => reject((e.target as IDBRequest).error)
    })
  } catch {
    return []
  }
}

/** 清除 IndexedDB 中的 features */
export async function idbClearFeatures(): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req   = store.delete(RECORD_KEY)
      req.onsuccess = () => resolve()
      req.onerror   = (e) => reject((e.target as IDBRequest).error)
    })
  } catch { /* ignore */ }
}

/** 檢查 IndexedDB 是否有資料（不需要載入全部） */
export async function idbHasFeatures(): Promise<boolean> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx    = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req   = store.count()
      req.onsuccess = (e) => resolve(((e.target as IDBRequest).result as number) > 0)
      req.onerror   = () => resolve(false)
    })
  } catch {
    return false
  }
}
