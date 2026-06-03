'use client'

import type { CheckReport } from '@/types'

interface Props {
  report: CheckReport
  caseName?: string
}

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-gray-800 truncate">{value || '—'}</span>
    </div>
  )
}

export default function CaseSummary({ report, caseName }: Props) {
  const s = report.inputSummary
  const ri = report.rulesetInfo
  const total = report.required.length + report.conditional.length +
    report.manualReview.length + report.notRequired.length

  return (
    <div className="bg-white border-b border-gray-200 px-5 py-4 shrink-0">
      {/* Title row */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-800">{caseName || '本次檢核案件'}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {ri.district || '—'}・{ri.planAreaShortName}・{ri.ruleVersion}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-center">
            <div className="text-xl font-bold text-red-600">{report.required.length}</div>
            <div className="text-xs text-gray-400">需檢討</div>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="text-center">
            <div className="text-xl font-bold text-orange-500">{report.manualReview.length}</div>
            <div className="text-xs text-gray-400">人工覆核</div>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="text-center">
            <div className="text-xl font-bold text-gray-600">{total}</div>
            <div className="text-xs text-gray-400">總計</div>
          </div>
        </div>
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-3 gap-x-4 gap-y-2.5 bg-gray-50 rounded-xl p-3 border border-gray-100">
        <Field label="行政區" value={s.district} />
        <Field label="使用分區" value={s.zoneType} />
        <Field label="建築用途" value={s.buildingUse} />
        <Field label="基地面積" value={s.landArea ? `${s.landArea.toLocaleString()} ㎡` : 0} />
        <Field label="地上樓層" value={s.floorsAbove ? `${s.floorsAbove} 層` : 0} />
        <Field label="地下樓層" value={s.floorsBelow ? `${s.floorsBelow} 層` : 0} />
        <Field label="建築高度" value={s.heightM ? `${s.heightM} m` : 0} />
        <Field label="總樓地板" value={s.totalFloorArea ? `${s.totalFloorArea.toLocaleString()} ㎡` : 0} />
        <Field label="所有權別" value={s.buildingOwnership === 'public' ? '公有' : '私有'} />
      </div>

      {/* Special flags */}
      {(s.isHazardRebuild || s.isFarTransfer || s.isOpenSpace) && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {s.isHazardRebuild && (
            <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-medium">危老重建</span>
          )}
          {s.isFarTransfer && (
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">容積移轉</span>
          )}
          {s.isOpenSpace && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">開放空間</span>
          )}
        </div>
      )}
    </div>
  )
}
