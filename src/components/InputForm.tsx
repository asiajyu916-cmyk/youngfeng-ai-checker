'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { BuildingInput } from '@/types'
import {
  getApplicableSpecialZones,
  resolvePlanAreaIdFromName,
} from '@/data/regionRules'
import { CASE_TYPES, getCaseTypeById } from '@/data/caseTypes'

// ─── 工具：zoneName → zoneType（供 Rule Engine 向後相容）────────────

const ARABIC_TO_CHINESE: Record<string, string> = {
  '1': '一', '2': '二', '3': '三', '4': '四', '5': '五',
}

function toZoneType(zoneName: string): string {
  const stripped = zoneName.replace(/[（(（][^）)）]*/g, '').replace(/[）)）]/g, '').trim()
  if (/工業/.test(stripped) || /^乙工/.test(stripped) || /^甲工/.test(stripped)) return '工業區'
  if (/^農/.test(stripped)) return '農業區'
  if (/^行政/.test(stripped)) return '行政區'
  if (/^文[教]/.test(stripped)) return '文教區'
  const residComm = stripped.match(/^([住商])(\d+)/)
  if (residComm) {
    const candidate = residComm[1] + (ARABIC_TO_CHINESE[residComm[2]] ?? residComm[2])
    return candidate
  }
  const chineseNum = stripped.match(/^([住商])(一|二|三|四|五)/)
  if (chineseNum) return chineseNum[1] + chineseNum[2]
  if (stripped === '住' || stripped.startsWith('住(') || stripped.startsWith('住甲')) return '住一'
  if (stripped === '商' || stripped.startsWith('商(')) return '商一'
  return stripped
}

// ─── DB Rule 型別 ────────────────────────────────────────────────

interface DbZoningRule {
  coverage_ratio:   number | null
  floor_area_ratio: number | null
  max_far:          number | null
  bonus_multiplier: number | null
  remarks:          string | null
  urban_plan_name:  string
  zone_name:        string
}

// ─── ComboBox ────────────────────────────────────────────────────

interface ComboBoxProps {
  label:       string
  placeholder: string
  options:     string[]
  value:       string
  onChange:    (val: string) => void
  loading?:    boolean
  disabled?:   boolean
  hint?:       string
  required?:   boolean
}

function ComboBox({ label, placeholder, options, value, onChange, loading, disabled, hint, required }: ComboBoxProps) {
  const [query,   setQuery]   = useState('')
  const [open,    setOpen]    = useState(false)
  const [focused, setFocused] = useState(-1)
  const wrapRef  = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef  = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (!open) setQuery(value)
  }, [value, open])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery(value)
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
      setOpen(true); setFocused(0); return
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
      setOpen(false); setQuery(value)
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className={`relative flex items-center h-11 rounded-lg border text-sm transition-colors ${
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
          className="flex-1 h-full px-3 bg-transparent focus:outline-none text-gray-800 placeholder:text-gray-400 disabled:text-gray-400 text-sm min-w-0"
        />
        <div className="pr-3 shrink-0">
          {loading ? (
            <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
          ) : value ? (
            <button
              type="button"
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
      {hint && !open && <p className="mt-1 text-xs text-gray-400">{hint}</p>}

      {open && !disabled && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {query && (
            <div className="px-3 py-1.5 text-xs text-gray-400 border-b border-gray-100">
              {filtered.length} 個符合結果
            </div>
          )}
          <ul ref={listRef} className="max-h-52 overflow-y-auto py-1">
            {filtered.map((opt, i) => (
              <li
                key={opt}
                onMouseDown={() => select(opt)}
                onMouseEnter={() => setFocused(i)}
                className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 ${
                  i === focused ? 'bg-blue-50 text-blue-800' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="w-3 shrink-0 text-blue-500 text-xs">{opt === value ? '✓' : ''}</span>
                <span>{opt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {open && !disabled && filtered.length === 0 && options.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 text-xs text-gray-400">
          找不到「{query}」
        </div>
      )}
    </div>
  )
}

// ─── 可收合區塊 ───────────────────────────────────────────────────

function CollapsibleSection({
  title, subtitle, children, defaultOpen = true, forceCollapsible = false,
}: {
  title: string; subtitle?: string; children: React.ReactNode; defaultOpen?: boolean; forceCollapsible?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left pb-2 border-b border-gray-100 mb-3 flex items-center justify-between group"
      >
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <span className={`${forceCollapsible ? '' : 'md:hidden '}text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div className={open ? 'block' : forceCollapsible ? 'hidden' : 'hidden md:block'}>{children}</div>
    </section>
  )
}

function Field({ label, children, hint, required }: {
  label: string; children: React.ReactNode; hint?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

function Select({ value, onChange, options, placeholder }: {
  value: string
  onChange: (v: string) => void
  options: readonly string[] | { value: string; label: string }[]
  placeholder?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-h-[44px]"
    >
      <option value="">{placeholder ?? '請選擇'}</option>
      {options.map((o) => {
        const val   = typeof o === 'string' ? o : o.value
        const label = typeof o === 'string' ? o : o.label
        return <option key={val} value={val}>{label}</option>
      })}
    </select>
  )
}

function NumberInput({ value, onChange, min = 0, step = 1, placeholder }: {
  value: number; onChange: (v: number) => void; min?: number; step?: number; placeholder?: string
}) {
  return (
    <input
      type="number"
      min={min}
      step={step}
      value={value === 0 ? '' : value}
      placeholder={placeholder ?? '0'}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
    />
  )
}

function Toggle({ checked, onChange, label, sublabel }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; sublabel?: string
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group py-1">
      <div className="relative mt-0.5 shrink-0">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
        <div className={`w-10 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`} />
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </div>
      <div>
        <span className={`text-sm font-medium ${checked ? 'text-blue-700' : 'text-gray-600'}`}>{label}</span>
        {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
    </label>
  )
}

// ─── 主元件 Props ─────────────────────────────────────────────────

interface Props {
  value:    BuildingInput
  onChange: (v: BuildingInput) => void
  onSubmit: () => void
  loading:  boolean
}

// ─── 主元件 ───────────────────────────────────────────────────────

export default function InputForm({ value, onChange, onSubmit, loading }: Props) {
  // 使用 ref 避免 useEffect 中 stale closure
  const valueRef = useRef(value)
  useEffect(() => { valueRef.current = value })

  const set = <K extends keyof BuildingInput>(key: K, val: BuildingInput[K]) =>
    onChange({ ...value, [key]: val })

  // ── DB 資料載入狀態 ──────────────────────────────────────────
  const [allPlans,     setAllPlans]     = useState<string[]>([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [dbAvailable,  setDbAvailable]  = useState(true)

  const [zonesForPlan, setZonesForPlan] = useState<string[]>([])
  const [zonesLoading, setZonesLoading] = useState(false)

  const [ruleQuerying, setRuleQuerying] = useState(false)
  const [fetchedRule,  setFetchedRule]  = useState<DbZoningRule | null>(null)

  // ── 初始載入：所有計畫名稱 ────────────────────────────────────
  useEffect(() => {
    fetch('/api/zoning-rules/query?plans=1')
      .then(r => r.json())
      .then(data => {
        if (data.ok) setAllPlans(data.plans ?? [])
        else         setDbAvailable(false)
      })
      .catch(() => setDbAvailable(false))
      .finally(() => setPlansLoading(false))
  }, [])

  // ── 計畫變更 → 載入分區 ──────────────────────────────────────
  useEffect(() => {
    setZonesForPlan([])
    setFetchedRule(null)
    if (!value.urbanPlanName) return
    let cancelled = false
    setZonesLoading(true)
    fetch(`/api/zoning-rules/query?zones_for_plan=${encodeURIComponent(value.urbanPlanName)}`)
      .then(r => r.json())
      .then(data => { if (!cancelled && data.ok) setZonesForPlan(data.zones ?? []) })
      .finally(() => { if (!cancelled) setZonesLoading(false) })
    return () => { cancelled = true }
  }, [value.urbanPlanName])

  // ── 查詢規則（計畫 + 分區都選定時）─────────────────────────
  const fetchRule = useCallback(async (plan: string, zone: string) => {
    if (!plan || !zone) return
    setRuleQuerying(true)
    setFetchedRule(null)
    try {
      const params = new URLSearchParams({ exact_plan: plan, exact_zone: zone })
      const res  = await fetch(`/api/zoning-rules/query?${params}`)
      const data = await res.json()
      if (data.ok && data.rule) {
        const rule: DbZoningRule = data.rule
        setFetchedRule(rule)
        const planAreaId = resolvePlanAreaIdFromName(plan)
        const zoneType   = toZoneType(zone)
        onChange({
          ...valueRef.current,
          coverageRatio:  rule.coverage_ratio  ?? null,
          floorAreaRatio: rule.floor_area_ratio ?? null,
          zoningRemarks:  rule.remarks          ?? '',
          planAreaId,
          zoneType,
        })
      } else {
        setFetchedRule(null)
        onChange({ ...valueRef.current, coverageRatio: null, floorAreaRatio: null, zoningRemarks: '' })
      }
    } catch {
      setFetchedRule(null)
    } finally {
      setRuleQuerying(false)
    }
  }, [onChange])

  // ── 分區選定 → 自動查詢 ──────────────────────────────────────
  useEffect(() => {
    if (value.urbanPlanName && value.zoneName) {
      // 若已有 coverageRatio 代表是從外部帶入，不重複查詢
      if (value.coverageRatio === null && value.floorAreaRatio === null) {
        fetchRule(value.urbanPlanName, value.zoneName)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.urbanPlanName, value.zoneName])

  // ── 初始化時：若已有計畫+分區但無建蔽率（地號查詢帶入的情況）
  useEffect(() => {
    if (value.urbanPlanName && value.zoneName && value.coverageRatio === null) {
      fetchRule(value.urbanPlanName, value.zoneName)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 只在 mount 時執行一次

  // ── 計畫選擇 handler ─────────────────────────────────────────
  const handlePlanChange = (plan: string) => {
    onChange({
      ...value,
      urbanPlanName:  plan,
      zoneName:       '',
      coverageRatio:  null,
      floorAreaRatio: null,
      zoningRemarks:  '',
      planAreaId:     plan ? resolvePlanAreaIdFromName(plan) : '',
      zoneType:       '',
    })
    setFetchedRule(null)
  }

  // ── 分區選擇 handler ─────────────────────────────────────────
  const handleZoneChange = (zone: string) => {
    onChange({
      ...value,
      zoneName:       zone,
      coverageRatio:  null,
      floorAreaRatio: null,
      zoningRemarks:  '',
      zoneType:       zone ? toZoneType(zone) : '',
    })
    setFetchedRule(null)
    if (value.urbanPlanName && zone) {
      // useEffect 會接手，但直接 call 更即時
      setTimeout(() => fetchRule(value.urbanPlanName, zone), 0)
    }
  }

  // 顯示用的規則：優先使用 fetchedRule，其次使用 value 的既有資料
  const displayRule = fetchedRule ?? (
    (value.coverageRatio !== null || value.floorAreaRatio !== null)
      ? { coverage_ratio: value.coverageRatio, floor_area_ratio: value.floorAreaRatio, max_far: null, bonus_multiplier: null, remarks: value.zoningRemarks, urban_plan_name: value.urbanPlanName, zone_name: value.zoneName }
      : null
  )

  const toggleSpecialZone = (id: string, checked: boolean) => {
    const next = checked
      ? [...new Set([...value.specialZoneIds, id])]
      : value.specialZoneIds.filter((z) => z !== id)
    set('specialZoneIds', next)
  }

  // ── 案件類型 handler ─────────────────────────────────────────
  const handleCaseTypeChange = (caseTypeId: string) => {
    const ct = getCaseTypeById(caseTypeId)
    onChange({
      ...value,
      caseType:    caseTypeId,
      buildingUse: ct?.defaultBuildingUse ?? value.buildingUse,
    })
  }

  const selectedCaseType = getCaseTypeById(value.caseType)
  // 依案件類型篩選建築用途選項；未選則顯示全部
  const buildingUseOptions: string[] = selectedCaseType?.buildingUseOptions ?? [
    '住宅', '集合住宅', '住商混合', '住辦混合',
    '辦公', '商業', '旅館', '醫療', '學校',
    '政府機關', '倉儲', '工廠', '其他',
  ]

  const isResidential = ['住宅', '集合住宅', '住商混合', '住辦混合'].includes(value.buildingUse)
  const canSubmit     = !loading && !!value.caseType && !!value.urbanPlanName && !!value.zoneName && !!value.buildingUse

  return (
    <div className="bg-white md:rounded-xl md:shadow-sm md:border md:border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-5 py-4">
        <h2 className="text-white font-semibold text-base">基地與建築資料輸入</h2>
        <p className="text-blue-200 text-xs mt-0.5 hidden md:block">
          判斷順序：案件類型 → 都市計畫區 → 使用分區 → 特殊管制區 → 樓層 / 面積
        </p>
      </div>

      <div className="p-5 space-y-5">

        {/* ── 區塊 0：案件類型 ── */}
        <div>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-sm font-medium text-gray-700">案件類型</span>
            <span className="text-red-400 text-sm">*</span>
            <span className="text-xs text-gray-400 ml-1">選定後自動載入常用法規模組</span>
          </div>
          {/* 類型卡片選擇 */}
          <div className="grid grid-cols-3 gap-2">
            {CASE_TYPES.map(ct => (
              <button
                key={ct.id}
                type="button"
                onClick={() => handleCaseTypeChange(ct.id)}
                className={`flex flex-col items-center gap-1 px-1 py-2.5 rounded-xl border-2 text-center transition-all ${
                  value.caseType === ct.id
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl leading-none">{ct.icon}</span>
                <span className={`text-[11px] font-semibold leading-tight ${
                  value.caseType === ct.id ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {ct.label}
                </span>
              </button>
            ))}
          </div>

          {/* 預載模組預覽（選定後展開） */}
          {selectedCaseType && (
            <div className="mt-2.5 bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2">
              <div className="text-xs font-semibold text-blue-700">
                {selectedCaseType.icon} {selectedCaseType.label} — 預載法規模組
              </div>
              {/* 必辦模組 */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-semibold text-gray-500 shrink-0 w-8">必辦</span>
                {selectedCaseType.baseModules.map(m => (
                  <span
                    key={m.code}
                    title={`${m.code}：${m.reason}`}
                    className="text-[10px] bg-blue-500 text-white font-medium px-2 py-0.5 rounded-full cursor-help"
                  >
                    {m.name}
                  </span>
                ))}
              </div>
              {/* 條件觸發模組 */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-semibold text-gray-500 shrink-0 w-8">依條件</span>
                {selectedCaseType.conditionalHints.map(m => (
                  <span
                    key={m.code}
                    title={m.reason}
                    className="text-[10px] bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded-full cursor-help border border-gray-200"
                  >
                    {m.name}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 pt-0.5">
                將依都市計畫區、使用分區、樓層、面積自動觸發「依條件」模組
              </p>
            </div>
          )}
        </div>

        {/* ── 區塊 1：基地法規資訊（主要） ── */}
        <CollapsibleSection
          title="基地法規資訊"
          subtitle="依都市計畫名稱查詢建蔽率/容積率"
        >
          {/* DB 不可用提示 */}
          {!dbAvailable && (
            <div className="mb-3 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2.5 text-xs text-orange-700">
              <div className="font-semibold">⚠ 建蔽容積資料庫尚未匯入</div>
              <div className="mt-0.5 leading-relaxed">請執行 <code className="bg-orange-100 px-1 rounded">node scripts/import-zoning-rules.mjs</code> 後重新部署</div>
            </div>
          )}

          <div className="space-y-3">
            {/* 都市計畫名稱 */}
            <ComboBox
              label="都市計畫名稱"
              placeholder={plansLoading ? '載入中…' : '輸入關鍵字，例：大里、西屯'}
              options={allPlans}
              value={value.urbanPlanName}
              onChange={handlePlanChange}
              loading={plansLoading}
              disabled={!dbAvailable}
              hint={allPlans.length > 0 ? `共 ${allPlans.length} 個細部計畫，點擊搜尋` : undefined}
              required
            />

            {/* 使用分區 */}
            <ComboBox
              label="使用分區"
              placeholder={
                !value.urbanPlanName ? '請先選擇都市計畫名稱' :
                zonesLoading         ? '載入分區中…' :
                zonesForPlan.length === 0 ? '此計畫無分區資料' :
                `共 ${zonesForPlan.length} 個分區，點擊搜尋`
              }
              options={zonesForPlan}
              value={value.zoneName}
              onChange={handleZoneChange}
              loading={zonesLoading}
              disabled={!value.urbanPlanName || zonesLoading || !dbAvailable}
              required
            />
          </div>

          {/* 查詢中 spinner */}
          {ruleQuerying && (
            <div className="mt-3 flex items-center gap-2 text-xs text-blue-600">
              <div className="w-3.5 h-3.5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              查詢建蔽率/容積率…
            </div>
          )}

          {/* 建蔽/容積顯示 */}
          {!ruleQuerying && displayRule && value.zoneName && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-xl overflow-hidden">
              {/* 數值 */}
              <div className="grid grid-cols-2 divide-x divide-green-200 border-b border-green-200">
                <div className="px-4 py-3 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {displayRule.coverage_ratio !== null ? `${displayRule.coverage_ratio}%` : '—'}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">建蔽率上限</div>
                </div>
                <div className="px-4 py-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {displayRule.floor_area_ratio !== null ? `${displayRule.floor_area_ratio}%` : '—'}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">容積率</div>
                  {displayRule.max_far !== null && (
                    <div className="text-xs text-blue-400 mt-0.5">（上限 {displayRule.max_far}%）</div>
                  )}
                </div>
              </div>
              {/* 備註 */}
              {displayRule.remarks && (
                <div className="px-4 py-2.5 border-b border-green-200 text-xs text-gray-600 leading-relaxed">
                  <span className="text-gray-400 font-medium">備註：</span>{displayRule.remarks.replace(/\n/g, ' / ')}
                </div>
              )}
              {/* 資料來源 */}
              <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-400">
                <span>資料來源：臺中市都市計畫建蔽率容積率彙總表</span>
                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">112.4.14 一版</span>
              </div>
            </div>
          )}

          {/* 查無資料 */}
          {!ruleQuerying && !displayRule && value.urbanPlanName && value.zoneName && (
            <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2.5 text-xs text-orange-700">
              ⚠ 彙總表中查無「{value.zoneName}」對應建蔽率/容積率，請向主管機關確認
            </div>
          )}

          {/* ⚠ 土管提醒 */}
          {value.urbanPlanName && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 flex items-start gap-2">
              <span className="text-amber-500 shrink-0 mt-0.5">⚠</span>
              <p className="text-xs text-amber-800 leading-relaxed">
                請確認本案是否另需檢討「<strong>{value.urbanPlanName}</strong>」之土地使用分區管制要點，並將相關土管條文納入法規檢核項目。
              </p>
            </div>
          )}
        </CollapsibleSection>

        {/* ── 區塊 2：地址參考（唯讀） ── */}
        {value.district && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-2.5">
            <span className="text-xs text-gray-400 shrink-0">📍 地址參考</span>
            <span className="text-sm font-medium text-gray-700">{value.district}</span>
            <span className="ml-auto text-xs text-gray-400 italic">
              行政區僅供地址參考，不作為建蔽率/容積率或土管判斷依據
            </span>
          </div>
        )}

        {/* ── 區塊 3：特殊管制區（依都市計畫自動篩選） ── */}
        {(() => {
          const applicableZones = getApplicableSpecialZones(value.urbanPlanName)
          const isAutoWaterNan   = value.urbanPlanName.includes('水湳')
          if (applicableZones.length === 0) return null
          return (
            <CollapsibleSection
              title="特殊管制區"
              subtitle={value.urbanPlanName
                ? `依「${value.urbanPlanName.slice(0, 12)}」篩選，${applicableZones.length} 項適用，可多選`
                : '可多選，每項觸發額外法規'}
              defaultOpen={false}
            >
              <div className="space-y-1.5">
                {applicableZones.map((zone) => {
                  const isChecked = value.specialZoneIds.includes(zone.id)
                  // 水湳計畫時水湳特管區自動勾選
                  const isAutoSelected = zone.id === 'water_nan' && isAutoWaterNan
                  return (
                    <label
                      key={zone.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      } ${isAutoSelected ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked || isAutoSelected}
                        disabled={isAutoSelected}
                        onChange={(e) => toggleSpecialZone(zone.id, e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-blue-600 rounded"
                      />
                      <div className="min-w-0">
                        <div className={`text-sm font-medium ${isChecked ? 'text-blue-700' : 'text-gray-700'}`}>
                          {zone.name}
                          {isAutoSelected && <span className="ml-1 text-xs text-blue-500">（自動選取）</span>}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{zone.description}</div>
                      </div>
                    </label>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                僅顯示與「{value.urbanPlanName || '所選計畫'}」相關之特殊管制區。
                山坡地、文化資產等地理條件請依基地實際情形勾選。
              </p>
            </CollapsibleSection>
          )
        })()}

        {/* ── 區塊 4：土地資料 ── */}
        <CollapsibleSection title="土地資料">
          <Field label="基地面積（㎡）">
            <NumberInput value={value.landArea} onChange={(v) => set('landArea', v)} placeholder="例：850" />
          </Field>
        </CollapsibleSection>

        {/* ── 區塊 5：建築基本資料 ── */}
        <CollapsibleSection title="建築基本資料">
          <div className="grid grid-cols-2 gap-3">
            <Field label="建築用途" required>
              <Select
                value={value.buildingUse}
                onChange={(v) => set('buildingUse', v)}
                options={buildingUseOptions as string[]}
                placeholder="請選擇用途"
              />
            </Field>

            <Field label="所有權">
              <Select
                value={value.buildingOwnership}
                onChange={(v) => set('buildingOwnership', v as 'public' | 'private')}
                options={[
                  { value: 'private', label: '私有' },
                  { value: 'public',  label: '公有' },
                ]}
              />
            </Field>

            <Field label="地上層數（F）">
              <NumberInput value={value.floorsAbove} onChange={(v) => set('floorsAbove', v)} min={1} placeholder="例：18" />
            </Field>

            <Field label="地下層數（B）">
              <NumberInput value={value.floorsBelow} onChange={(v) => set('floorsBelow', v)} placeholder="例：2" />
            </Field>

            <Field label="建築高度（m）" hint="含屋突、機電層之總高度">
              <NumberInput value={value.heightM} onChange={(v) => set('heightM', v)} step={0.1} placeholder="例：62.5" />
            </Field>

            <Field label="總樓地板（㎡）">
              <NumberInput value={value.totalFloorArea} onChange={(v) => set('totalFloorArea', v)} placeholder="例：4200" />
            </Field>

            {isResidential && (
              <Field label="住宅戶數（戶）">
                <NumberInput value={value.residentialUnits} onChange={(v) => set('residentialUnits', v)} placeholder="例：32" />
              </Field>
            )}
          </div>

          {(value.floorsAbove >= 16 || value.heightM > 50) && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
              🔴 <strong>高層建築物：</strong>{value.floorsAbove}F / {value.heightM}m → 觸發高層建築物完整檢討
            </div>
          )}
          {(value.floorsAbove === 15 || (value.heightM >= 45 && value.heightM <= 50)) && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-700">
              ⚠️ <strong>接近門檻：</strong>請確認含屋突後之精確建築高度
            </div>
          )}
        </CollapsibleSection>

        {/* ── 區塊 6：特殊條件 ── */}
        <CollapsibleSection title="特殊條件" defaultOpen={false}>
          <div className="space-y-1">
            <Toggle
              checked={value.isHazardRebuild}
              onChange={(v) => set('isHazardRebuild', v)}
              label="危老重建案"
              sublabel="依都市危險及老舊建築物加速重建條例"
            />
            <Toggle
              checked={value.isFarTransfer}
              onChange={(v) => set('isFarTransfer', v)}
              label="申請容積移轉"
              sublabel="接收容積移轉，上限法定容積 30%"
            />
            <Toggle
              checked={value.isOpenSpace}
              onChange={(v) => set('isOpenSpace', v)}
              label="申請開放空間獎勵"
              sublabel="提供公共開放空間換取容積獎勵"
            />
          </div>
        </CollapsibleSection>

        {/* ── Submit ── */}
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors text-base flex items-center justify-center gap-2 min-h-[52px]"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              檢核中…
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              開始檢核
            </>
          )}
        </button>

        {!canSubmit && !loading && (
          <p className="text-xs text-center text-gray-400">
            {!value.caseType
              ? '請先選擇「案件類型」'
              : !value.urbanPlanName
                ? '請選擇「都市計畫名稱」'
                : !value.zoneName
                  ? '請選擇「使用分區」'
                  : '請填寫「建築用途」'}
          </p>
        )}
      </div>
    </div>
  )
}
