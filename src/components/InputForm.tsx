'use client'

import { useMemo, useState } from 'react'
import type { BuildingInput } from '@/types'
import {
  TAICHUNG_DISTRICTS,
  PLAN_AREAS,
  SPECIAL_ZONES,
  ZONE_TYPES,
  BUILDING_USES,
  getPlanAreasByDistrict,
  getZoningRule,
  getPlanAreaById,
} from '@/data/regionRules'

interface Props {
  value: BuildingInput
  onChange: (v: BuildingInput) => void
  onSubmit: () => void
  loading: boolean
}

// ─── 可收合區塊 ───────────────────────────────────────────────

function CollapsibleSection({
  title,
  subtitle,
  children,
  defaultOpen = true,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  defaultOpen?: boolean
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
        <span className={`md:hidden text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {/* Always show on desktop; collapsible on mobile */}
      <div className={open ? 'block' : 'hidden md:block'}>
        {children}
      </div>
    </section>
  )
}

// ─── 欄位元件 ─────────────────────────────────────────────────

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
        const val = typeof o === 'string' ? o : o.value
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

// ─── 主元件 ───────────────────────────────────────────────────

export default function InputForm({ value, onChange, onSubmit, loading }: Props) {
  const set = <K extends keyof BuildingInput>(key: K, val: BuildingInput[K]) =>
    onChange({ ...value, [key]: val })

  const availablePlanAreas = useMemo(
    () => getPlanAreasByDistrict(value.district),
    [value.district]
  )

  const handleDistrictChange = (district: string) => {
    const filtered = getPlanAreasByDistrict(district)
    const currentValid = filtered.some((p) => p.id === value.planAreaId)
    onChange({ ...value, district, planAreaId: currentValid ? value.planAreaId : '' })
  }

  const handlePlanAreaChange = (planAreaId: string) => {
    let newSpecialZoneIds = value.specialZoneIds.filter((id) => id !== 'water_nan')
    if (planAreaId === 'water_nan') {
      newSpecialZoneIds = [...new Set([...newSpecialZoneIds, 'water_nan'])]
    }
    onChange({ ...value, planAreaId, specialZoneIds: newSpecialZoneIds })
  }

  const toggleSpecialZone = (id: string, checked: boolean) => {
    const next = checked
      ? [...new Set([...value.specialZoneIds, id])]
      : value.specialZoneIds.filter((z) => z !== id)
    set('specialZoneIds', next)
  }

  const selectedPlanArea = getPlanAreaById(value.planAreaId)
  const selectedZoningRule = selectedPlanArea && value.zoneType
    ? getZoningRule(selectedPlanArea, value.zoneType)
    : undefined

  const isResidential = ['住宅', '集合住宅', '住商混合', '住辦混合'].includes(value.buildingUse)
  const canSubmit = !loading && !!value.district && !!value.planAreaId && !!value.buildingUse

  return (
    <div className="bg-white md:rounded-xl md:shadow-sm md:border md:border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-5 py-4">
        <h2 className="text-white font-semibold text-base">基地與建築資料輸入</h2>
        <p className="text-blue-200 text-xs mt-0.5 hidden md:block">
          判斷順序：行政區 → 都市計畫區 → 特殊管制區 → 使用分區 → 用途 → 規模
        </p>
      </div>

      <div className="p-5 space-y-5">

        {/* ── 區塊 1：位置資訊 ── */}
        <CollapsibleSection title="位置資訊" subtitle="決定適用哪一套區域規則">
          <div className="grid grid-cols-2 gap-3">
            <Field label="行政區" required>
              <Select
                value={value.district}
                onChange={handleDistrictChange}
                options={TAICHUNG_DISTRICTS as unknown as string[]}
                placeholder="請選擇行政區"
              />
            </Field>

            <Field
              label="都市計畫區"
              required
              hint={value.district ? `${availablePlanAreas.length} 個計畫區可選` : '請先選擇行政區'}
            >
              <Select
                value={value.planAreaId}
                onChange={handlePlanAreaChange}
                options={availablePlanAreas.map((p) => ({ value: p.id, label: p.shortName }))}
                placeholder="請選擇都市計畫區"
              />
            </Field>
          </div>

          {selectedPlanArea && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 text-xs space-y-1">
              <div className="font-semibold text-blue-800">{selectedPlanArea.name}</div>
              <div className="text-blue-700 flex flex-wrap gap-x-4 gap-y-0.5">
                <span>
                  都審門檻：
                  <strong>
                    {selectedPlanArea.urbanDesign.isIndependent
                      ? '全案需審（獨立機制）'
                      : selectedPlanArea.urbanDesign.required === 0
                      ? '全案需審'
                      : `${selectedPlanArea.urbanDesign.required.toLocaleString()}㎡`}
                  </strong>
                </span>
                <span>審議機關：<strong>{selectedPlanArea.urbanDesign.authority}</strong></span>
              </div>
              {selectedPlanArea.specialRules.slice(0, 2).map((r, i) => (
                <div key={i} className="text-blue-600">• {r}</div>
              ))}
            </div>
          )}
        </CollapsibleSection>

        {/* ── 區塊 2：特殊管制區 ── */}
        <CollapsibleSection title="特殊管制區" subtitle="可多選，每項觸發額外法規" defaultOpen={false}>
          <div className="grid grid-cols-1 gap-2">
            {SPECIAL_ZONES.map((zone) => {
              const isChecked = value.specialZoneIds.includes(zone.id)
              const isAutoSelected = zone.id === 'water_nan' && value.planAreaId === 'water_nan'
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
                    checked={isChecked}
                    disabled={isAutoSelected}
                    onChange={(e) => toggleSpecialZone(zone.id, e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded"
                  />
                  <div className="min-w-0">
                    <div className={`text-sm font-medium ${isChecked ? 'text-blue-700' : 'text-gray-700'}`}>
                      {zone.name}
                      {isAutoSelected && (
                        <span className="ml-1 text-xs text-blue-500">（自動選取）</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{zone.description}</div>
                  </div>
                </label>
              )
            })}
          </div>
        </CollapsibleSection>

        {/* ── 區塊 3：土地資料 ── */}
        <CollapsibleSection title="土地資料">
          <div className="grid grid-cols-2 gap-3">
            <Field label="使用分區" required>
              <Select
                value={value.zoneType}
                onChange={(v) => set('zoneType', v)}
                options={
                  selectedPlanArea && !selectedPlanArea.appliesGeneralZoning
                    ? selectedPlanArea.zoningRules.map((r) => r.zoneType)
                    : ZONE_TYPES as unknown as string[]
                }
                placeholder="請選擇使用分區"
              />
            </Field>
            <Field label="基地面積（㎡）">
              <NumberInput value={value.landArea} onChange={(v) => set('landArea', v)} placeholder="例：850" />
            </Field>
          </div>

          {selectedZoningRule && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-800 flex flex-wrap gap-x-4 gap-y-0.5">
              <span className="font-semibold">{value.zoneType} 管制：</span>
              <span>建蔽率 <strong>{selectedZoningRule.maxBuildingCoverage}%</strong></span>
              <span>容積率 <strong>{selectedZoningRule.maxFar}%</strong></span>
              {selectedZoningRule.maxHeight && (
                <span>限高 <strong>{selectedZoningRule.maxHeight}m</strong></span>
              )}
              {selectedZoningRule.notes && (
                <span className="w-full text-green-600">{selectedZoningRule.notes}</span>
              )}
            </div>
          )}
        </CollapsibleSection>

        {/* ── 區塊 4：建築基本資料 ── */}
        <CollapsibleSection title="建築基本資料">
          <div className="grid grid-cols-2 gap-3">
            <Field label="建築用途" required>
              <Select
                value={value.buildingUse}
                onChange={(v) => set('buildingUse', v)}
                options={BUILDING_USES as unknown as string[]}
                placeholder="請選擇用途"
              />
            </Field>

            <Field label="所有權">
              <Select
                value={value.buildingOwnership}
                onChange={(v) => set('buildingOwnership', v as 'public' | 'private')}
                options={[
                  { value: 'private', label: '私有' },
                  { value: 'public', label: '公有' },
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

        {/* ── 區塊 5：特殊條件 ── */}
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
          <p className="text-xs text-center text-gray-400">請至少填寫「行政區」、「都市計畫區」與「建築用途」</p>
        )}
      </div>
    </div>
  )
}
