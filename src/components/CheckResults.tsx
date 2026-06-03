'use client'

import type { CheckReport, CheckResult, CheckStatus } from '@/types'
import { ModuleIcon, IconDownload, IconRefresh, IconCheckCircle } from './icons'

interface Props {
  report: CheckReport
  selectedCode?: string
  onSelect?: (result: CheckResult) => void
}

// ─── 狀態設定 ─────────────────────────────────────────────────

const STATUS_CONFIG: Record<CheckStatus, {
  label: string
  icon: string
  headerBg: string
  headerText: string
  headerBorder: string
  cardBg: string
  cardBorder: string
  badgeBg: string
  badgeText: string
  dotColor: string
  accentBar: string
}> = {
  required: {
    label: '需檢討',
    icon: '🔴',
    headerBg: 'bg-red-50',
    headerText: 'text-red-700',
    headerBorder: 'border-red-200',
    cardBg: 'bg-white',
    cardBorder: 'border-red-200',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-700',
    dotColor: 'bg-red-500',
    accentBar: 'bg-red-500',
  },
  manual_review: {
    label: '人工覆核',
    icon: '🟠',
    headerBg: 'bg-orange-50',
    headerText: 'text-orange-700',
    headerBorder: 'border-orange-200',
    cardBg: 'bg-white',
    cardBorder: 'border-orange-200',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-700',
    dotColor: 'bg-orange-500',
    accentBar: 'bg-orange-400',
  },
  conditional: {
    label: '條件觸發',
    icon: '🟡',
    headerBg: 'bg-yellow-50',
    headerText: 'text-yellow-700',
    headerBorder: 'border-yellow-200',
    cardBg: 'bg-white',
    cardBorder: 'border-yellow-200',
    badgeBg: 'bg-yellow-100',
    badgeText: 'text-yellow-700',
    dotColor: 'bg-yellow-500',
    accentBar: 'bg-yellow-400',
  },
  not_required: {
    label: '不需檢討',
    icon: '🟢',
    headerBg: 'bg-gray-50',
    headerText: 'text-gray-500',
    headerBorder: 'border-gray-200',
    cardBg: 'bg-white',
    cardBorder: 'border-gray-200',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-500',
    dotColor: 'bg-gray-300',
    accentBar: 'bg-gray-300',
  },
}

const CATEGORY_LABELS: Record<string, string> = {
  MOD_01: '分區管制', MOD_02: '都市設計', MOD_03: '特定區審議',
  MOD_04: '高層建築', MOD_05: '危老重建', MOD_06: '建築技術',
  MOD_07: '綠建築',   MOD_08: '宜居建築', MOD_09: '容積移轉',
  MOD_10: '開放空間', MOD_11: '停車',     MOD_12: '無障礙',
  MOD_13: '消防',     SZ_MRT: '捷運周邊', SZ_HSR: '高鐵特定區',
  SZ_HERITAGE: '文化資產', SZ_HILLSIDE: '山坡地', SZ_GEO: '地質敏感',
  MAN_FAR: '容積加總', MAN_HIGHRISE_SCHEDULE: '高層時程',
}

// ─── 單張卡片 ─────────────────────────────────────────────────

function ResultCard({
  result,
  isSelected,
  onClick,
}: {
  result: CheckResult
  isSelected: boolean
  onClick: () => void
}) {
  const cfg = STATUS_CONFIG[result.status]
  const category = CATEGORY_LABELS[result.moduleCode] ?? '其他'

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-xl border transition-all duration-150
        ${isSelected
          ? 'border-blue-400 shadow-md ring-2 ring-blue-200 bg-blue-50'
          : `${cfg.cardBorder} ${cfg.cardBg} hover:shadow-sm hover:border-blue-300`}
      `}
    >
      <div className="flex items-stretch">
        {/* Accent bar */}
        <div className={`w-1 rounded-l-xl shrink-0 ${isSelected ? 'bg-blue-500' : cfg.accentBar}`} />

        {/* Content */}
        <div className="flex-1 px-4 py-3.5 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
              }`}>
                <ModuleIcon code={result.moduleCode} size={16} />
              </div>
              <div className="min-w-0">
                <div className={`text-sm font-semibold truncate ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
                  {result.moduleName}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-gray-400 font-mono">{result.moduleCode}</span>
                  <span className="text-gray-300 text-xs">·</span>
                  <span className="text-xs text-gray-400">{category}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cfg.badgeBg} ${cfg.badgeText}`}>
                {cfg.label}
              </span>
              <span className="text-xs text-gray-400">P{result.priority}</span>
            </div>
          </div>

          {/* Trigger reason */}
          <p className={`text-xs mt-2.5 leading-relaxed line-clamp-2 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
            {result.triggerReason}
          </p>

          {/* Legal basis pills */}
          {result.legalBasis.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {result.legalBasis.slice(0, 2).map((b) => (
                <span key={b} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 truncate max-w-[200px]">
                  {b}
                </span>
              ))}
              {result.legalBasis.length > 2 && (
                <span className="text-xs text-gray-400">+{result.legalBasis.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── 狀態區塊 ─────────────────────────────────────────────────

type StatusOrder = 'required' | 'manual_review' | 'conditional' | 'not_required'
const STATUS_ORDER: StatusOrder[] = ['required', 'manual_review', 'conditional', 'not_required']

function StatusSection({
  status,
  results,
  selectedCode,
  onSelect,
}: {
  status: CheckStatus
  results: CheckResult[]
  selectedCode?: string
  onSelect: (r: CheckResult) => void
}) {
  if (results.length === 0) return null
  const cfg = STATUS_CONFIG[status]

  return (
    <div className="space-y-2">
      {/* Section header */}
      <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border ${cfg.headerBorder} ${cfg.headerBg}`}>
        <span className="text-base leading-none">{cfg.icon}</span>
        <span className={`text-sm font-bold ${cfg.headerText}`}>{cfg.label}</span>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${cfg.badgeBg} ${cfg.badgeText}`}>
          {results.length} 項
        </span>
      </div>

      {/* Cards */}
      <div className="space-y-2 pl-1">
        {results.map((r) => (
          <ResultCard
            key={r.moduleCode}
            result={r}
            isSelected={selectedCode === r.moduleCode}
            onClick={() => onSelect(r)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── 統計摘要列 ──────────────────────────────────────────────

function SummaryBar({ report }: { report: CheckReport }) {
  const total =
    report.required.length + report.conditional.length +
    report.manualReview.length + report.notRequired.length

  const stats = [
    { label: '需檢討',  count: report.required.length,     color: 'bg-red-500',    textColor: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200' },
    { label: '人工覆核', count: report.manualReview.length, color: 'bg-orange-500', textColor: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
    { label: '條件觸發', count: report.conditional.length,  color: 'bg-yellow-500', textColor: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    { label: '不需檢討', count: report.notRequired.length,  color: 'bg-gray-300',   textColor: 'text-gray-500',   bg: 'bg-gray-50',   border: 'border-gray-200' },
  ]

  return (
    <div className="sticky top-[57px] z-10 bg-white border-b border-gray-200 px-5 py-3">
      <div className="grid grid-cols-4 gap-2 mb-3">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-lg border ${s.border} ${s.bg} px-3 py-2 text-center`}>
            <div className={`text-xl font-bold ${s.textColor}`}>{s.count}</div>
            <div className={`text-xs mt-0.5 ${s.textColor} opacity-80`}>{s.label}</div>
          </div>
        ))}
      </div>
      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden flex">
        {stats.map((s) => s.count > 0 && (
          <div
            key={s.label}
            className={`${s.color} transition-all`}
            style={{ width: `${(s.count / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">共 {total} 項法規檢核</span>
        <span className="text-xs text-gray-400">{report.generatedAt}</span>
      </div>
    </div>
  )
}

// ─── 主元件 ───────────────────────────────────────────────────

export default function CheckResults({ report, selectedCode, onSelect }: Props) {
  return (
    <div className="flex flex-col bg-gray-50">
      {/* Panel header — sticky so it stays visible while column scrolls */}
      <div className="sticky top-0 z-10 px-5 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">法規檢核結果</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-blue-600 font-medium">{report.rulesetInfo.planAreaName}</span>
            {report.rulesetInfo.isIndependentUDReview ? (
              <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">獨立都審</span>
            ) : report.rulesetInfo.urbanDesignThresholdRequired > 0 ? (
              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                都審 ≥{report.rulesetInfo.urbanDesignThresholdRequired.toLocaleString()}㎡
              </span>
            ) : null}
            {report.rulesetInfo.specialZonesApplied.length > 0 && (
              <span className="text-xs text-gray-500">
                + {report.rulesetInfo.specialZonesApplied.join('、')}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <IconRefresh size={14} />
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <IconDownload size={14} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <SummaryBar report={report} />

      {/* Results — block layout
          Mobile: natural height + pb-24 clearance for tab bar
          Desktop: flex-1 overflow-y-auto for internal column scroll */}
      <div className="px-5 py-4 space-y-5 pb-24 md:pb-6">
        {STATUS_ORDER.map((status) => {
          const results =
            status === 'required' ? report.required
            : status === 'manual_review' ? report.manualReview
            : status === 'conditional' ? report.conditional
            : report.notRequired
          return (
            <StatusSection
              key={status}
              status={status}
              results={results}
              selectedCode={selectedCode}
              onSelect={onSelect ?? (() => {})}
            />
          )
        })}

        {/* Empty state */}
        {report.required.length === 0 && report.manualReview.length === 0 &&
          report.conditional.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-green-500 mb-3"><IconCheckCircle size={40} /></div>
            <div className="text-sm font-medium text-gray-600">無需強制檢討項目</div>
            <div className="text-xs text-gray-400 mt-1">本案依輸入條件判斷暫無強制法規檢討需求</div>
          </div>
        )}
      </div>
    </div>
  )
}
