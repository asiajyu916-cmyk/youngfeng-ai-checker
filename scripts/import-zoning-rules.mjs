/**
 * scripts/import-zoning-rules.mjs
 *
 * 將「臺中市都市計畫建蔽率容積率彙總表.xlsx」匯入 SQLite 資料庫
 *
 * 用法：
 *   node scripts/import-zoning-rules.mjs <Excel 路徑>
 *   node scripts/import-zoning-rules.mjs "C:/Users/User/Downloads/臺中市都市計畫建蔽率容積率彙總表 的副本.xlsx"
 *
 * 輸出：
 *   data/zoning_rules.db（SQLite 資料庫）
 *
 * 資料表：zoning_rules
 *   urban_plan_name  細部計畫案名
 *   district         行政區
 *   zone_name        使用分區（住2、商1 等）
 *   coverage_ratio   建蔽率（%）
 *   floor_area_ratio 容積率基本（%）
 *   max_far          容積率上限（%），NULL 表示無上限
 *   bonus_multiplier 獎勵倍數，NULL 表示無
 *   remarks          原始資料（保留 newline 格式）
 */

import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const XLSX = require('xlsx')
const Database = require('better-sqlite3')

// ─── 參數 ────────────────────────────────────────────────────────

const excelPath = process.argv[2]
if (!excelPath) {
  console.error('用法：node scripts/import-zoning-rules.mjs <Excel 路徑>')
  process.exit(1)
}
if (!fs.existsSync(excelPath)) {
  console.error(`找不到檔案：${excelPath}`)
  process.exit(1)
}

const dbPath = path.join(ROOT, 'data', 'zoning_rules.db')
fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true })

// ─── 解析 cell 數值 ──────────────────────────────────────────────

/**
 * 解析單一 Zone 儲存格
 * 格式：建蔽率\n容積率\n上限容積\n獎勵倍數
 * 其中 "-" 或 "參書" 等表示無值
 */
function parseCell(raw) {
  if (!raw || typeof raw !== 'string') return null
  const lines = raw.split('\n').map(s => s.trim()).filter(Boolean)
  if (lines.length < 2) return null

  const toNum = s => {
    if (!s || s === '-' || s === '—' || s === '參書' || s === '  ') return null
    const n = parseFloat(s.replace(/[^\d.]/g, ''))
    return isNaN(n) ? null : n
  }

  const coverage = toNum(lines[0])
  const far      = toNum(lines[1])
  if (coverage === null && far === null) return null

  return {
    coverage_ratio:   coverage,
    floor_area_ratio: far,
    max_far:          lines.length >= 3 ? toNum(lines[2]) : null,
    bonus_multiplier: lines.length >= 4 ? toNum(lines[3]) : null,
    remarks:          raw.trim(),
  }
}

// ─── 解析單一 Sheet ──────────────────────────────────────────────

/**
 * 每個 Sheet 結構相同：
 *   Row 0: 標題（忽略）
 *   Row 1: 欄位標頭（col 0-4 = metadata，col 5+ = 分區名稱）
 *   Row 2+: 資料（每列一個細部計畫）
 */
function parseSheet(ws, sheetName) {
  const rows   = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
  const header = rows[1]                     // 欄位標頭列
  if (!header) return []

  // 取得分區欄位名稱（col 5 開始，排除最後一欄「全區總量管制計算」）
  const zoneHeaders = header.slice(5)

  const records = []

  for (let ri = 2; ri < rows.length; ri++) {
    const row = rows[ri]
    if (!row || !row[0]) continue            // 序號為空 → 略過

    // 清理計畫案名（去除多餘換行）
    const planName = String(row[1] || '').replace(/\n/g, '').replace(/\s+/g, ' ').trim()
    const district = String(row[4] || '').replace(/\n/g, '、').trim()

    if (!planName) continue

    // 逐欄解析分區
    for (let ci = 0; ci < zoneHeaders.length; ci++) {
      const zoneName = String(zoneHeaders[ci] || '').replace(/\n/g, '').trim()
      if (!zoneName) continue

      const rawVal = row[5 + ci]
      if (!rawVal || typeof rawVal !== 'string' || !rawVal.trim() || rawVal.trim() === '-') continue

      const parsed = parseCell(rawVal)
      if (!parsed) continue

      records.push({
        sheet_name:       sheetName,
        urban_plan_name:  planName,
        district,
        zone_name:        zoneName,
        ...parsed,
      })
    }
  }

  return records
}

// ─── 主流程 ──────────────────────────────────────────────────────

console.log(`讀取 Excel：${excelPath}`)
const wb = XLSX.readFile(excelPath)
console.log('Sheets：', wb.SheetNames.join('、'))

// 資料 Sheet（略過 Sheet 1 = 計畫清單目錄）
const DATA_SHEETS = [1, 2, 3]  // index 1,2,3 = Sheet 2,3,4

let allRecords = []
for (const idx of DATA_SHEETS) {
  const name = wb.SheetNames[idx]
  if (!name) continue
  const ws = wb.Sheets[name]
  const records = parseSheet(ws, name)
  console.log(`  ${name}：${records.length} 筆`)
  allRecords = allRecords.concat(records)
}

console.log(`\n總計：${allRecords.length} 筆`)

// ─── 建立 SQLite ──────────────────────────────────────────────────

console.log(`\n寫入 SQLite：${dbPath}`)

// 若舊 DB 存在先刪除（全量重建）
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)

const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS zoning_rules (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    sheet_name       TEXT,
    urban_plan_name  TEXT    NOT NULL,
    district         TEXT,
    zone_name        TEXT    NOT NULL,
    coverage_ratio   REAL,
    floor_area_ratio REAL,
    max_far          REAL,
    bonus_multiplier REAL,
    remarks          TEXT,
    imported_at      TEXT    DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_plan  ON zoning_rules (urban_plan_name);
  CREATE INDEX IF NOT EXISTS idx_zone  ON zoning_rules (zone_name);
  CREATE INDEX IF NOT EXISTS idx_both  ON zoning_rules (urban_plan_name, zone_name);

  -- 儲存匯入資訊
  CREATE TABLE IF NOT EXISTS zoning_meta (
    key   TEXT PRIMARY KEY,
    value TEXT
  );
`)

const insert = db.prepare(`
  INSERT INTO zoning_rules
    (sheet_name, urban_plan_name, district, zone_name,
     coverage_ratio, floor_area_ratio, max_far, bonus_multiplier, remarks)
  VALUES
    (@sheet_name, @urban_plan_name, @district, @zone_name,
     @coverage_ratio, @floor_area_ratio, @max_far, @bonus_multiplier, @remarks)
`)

const insertAll = db.transaction(records => {
  for (const r of records) insert.run(r)
})

insertAll(allRecords)

// 寫入 meta
db.prepare(`INSERT OR REPLACE INTO zoning_meta (key, value) VALUES (?, ?)`).run('imported_at', new Date().toISOString())
db.prepare(`INSERT OR REPLACE INTO zoning_meta (key, value) VALUES (?, ?)`).run('source_file', path.basename(excelPath))
db.prepare(`INSERT OR REPLACE INTO zoning_meta (key, value) VALUES (?, ?)`).run('records_count', String(allRecords.length))

db.close()

// ─── 結果摘要 ────────────────────────────────────────────────────

console.log('\n✅ 匯入完成')
console.log(`   資料庫：${dbPath}`)
console.log(`   總筆數：${allRecords.length}`)

// 顯示分區統計（前 10）
const db2 = new Database(dbPath, { readonly: true })
const topZones = db2.prepare(`
  SELECT zone_name, COUNT(*) as cnt
  FROM zoning_rules
  GROUP BY zone_name
  ORDER BY cnt DESC
  LIMIT 10
`).all()
console.log('\n前 10 常見分區：')
topZones.forEach(r => console.log(`   ${r.zone_name.padEnd(20)} ${r.cnt} 筆`))

const plans = db2.prepare(`SELECT COUNT(DISTINCT urban_plan_name) as n FROM zoning_rules`).get()
console.log(`\n細部計畫數：${plans.n} 筆`)
db2.close()
