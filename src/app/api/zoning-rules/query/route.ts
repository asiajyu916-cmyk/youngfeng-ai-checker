/**
 * /api/zoning-rules/query
 *
 * 查詢都市計畫分區建蔽率/容積率
 * 資料來源：data/zoning_rules.db（臺中市都市計畫建蔽率容積率彙總表）
 *
 * GET 查詢參數：
 *   urban_plan_name  細部計畫案名（模糊比對）
 *   zone_name        使用分區（模糊比對，例如：住2、商1）
 *   district         行政區（模糊比對）
 *   limit            最大回傳筆數（預設 50）
 *
 * GET /api/zoning-rules/query?urban_plan_name=舊市區&zone_name=住2
 * → { ok: true, rules: [...], total: 1 }
 *
 * GET /api/zoning-rules/query?meta=1
 * → { ok: true, meta: { imported_at, source_file, records_count } }
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  queryZoningRules,
  queryByPlanAndZone,
  getZoningMeta,
  hasZoningRulesDb,
  getAllZoneNames,
  getAllPlanNames,
} from '@/lib/db/zoningRulesDb'

export const runtime = 'nodejs'   // 確保使用 Node.js runtime（better-sqlite3 需要）
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  // ── 資料庫狀態 ──────────────────────────────────────────────────
  if (!hasZoningRulesDb()) {
    return NextResponse.json({
      ok: false,
      error: 'zoning_rules.db 尚未生成。請執行：node scripts/import-zoning-rules.mjs <Excel路徑>',
    }, { status: 503 })
  }

  // ── Meta 查詢 ────────────────────────────────────────────────────
  if (searchParams.get('meta') === '1') {
    const meta = getZoningMeta()
    return NextResponse.json({ ok: true, meta })
  }

  // ── 分區清單 ────────────────────────────────────────────────────
  if (searchParams.get('zones') === '1') {
    return NextResponse.json({ ok: true, zones: getAllZoneNames() })
  }

  // ── 計畫清單 ────────────────────────────────────────────────────
  if (searchParams.get('plans') === '1') {
    return NextResponse.json({ ok: true, plans: getAllPlanNames() })
  }

  // ── 精確查詢（計畫 + 分區）─────────────────────────────────────
  const exact_plan = searchParams.get('exact_plan')
  const exact_zone = searchParams.get('exact_zone')
  if (exact_plan && exact_zone) {
    const rule = queryByPlanAndZone(exact_plan, exact_zone)
    return NextResponse.json({ ok: true, rule: rule ?? null })
  }

  // ── 一般查詢 ─────────────────────────────────────────────────────
  const urban_plan_name = searchParams.get('urban_plan_name') ?? undefined
  const zone_name       = searchParams.get('zone_name')       ?? undefined
  const district        = searchParams.get('district')        ?? undefined
  const limit           = parseInt(searchParams.get('limit') ?? '50', 10)

  if (!urban_plan_name && !zone_name && !district) {
    return NextResponse.json({
      ok: false,
      error: '請提供至少一個查詢條件：urban_plan_name、zone_name 或 district',
    }, { status: 400 })
  }

  const rules = queryZoningRules({ urban_plan_name, zone_name, district, limit })
  return NextResponse.json({ ok: true, rules, total: rules.length })
}
