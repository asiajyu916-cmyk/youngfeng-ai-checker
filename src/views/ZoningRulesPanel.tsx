'use client'

/**
 * ZoningRulesPanel
 *
 * 建蔽率/容積率查詢面板
 * 資料來源：data/zoning_rules.db（臺中市都市計畫建蔽率容積率彙總表）
 *
 * 功能：
 *   1. 顯示資料庫狀態（筆數、來源檔、匯入時間）
 *   2. 查詢介面：輸入計畫名稱或使用分區 → 顯示建蔽率/容積率
 *   3. 匯入指引：說明如何更新資料庫
 */

import { useState, useEffect, useCallback } from 'react'

// ─── 型別 ─────────────────────────────────────────────────────────

interface ZoningRule {
  id:               number
  urban_plan_name:  string
  district:         string | null
  zone_name:        string
  coverage_ratio:   number | null
  floor_area_ratio: number | null
  max_far:          number | null
  bonus_multiplier: number | null
  remarks:          string | null
}

interface DbMeta {
  imported_at:   string
  source_file:   string
  records_count: string
}

// ─── 子元件 ───────────────────────────────────────────────────────

function RuleCard({ rule }: { rule: ZoningRule }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* 分區標題 */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-4 py-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-white font-bold text-base">{rule.zone_name}</div>
          <div className="text-blue-200 text-xs mt-0.5 leading-relaxed line-clamp-2">{rule.urban_plan_name}</div>
        </div>
        {rule.district && (
          <span className="text-xs bg-blue-700/50 text-blue-100 px-2 py-0.5 rounded-full shrink-0 mt-0.5">{rule.district}</span>
        )}
      </div>

      {/* 建蔽 / 容積 */}
      <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
        <div className="px-4 py-3 text-center">
          <div className="text-2xl font-bold text-red-600">
            {rule.coverage_ratio !== null ? `${rule.coverage_ratio}%` : '—'}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">建蔽率上限</div>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {rule.floor_area_ratio !== null ? `${rule.floor_area_ratio}%` : '—'}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">容積率</div>
          {rule.max_far !== null && (
            <div className="text-xs text-blue-400 mt-0.5">（上限 {rule.max_far}%）</div>
          )}
        </div>
      </div>

      {/* 獎勵倍數 */}
      {rule.bonus_multiplier !== null && (
        <div className="px-4 py-2 bg-green-50 border-b border-green-100 text-xs text-green-700">
          <span className="font-medium">開放空間獎勵倍數：</span>{rule.bonus_multiplier} 倍
        </div>
      )}

      {/* 原始資料 */}
      <div className="px-4 py-2 bg-gray-50">
        <div className="text-xs text-gray-400 font-mono">{rule.remarks?.replace(/\n/g, ' / ')}</div>
      </div>
    </div>
  )
}

// ─── 主元件 ───────────────────────────────────────────────────────

export default function ZoningRulesPanel() {
  const [meta, setMeta]         = useState<DbMeta | null>(null)
  const [dbReady, setDbReady]   = useState<boolean | null>(null)  // null=loading
  const [query, setQuery]       = useState({ plan: '', zone: '' })
  const [rules, setRules]       = useState<ZoningRule[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  // 載入 DB meta
  useEffect(() => {
    fetch('/api/zoning-rules/query?meta=1')
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          setMeta(data.meta)
          setDbReady(true)
        } else {
          setDbReady(false)
        }
      })
      .catch(() => setDbReady(false))
  }, [])

  const handleSearch = useCallback(async () => {
    if (!query.plan && !query.zone) return
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const params = new URLSearchParams()
      if (query.plan) params.set('urban_plan_name', query.plan)
      if (query.zone) params.set('zone_name', query.zone)
      params.set('limit', '20')

      const res  = await fetch(`/api/zoning-rules/query?${params}`)
      const data = await res.json()

      if (data.ok) {
        setRules(data.rules)
        if (data.rules.length === 0) setError('查無符合條件的資料')
      } else {
        setError(data.error ?? '查詢失敗')
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [query])

  return (
    <div className="space-y-4">

      {/* ── 資料庫狀態 ────────────────────────────────────────────── */}
      {dbReady === null && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-3 text-sm text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
          載入資料庫狀態…
        </div>
      )}

      {dbReady === false && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-orange-500 text-lg shrink-0">⚠</span>
            <div>
              <div className="text-sm font-semibold text-orange-800">尚未匯入建蔽率/容積率資料庫</div>
              <div className="text-xs text-orange-600 mt-1 leading-relaxed">
                zoning_rules.db 尚未生成。請在本機執行以下指令後重新部署：
              </div>
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl px-4 py-3 font-mono text-xs text-green-400 space-y-1">
            <div className="text-gray-500"># 匯入 Excel → SQLite</div>
            <div>node scripts/import-zoning-rules.mjs \</div>
            <div className="pl-4">&quot;臺中市都市計畫建蔽率容積率彙總表.xlsx&quot;</div>
            <div className="text-gray-500 mt-2"># 然後 commit data/zoning_rules.db 並重新部署</div>
            <div>git add data/zoning_rules.db</div>
            <div>git commit -m &quot;update zoning_rules db&quot;</div>
          </div>
        </div>
      )}

      {dbReady === true && meta && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-green-800">✓ 建蔽率/容積率資料庫已載入</div>
            <div className="text-xs text-green-600 mt-0.5">
              {meta.source_file} · {parseInt(meta.records_count).toLocaleString()} 筆規則 ·
              匯入於 {meta.imported_at.slice(0, 10)}
            </div>
          </div>
          <span className="text-xs bg-green-100 border border-green-200 text-green-700 px-2.5 py-1 rounded-full font-semibold shrink-0">
            IMPORTED
          </span>
        </div>
      )}

      {/* ── 查詢介面 ──────────────────────────────────────────────── */}
      {dbReady === true && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <div className="text-sm font-bold text-gray-800">查詢建蔽率/容積率</div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* 細部計畫名稱 */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                細部計畫名稱（模糊）
              </label>
              <input
                type="text"
                value={query.plan}
                onChange={e => setQuery(q => ({ ...q, plan: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="例：舊市區、西屯地區"
                className="mt-1.5 w-full h-11 px-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* 使用分區 */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                使用分區
              </label>
              <input
                type="text"
                value={query.zone}
                onChange={e => setQuery(q => ({ ...q, zone: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="例：住2、商1、乙工"
                className="mt-1.5 w-full h-11 px-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || (!query.plan && !query.zone)}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                查詢中…
              </>
            ) : '查詢建蔽率/容積率'}
          </button>

          {/* 說明 */}
          <div className="text-xs text-gray-400 leading-relaxed">
            資料來源：臺中市都市計畫建蔽率容積率彙總表（112.4.14 一版）
            · {meta?.records_count} 筆規則跨 {/* placeholder */} 105 個細部計畫
          </div>
        </div>
      )}

      {/* ── 查詢結果 ──────────────────────────────────────────────── */}
      {error && searched && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-700">
          {error}
        </div>
      )}

      {rules.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs text-gray-500 font-semibold px-1">
            查詢結果（{rules.length} 筆）
          </div>
          {rules.map(r => (
            <RuleCard key={r.id} rule={r} />
          ))}
        </div>
      )}

      {/* ── 說明區 ────────────────────────────────────────────────── */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 space-y-2 text-xs text-blue-700">
        <div className="font-semibold text-blue-800">查詢流程說明</div>
        <div className="space-y-1 leading-relaxed">
          <div>① GIS 圖資 → Point In Polygon → 取得「都市計畫名稱」+「使用分區」</div>
          <div>② 用計畫名稱 + 分區名稱查詢 <code className="bg-blue-100 px-1 rounded">zoning_rules</code> 表</div>
          <div>③ 回傳該細部計畫中該分區的建蔽率/容積率</div>
        </div>
        <div className="text-blue-500 pt-1 border-t border-blue-100">
          資料來源：Excel 彙總表（官方 112.4.14 一版）。如需更新，重新執行 import 腳本並 commit db 檔案。
        </div>
      </div>
    </div>
  )
}
