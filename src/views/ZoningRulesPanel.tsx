'use client'

/**
 * ZoningRulesPanel
 *
 * 建蔽率/容積率查詢面板（連動下拉選單版）
 * 資料來源：data/zoning_rules.db（臺中市都市計畫建蔽率容積率彙總表）
 *
 * UX 設計：
 *   1. 都市計畫名稱 → Combobox（載入全部 plan names，即時過濾）
 *   2. 使用分區 → Combobox（選完計畫後自動載入該計畫的 zone names）
 *   3. 選完兩個欄位 → 自動查詢，不需按按鈕
 *   4. 查無資料 → 顯示送出的值 + 相近建議
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import type { BuildingInput } from '@/types'
import { getPlanAreasByDistrict } from '@/data/regionRules'

// ─── 工具：zone_name (阿拉伯數字) → zoneType (中文數字) ──────────

const ARABIC_TO_CHINESE: Record<string, string> = {
  '1': '一', '2': '二', '3': '三', '4': '四', '5': '五',
  '6': '六', '7': '七', '8': '八', '9': '九', '0': '零',
}

/** 將「住2」「商1」等 DB 分區名稱轉成 rule engine 的 zoneType 格式「住二」「商一」 */
function toZoneType(zoneName: string): string {
  // 只轉換末尾阿拉伯數字，保留前綴（如「住」「商」「工」）
  return zoneName.replace(/(\d+)$/, (_, n: string) =>
    n.split('').map(c => ARABIC_TO_CHINESE[c] ?? c).join('')
  )
}

/** 從行政區（可能是逗號/頓號分隔多個）取第一個 */
function firstDistrict(district: string | null): string {
  if (!district) return ''
  return district.split(/[,，、]/)[0].trim()
}

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

// ─── 通用 Combobox ────────────────────────────────────────────────

interface ComboBoxProps {
  label:       string
  placeholder: string
  options:     string[]
  value:       string
  onChange:    (val: string) => void
  loading?:    boolean
  disabled?:   boolean
  hint?:       string
}

function ComboBox({ label, placeholder, options, value, onChange, loading, disabled, hint }: ComboBoxProps) {
  const [query,   setQuery]   = useState('')
  const [open,    setOpen]    = useState(false)
  const [focused, setFocused] = useState(-1)
  const wrapRef  = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef  = useRef<HTMLUListElement>(null)

  // 同步外部 value 到 query（選中後顯示）
  useEffect(() => {
    if (!open) setQuery(value)
  }, [value, open])

  // 點外部關閉
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery(value) // 恢復已選值
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [value])

  const filtered = query
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options

  const select = (opt: string) => {
    onChange(opt)
    setQuery(opt)
    setOpen(false)
    setFocused(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true)
      setFocused(0)
      return
    }
    if (e.key === 'ArrowDown') {
      const next = Math.min(focused + 1, filtered.length - 1)
      setFocused(next)
      listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' })
    } else if (e.key === 'ArrowUp') {
      const prev = Math.max(focused - 1, 0)
      setFocused(prev)
      listRef.current?.children[prev]?.scrollIntoView({ block: 'nearest' })
    } else if (e.key === 'Enter' && focused >= 0 && filtered[focused]) {
      select(filtered[focused])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setQuery(value)
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
        {label}
      </label>
      <div className={`relative flex items-center h-11 rounded-xl border text-sm transition-colors ${
        disabled ? 'bg-gray-50 border-gray-200' :
        open      ? 'border-blue-400 ring-2 ring-blue-100' :
                    'border-gray-300 hover:border-gray-400'
      }`}>
        <input
          ref={inputRef}
          type="text"
          value={open ? query : value || query}
          onChange={e => { setQuery(e.target.value); setOpen(true); setFocused(-1) }}
          onFocus={() => { setOpen(true); setQuery('') }}
          onKeyDown={handleKeyDown}
          placeholder={loading ? '載入中…' : placeholder}
          disabled={disabled || loading}
          className="flex-1 h-full px-3 bg-transparent focus:outline-none text-gray-800 placeholder:text-gray-400 disabled:text-gray-400 min-w-0"
        />
        {/* 狀態 icon */}
        <div className="pr-3 shrink-0">
          {loading ? (
            <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
          ) : value ? (
            <button
              onClick={() => { onChange(''); setQuery(''); inputRef.current?.focus() }}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              tabIndex={-1}
            >×</button>
          ) : (
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
            </svg>
          )}
        </div>
      </div>

      {hint && !open && (
        <div className="text-xs text-gray-400 mt-1">{hint}</div>
      )}

      {/* 下拉清單 */}
      {open && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-xs text-gray-400">
              {options.length === 0 ? '無可用選項' : `找不到「${query}」`}
            </div>
          ) : (
            <>
              {query && (
                <div className="px-3 py-1.5 text-xs text-gray-400 border-b border-gray-100">
                  {filtered.length} 個符合結果
                </div>
              )}
              <ul ref={listRef} className="max-h-60 overflow-y-auto py-1">
                {filtered.map((opt, i) => (
                  <li
                    key={opt}
                    onMouseDown={() => select(opt)}
                    onMouseEnter={() => setFocused(i)}
                    className={`px-3 py-2 text-sm cursor-pointer flex items-start gap-2 ${
                      i === focused ? 'bg-blue-50 text-blue-800' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {/* 選中標記 */}
                    <span className="mt-0.5 w-3.5 shrink-0 text-blue-500 text-xs">
                      {opt === value ? '✓' : ''}
                    </span>
                    {/* 高亮搜尋字 */}
                    <span className="leading-snug">{highlightMatch(opt, query)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}

/** 搜尋字高亮（回傳 React node） */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx < 0) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-100 text-yellow-900 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

// ─── 結果卡片 ─────────────────────────────────────────────────────

function RuleCard({ rule, onApplyToCheck }: { rule: ZoningRule; onApplyToCheck?: (p: Partial<BuildingInput>) => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* 分區標題 */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-5 py-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-white font-bold text-lg leading-tight">{rule.zone_name}</div>
          <div className="text-blue-200 text-xs mt-1 leading-relaxed line-clamp-2">{rule.urban_plan_name}</div>
        </div>
        {rule.district && (
          <span className="text-xs bg-blue-700/50 text-blue-100 px-2.5 py-1 rounded-full shrink-0 mt-0.5 whitespace-nowrap">
            {rule.district}
          </span>
        )}
      </div>

      {/* 建蔽 / 容積 */}
      <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
        <div className="px-5 py-4 text-center">
          <div className="text-3xl font-bold text-red-600">
            {rule.coverage_ratio !== null ? `${rule.coverage_ratio}%` : '—'}
          </div>
          <div className="text-xs text-gray-500 mt-1 font-medium">建蔽率上限</div>
        </div>
        <div className="px-5 py-4 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {rule.floor_area_ratio !== null ? `${rule.floor_area_ratio}%` : '—'}
          </div>
          <div className="text-xs text-gray-500 mt-1 font-medium">容積率</div>
          {rule.max_far !== null && (
            <div className="text-xs text-blue-400 mt-0.5">（上限 {rule.max_far}%）</div>
          )}
        </div>
      </div>

      {/* 獎勵倍數 */}
      {rule.bonus_multiplier !== null && (
        <div className="px-5 py-2.5 bg-green-50 border-b border-green-100 flex items-center gap-2 text-xs text-green-700">
          <span className="text-green-500">🌿</span>
          <span><span className="font-medium">開放空間獎勵倍數：</span>{rule.bonus_multiplier} 倍</span>
        </div>
      )}

      {/* 來源摘要 */}
      <div className="px-5 py-2.5 bg-gray-50 text-xs text-gray-400 font-mono leading-relaxed">
        {rule.remarks?.replace(/\n/g, ' / ')}
      </div>

      {/* 資料來源 badge */}
      <div className="px-5 py-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span>臺中市都市計畫建蔽率容積率彙總表</span>
        <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">112.4.14 一版</span>
      </div>

      {/* 帶入法規檢核按鈕 */}
      {onApplyToCheck && (
        <ApplyToCheckSection rule={rule} onApplyToCheck={onApplyToCheck} />
      )}
    </div>
  )
}

// ─── 帶入法規檢核區塊 ─────────────────────────────────────────────

function ApplyToCheckSection({ rule, onApplyToCheck }: {
  rule: ZoningRule
  onApplyToCheck: (p: Partial<BuildingInput>) => void
}) {
  const [applied, setApplied] = useState(false)

  const district = firstDistrict(rule.district)
  const zoneType = toZoneType(rule.zone_name)

  // 依行政區對應 planAreaId
  const planAreaId = district
    ? (getPlanAreasByDistrict(district)[0]?.id ?? 'general_taichung')
    : 'general_taichung'

  const items = [
    { label: '行政區',    value: district || '（未知）' },
    { label: '都市計畫',  value: rule.urban_plan_name },
    { label: '使用分區',  value: rule.zone_name },
    { label: '建蔽率',    value: rule.coverage_ratio    !== null ? `${rule.coverage_ratio}%`    : '—' },
    { label: '容積率',    value: rule.floor_area_ratio  !== null ? `${rule.floor_area_ratio}%`  : '—' },
  ]

  const handleApply = () => {
    const confirmed = window.confirm(
      `確定要帶入法規檢核？\n\n` +
      items.map(i => `${i.label}：${i.value}`).join('\n') +
      `\n\n切換至「法規檢核」後，請補填基地面積、樓層等建築資料。`
    )
    if (!confirmed) return

    const partial: Partial<BuildingInput> = {
      district,
      planAreaId,
      zoneType,
      specialZoneIds: [],
    }
    onApplyToCheck(partial)
    setApplied(true)
  }

  return (
    <div className="px-5 py-4 border-t border-gray-100 space-y-3">
      <div className="text-xs font-semibold text-gray-700 mb-1">帶入法規檢核</div>

      {/* 預覽帶入欄位 */}
      <div className="space-y-1.5">
        {items.map(item => (
          <div key={item.label} className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">
            <span className="text-green-500 text-xs shrink-0">✓</span>
            <span className="text-xs text-green-700">
              <span className="font-medium">{item.label}：</span>{item.value}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        切換後請補填基地面積、樓層數、建築用途等資料，再執行檢核。
      </p>

      {applied ? (
        <div className="w-full h-11 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center gap-2 text-green-700 font-semibold text-sm">
          ✓ 已帶入法規檢核 — 請切換至「法規檢核」頁面
        </div>
      ) : (
        <button
          onClick={handleApply}
          className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          📋 帶入法規檢核 →
        </button>
      )}
    </div>
  )
}

// ─── 查無資料：顯示已送值 + 相近建議 ─────────────────────────────

interface NoResultProps {
  planName:  string
  zoneName:  string
  allZones:  string[]
}

function NoResultCard({ planName, zoneName, allZones }: NoResultProps) {
  // 相近分區：同計畫下，名稱包含使用者輸入的前綴（取前 5 個）
  const prefix = zoneName.replace(/[（(].*/g, '').trim()   // 去掉括號後的條件
  const suggestions = allZones
    .filter(z => z !== zoneName && z.startsWith(prefix))
    .slice(0, 5)

  return (
    <div className="bg-white border border-orange-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 bg-orange-50 border-b border-orange-100 flex items-start gap-3">
        <span className="text-orange-500 text-lg shrink-0">⚠</span>
        <div>
          <div className="text-sm font-semibold text-orange-800">查無符合資料</div>
          <div className="text-xs text-orange-600 mt-0.5 leading-relaxed">
            彙總表中找不到以下組合的建蔽容積規定
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-2.5 border-b border-gray-100">
        <div className="flex items-start gap-2 text-xs">
          <span className="text-gray-400 shrink-0 mt-0.5 w-20">都市計畫</span>
          <span className="font-mono text-gray-700 break-all">{planName || '（未填）'}</span>
        </div>
        <div className="flex items-start gap-2 text-xs">
          <span className="text-gray-400 shrink-0 mt-0.5 w-20">使用分區</span>
          <span className="font-mono text-gray-700">{zoneName || '（未填）'}</span>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="px-5 py-3">
          <div className="text-xs font-semibold text-gray-500 mb-2">
            同計畫下「{prefix}」相近分區：
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map(z => (
              <span key={z} className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-1 rounded-full">
                {z}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── 主元件 ───────────────────────────────────────────────────────

interface Props {
  onApplyToCheck?: (partial: Partial<BuildingInput>) => void
}

export default function ZoningRulesPanel({ onApplyToCheck }: Props) {
  const [meta,     setMeta]     = useState<DbMeta | null>(null)
  const [dbReady,  setDbReady]  = useState<boolean | null>(null)

  // 所有計畫名稱（一次性載入）
  const [allPlans,    setAllPlans]    = useState<string[]>([])
  const [plansLoading, setPlansLoading] = useState(false)

  // 選中的計畫名稱
  const [selectedPlan, setSelectedPlan] = useState('')

  // 該計畫底下的分區名稱（計畫變更時重新載入）
  const [zonesForPlan,  setZonesForPlan]  = useState<string[]>([])
  const [zonesLoading,  setZonesLoading]  = useState(false)

  // 選中的分區名稱
  const [selectedZone, setSelectedZone] = useState('')

  // 查詢結果
  const [rule,      setRule]      = useState<ZoningRule | null | undefined>(undefined) // undefined=未查, null=查無
  const [querying,  setQuerying]  = useState(false)
  const [lastPlan,  setLastPlan]  = useState('')
  const [lastZone,  setLastZone]  = useState('')

  // ── 載入 DB meta + 計畫清單 ─────────────────────────────────────
  useEffect(() => {
    // meta
    fetch('/api/zoning-rules/query?meta=1')
      .then(r => r.json())
      .then(data => {
        if (data.ok) { setMeta(data.meta); setDbReady(true) }
        else          setDbReady(false)
      })
      .catch(() => setDbReady(false))

    // 計畫清單
    setPlansLoading(true)
    fetch('/api/zoning-rules/query?plans=1')
      .then(r => r.json())
      .then(data => { if (data.ok) setAllPlans(data.plans ?? []) })
      .finally(() => setPlansLoading(false))
  }, [])

  // ── 計畫變更 → 載入分區 ─────────────────────────────────────────
  useEffect(() => {
    setSelectedZone('')
    setZonesForPlan([])
    setRule(undefined)

    if (!selectedPlan) return

    let cancelled = false
    setZonesLoading(true)
    fetch(`/api/zoning-rules/query?zones_for_plan=${encodeURIComponent(selectedPlan)}`)
      .then(r => r.json())
      .then(data => { if (!cancelled && data.ok) setZonesForPlan(data.zones ?? []) })
      .finally(() => { if (!cancelled) setZonesLoading(false) })

    return () => { cancelled = true }
  }, [selectedPlan])

  // ── 分區選定 → 自動查詢 ─────────────────────────────────────────
  const doQuery = useCallback(async (plan: string, zone: string) => {
    if (!plan || !zone) return
    setQuerying(true)
    setLastPlan(plan)
    setLastZone(zone)
    try {
      const params = new URLSearchParams({ exact_plan: plan, exact_zone: zone })
      const res  = await fetch(`/api/zoning-rules/query?${params}`)
      const data = await res.json()
      setRule(data.ok ? (data.rule ?? null) : null)
    } catch {
      setRule(null)
    } finally {
      setQuerying(false)
    }
  }, [])

  useEffect(() => {
    if (selectedPlan && selectedZone) {
      doQuery(selectedPlan, selectedZone)
    } else {
      setRule(undefined)
    }
  }, [selectedPlan, selectedZone, doQuery])

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* ── DB 狀態列 ─────────────────────────────────────────────── */}
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
                請在本機執行以下指令後重新部署：
              </div>
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl px-4 py-3 font-mono text-xs text-green-400 space-y-1">
            <div>node scripts/import-zoning-rules.mjs \</div>
            <div className="pl-4">&quot;臺中市都市計畫建蔽率容積率彙總表.xlsx&quot;</div>
          </div>
        </div>
      )}

      {dbReady === true && meta && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-green-800">✓ 建蔽率/容積率資料庫已載入</div>
            <div className="text-xs text-green-600 mt-0.5">
              {parseInt(meta.records_count).toLocaleString()} 筆規則 · {allPlans.length} 個細部計畫
              · 更新於 {meta.imported_at.slice(0, 10)}
            </div>
          </div>
          <span className="text-xs bg-green-100 border border-green-200 text-green-700 px-2.5 py-1 rounded-full font-semibold shrink-0">
            IMPORTED
          </span>
        </div>
      )}

      {/* ── 連動下拉查詢 ──────────────────────────────────────────── */}
      {dbReady === true && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <div className="text-sm font-bold text-gray-800">查詢建蔽率/容積率</div>

          {/* 步驟 1：都市計畫名稱 */}
          <div>
            <ComboBox
              label="① 都市計畫名稱"
              placeholder="輸入關鍵字篩選，例如：大里、西屯"
              options={allPlans}
              value={selectedPlan}
              onChange={setSelectedPlan}
              loading={plansLoading}
              hint={allPlans.length > 0 ? `共 ${allPlans.length} 個細部計畫，點擊或輸入關鍵字搜尋` : undefined}
            />
          </div>

          {/* 步驟 2：使用分區（計畫選定後才啟用） */}
          <div>
            <ComboBox
              label="② 使用分區"
              placeholder={
                !selectedPlan  ? '請先選擇都市計畫名稱' :
                zonesLoading   ? '載入分區中…' :
                zonesForPlan.length === 0 ? '此計畫無分區資料' :
                `共 ${zonesForPlan.length} 個分區，點擊或輸入關鍵字`
              }
              options={zonesForPlan}
              value={selectedZone}
              onChange={setSelectedZone}
              loading={zonesLoading}
              disabled={!selectedPlan || zonesLoading}
              hint={
                selectedPlan && !zonesLoading && zonesForPlan.length > 0
                  ? `此計畫共 ${zonesForPlan.length} 個分區`
                  : undefined
              }
            />
          </div>

          {/* 查詢進行中 */}
          {querying && (
            <div className="flex items-center gap-2 text-xs text-blue-600">
              <div className="w-3.5 h-3.5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              查詢中…
            </div>
          )}
        </div>
      )}

      {/* ── 查詢結果 ──────────────────────────────────────────────── */}
      {!querying && rule !== undefined && (
        rule
          ? <RuleCard rule={rule} onApplyToCheck={onApplyToCheck} />
          : <NoResultCard
              planName={lastPlan}
              zoneName={lastZone}
              allZones={zonesForPlan}
            />
      )}

      {/* ── 說明 ──────────────────────────────────────────────────── */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 space-y-2 text-xs text-blue-700">
        <div className="font-semibold text-blue-800">查詢流程說明</div>
        <div className="space-y-1 leading-relaxed">
          <div>① 選擇都市計畫名稱（來自官方彙總表，支援關鍵字搜尋）</div>
          <div>② 選擇使用分區（自動載入該計畫底下所有分區）</div>
          <div>③ 選完後自動顯示建蔽率/容積率，無需按查詢</div>
        </div>
        <div className="text-blue-500 pt-1 border-t border-blue-100">
          資料來源：臺中市都市計畫建蔽率容積率彙總表（112.4.14 一版）。
          如需更新，重新執行 import 腳本並 commit db 檔案。
        </div>
      </div>
    </div>
  )
}
