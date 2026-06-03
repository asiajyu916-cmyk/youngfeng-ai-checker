/**
 * zoningRulesDb.ts
 *
 * Server-side SQLite 查詢工具（使用 better-sqlite3）
 * 資料庫：data/zoning_rules.db（本機 import-zoning-rules.mjs 生成後 commit 至 repo）
 *
 * 注意：此模組只能在 Server 端（API Route、Server Component）呼叫，
 * 不可在 'use client' 元件中直接 import。
 */

import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

// ─── 型別 ─────────────────────────────────────────────────────────

export interface ZoningRule {
  id:               number
  sheet_name:       string | null
  urban_plan_name:  string
  district:         string | null
  zone_name:        string
  coverage_ratio:   number | null
  floor_area_ratio: number | null
  max_far:          number | null
  bonus_multiplier: number | null
  remarks:          string | null
}

export interface ZoningMeta {
  imported_at:    string
  source_file:    string
  records_count:  string
}

export interface QueryOptions {
  urban_plan_name?: string   // 細部計畫案名（模糊比對）
  zone_name?:       string   // 使用分區（精確或模糊）
  district?:        string   // 行政區
  limit?:           number
}

// ─── DB 路徑 ─────────────────────────────────────────────────────

function getDbPath(): string {
  return path.join(process.cwd(), 'data', 'zoning_rules.db')
}

function openDb(): Database.Database | null {
  const p = getDbPath()
  if (!fs.existsSync(p)) return null
  return new Database(p, { readonly: true, fileMustExist: true })
}

// ─── 查詢函數 ─────────────────────────────────────────────────────

/**
 * 依都市計畫名稱 + 使用分區查詢建蔽率/容積率
 * 主要使用情境：PIP 結果 → 查 zoning_rules
 */
export function queryByPlanAndZone(
  urban_plan_name: string,
  zone_name: string,
): ZoningRule | null {
  const db = openDb()
  if (!db) return null

  try {
    // 精確比對
    const exact = db.prepare(`
      SELECT * FROM zoning_rules
      WHERE urban_plan_name = ? AND zone_name = ?
      LIMIT 1
    `).get(urban_plan_name, zone_name) as ZoningRule | undefined

    if (exact) return exact

    // 模糊比對（計畫名稱含關鍵字）
    const fuzzy = db.prepare(`
      SELECT * FROM zoning_rules
      WHERE urban_plan_name LIKE ? AND zone_name = ?
      ORDER BY length(urban_plan_name)
      LIMIT 1
    `).get(`%${urban_plan_name}%`, zone_name) as ZoningRule | undefined

    return fuzzy ?? null
  } finally {
    db.close()
  }
}

/**
 * 彈性查詢（支援模糊比對）
 */
export function queryZoningRules(opts: QueryOptions): ZoningRule[] {
  const db = openDb()
  if (!db) return []

  try {
    const conditions: string[] = []
    const params: string[] = []

    if (opts.urban_plan_name) {
      conditions.push('urban_plan_name LIKE ?')
      params.push(`%${opts.urban_plan_name}%`)
    }
    if (opts.zone_name) {
      conditions.push('zone_name LIKE ?')
      params.push(`%${opts.zone_name}%`)
    }
    if (opts.district) {
      conditions.push('district LIKE ?')
      params.push(`%${opts.district}%`)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const limit = opts.limit ?? 50

    return db.prepare(`
      SELECT * FROM zoning_rules ${where}
      ORDER BY urban_plan_name, zone_name
      LIMIT ${limit}
    `).all(...params) as ZoningRule[]
  } finally {
    db.close()
  }
}

/**
 * 取得所有不重複的使用分區名稱（供 UI 篩選）
 */
export function getAllZoneNames(): string[] {
  const db = openDb()
  if (!db) return []
  try {
    const rows = db.prepare(`
      SELECT DISTINCT zone_name FROM zoning_rules ORDER BY zone_name
    `).all() as { zone_name: string }[]
    return rows.map(r => r.zone_name)
  } finally {
    db.close()
  }
}

/**
 * 取得所有不重複的細部計畫名稱
 */
export function getAllPlanNames(): string[] {
  const db = openDb()
  if (!db) return []
  try {
    const rows = db.prepare(`
      SELECT DISTINCT urban_plan_name FROM zoning_rules ORDER BY urban_plan_name
    `).all() as { urban_plan_name: string }[]
    return rows.map(r => r.urban_plan_name)
  } finally {
    db.close()
  }
}

/**
 * 資料庫 Meta（匯入時間、來源檔、筆數）
 */
export function getZoningMeta(): ZoningMeta | null {
  const db = openDb()
  if (!db) return null
  try {
    const rows = db.prepare(`SELECT key, value FROM zoning_meta`).all() as { key: string; value: string }[]
    const map = Object.fromEntries(rows.map(r => [r.key, r.value]))
    return {
      imported_at:   map['imported_at']   ?? '',
      source_file:   map['source_file']   ?? '',
      records_count: map['records_count'] ?? '0',
    }
  } finally {
    db.close()
  }
}

/**
 * 是否有資料（DB 存在且有記錄）
 */
export function hasZoningRulesDb(): boolean {
  const p = getDbPath()
  if (!fs.existsSync(p)) return false
  const db = openDb()
  if (!db) return false
  try {
    const row = db.prepare(`SELECT COUNT(*) as n FROM zoning_rules`).get() as { n: number }
    return row.n > 0
  } finally {
    db.close()
  }
}
