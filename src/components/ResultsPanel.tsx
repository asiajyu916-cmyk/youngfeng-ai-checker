'use client'

import type { CheckReport, CheckResult, CheckStatus, RulesetInfo } from '@/types'

interface Props {
  report: CheckReport
}

const STATUS_CONFIG: Record<CheckStatus, {
  label: string; color: string; bg: string; border: string
  icon: string; badgeBg: string; badgeText: string
}> = {
  required:      { label: '需檢討',  color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',    icon: '🔴', badgeBg: 'bg-red-100',    badgeText: 'text-red-700'    },
  conditional:   { label: '條件觸發', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: '🟡', badgeBg: 'bg-yellow-100', badgeText: 'text-yellow-700' },
  manual_review: { label: '人工覆核', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: '⚠️', badgeBg: 'bg-orange-100', badgeText: 'text-orange-700' },
  not_required:  { label: '不需檢討', color: 'text-gray-500',   bg: 'bg-gray-50',   border: 'border-gray-200',   icon: '⬜', badgeBg: 'bg-gray-100',   badgeText: 'text-gray-500'   },
}

// ─── 適用規則集資訊區塊 ───────────────────────────────────────

function RulesetBadge({ info }: { info: RulesetInfo }) {
  const isWaterNan = info.planAreaId === 'water_nan'
  const isSeventhPhase = info.planAreaId === 'seventh_phase'
  const isUnitRedevelopment = info.planAreaId === 'unit_redevelopment'

  const badgeColor = isWaterNan
    ? 'bg-purple-600'
    : isSeventhPhase
    ? 'bg-emerald-600'
    : isUnitRedevelopment
    ? 'bg-teal-600'
    : 'bg-blue-600'

  return (
    <div className="rounded-xl overflow-hidden border border-blue-200 shadow-sm">
      {/* 規則集標題列 */}
      <div className={`${badgeColor} px-4 py-3 flex items-center justify-between`}>
        <div>
          <div className="text-white font-bold text-sm">本案適用規則集</div>
          <div className="text-white text-opacity-80 text-xs opacity-80 mt-0.5">
            {info.district}　▸　{info.planAreaName}
          </div>
        </div>
        <span className="text-xs bg-white bg-opacity-20 text-white px-2 py-1 rounded font-mono">
          {info.ruleVersion}
        </span>
      </div>

      {/* 規則集詳情 */}
      <div className="bg-blue-50 px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <div>
          <span className="text-blue-500">都審機制：</span>
          <strong className="text-blue-800">
            {info.isIndependentUDReview
              ? '獨立都審（全案均需）'
              : info.urbanDesignThresholdRequired === 0
              ? '全案需送審'
              : `${info.urbanDesignThresholdRequired.toLocaleString()}㎡ 起送審`}
          </strong>
        </div>
        <div>
          <span className="text-blue-500">審議機關：</span>
          <strong className="text-blue-800">{info.urbanDesignAuthority}</strong>
        </div>
        <div>
          <span className="text-blue-500">分區管制：</span>
          <strong className="text-blue-800">
            {info.appliesGeneralZoning ? '台中市一般分區管制' : '獨立計畫區管制'}
          </strong>
        </div>
        {info.specialZonesApplied.length > 0 && (
          <div className="col-span-2">
            <span className="text-blue-500">特殊管制區：</span>
            <strong className="text-blue-800">{info.specialZonesApplied.join('、')}</strong>
          </div>
        )}
      </div>

      {/* 水湳特別提示 */}
      {isWaterNan && (
        <div className="bg-purple-50 border-t border-purple-200 px-4 py-2 text-xs text-purple-700">
          ⚠️ 水湳園區採獨立審議機制，建蔽率容積率依特定區計畫書，勿套用一般台中市分區管制
        </div>
      )}

      {/* 七期特別提示 */}
      {isSeventhPhase && (
        <div className="bg-emerald-50 border-t border-emerald-200 px-4 py-2 text-xs text-emerald-700">
          ⚠️ 七期重劃區都審門檻較低（1,500㎡），建築外觀景觀管制嚴格，請符合七期都市設計準則
        </div>
      )}
    </div>
  )
}

// ─── 結果卡片 ─────────────────────────────────────────────────

function ResultCard({ result }: { result: CheckResult }) {
  const cfg = STATUS_CONFIG[result.status]
  return (
    <div className={`rounded-lg border ${cfg.border} ${cfg.bg} p-3.5`}>
      <div className="flex items-start gap-2">
        <span className="text-sm shrink-0 mt-0.5">{cfg.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-semibold text-sm ${cfg.color}`}>{result.moduleName}</span>
            <span className="text-xs text-gray-400 font-mono">{result.moduleCode}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${cfg.badgeBg} ${cfg.badgeText}`}>
              P{result.priority}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">{result.triggerReason}</p>

          {result.legalBasis.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {result.legalBasis.map((basis) => (
                <span key={basis} className="text-xs bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded">
                  {basis}
                </span>
              ))}
            </div>
          )}

          {result.notes && (
            <div className="mt-2 text-xs text-gray-600 bg-white bg-opacity-70 rounded px-2 py-1.5 border border-gray-200 leading-relaxed">
              <span className="font-semibold">注意：</span>{result.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── 分類區塊 ────────────────────────────────────────────────

function Section({ status, results }: { status: CheckStatus; results: CheckResult[] }) {
  const cfg = STATUS_CONFIG[status]
  if (results.length === 0) return null
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <span>{cfg.icon}</span>
        <h3 className={`font-semibold text-sm ${cfg.color}`}>{cfg.label}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badgeBg} ${cfg.badgeText}`}>
          {results.length} 項
        </span>
      </div>
      <div className="space-y-2">
        {results.map((r) => <ResultCard key={r.moduleCode} result={r} />)}
      </div>
    </div>
  )
}

// ─── 統計列 ───────────────────────────────────────────────────

function SummaryBar({ report }: { report: CheckReport }) {
  const stats: [CheckStatus, number, string][] = [
    ['required',      report.required.length,     '需檢討'],
    ['conditional',   report.conditional.length,   '條件觸發'],
    ['manual_review', report.manualReview.length,  '人工覆核'],
    ['not_required',  report.notRequired.length,   '不需檢討'],
  ]
  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map(([status, count, label]) => {
        const cfg = STATUS_CONFIG[status]
        return (
          <div key={status} className={`rounded-lg border ${cfg.border} ${cfg.bg} p-2.5 text-center`}>
            <div className={`text-xl font-bold ${cfg.color}`}>{count}</div>
            <div className={`text-xs mt-0.5 ${cfg.color} opacity-80`}>{label}</div>
          </div>
        )
      })}
    </div>
  )
}

// ─── 主元件 ───────────────────────────────────────────────────

export default function ResultsPanel({ report }: Props) {
  const s = report.inputSummary

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-5 py-4 flex items-start justify-between">
        <div>
          <h2 className="text-white font-semibold text-base">AI 法規檢核結果</h2>
          <p className="text-blue-200 text-xs mt-0.5">產出時間：{report.generatedAt}</p>
        </div>
        <span className="text-xs bg-blue-900 bg-opacity-50 text-blue-200 px-2 py-1 rounded shrink-0">
          永豐 V1.0
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* 適用規則集 */}
        <RulesetBadge info={report.rulesetInfo} />

        {/* 案件摘要 */}
        <div className="bg-gray-50 rounded-lg p-3.5 text-xs text-gray-600 border border-gray-100">
          <div className="font-semibold text-gray-700 mb-2">案件資料摘要</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span>行政區：<strong className="text-gray-800">{s.district || '—'}</strong></span>
            <span>使用分區：<strong className="text-gray-800">{s.zoneType || '—'}</strong></span>
            <span>建築用途：<strong className="text-gray-800">{s.buildingUse || '—'}</strong></span>
            <span>所有權：<strong className="text-gray-800">{s.buildingOwnership === 'public' ? '公有' : '私有'}</strong></span>
            <span>層數：<strong className="text-gray-800">{s.floorsAbove}F / 地下 {s.floorsBelow}B</strong></span>
            <span>高度：<strong className="text-gray-800">{s.heightM} m</strong></span>
            <span>基地面積：<strong className="text-gray-800">{s.landArea.toLocaleString()} ㎡</strong></span>
            <span>總樓地板：<strong className="text-gray-800">{s.totalFloorArea.toLocaleString()} ㎡</strong></span>
            {report.rulesetInfo.specialZonesApplied.length > 0 && (
              <span className="col-span-2">
                特殊管制區：
                <strong className="text-gray-800">
                  {report.rulesetInfo.specialZonesApplied.join(' / ')}
                </strong>
              </span>
            )}
          </div>
        </div>

        {/* 統計列 */}
        <SummaryBar report={report} />

        {/* 結果分類 */}
        <div className="space-y-5">
          <Section status="required"      results={report.required} />
          <Section status="conditional"   results={report.conditional} />
          <Section status="manual_review" results={report.manualReview} />
          <Section status="not_required"  results={report.notRequired} />
        </div>

        {/* 免責聲明 */}
        <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100 leading-relaxed">
          ⚡ 本結果由 AI 系統依輸入資料自動產生，僅供建築師事務所內部初步評估使用，不取代正式法規諮詢或主管機關認定。最終法規適用性請由建築師確認後簽認。
        </div>
      </div>
    </div>
  )
}
