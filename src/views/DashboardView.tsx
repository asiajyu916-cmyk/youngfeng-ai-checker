'use client'

import type { AppView } from '@/types'
import { DASHBOARD_STATS, REGULATION_UPDATES } from '@/data/dashboardMock'
import { IconCheck, IconFolder, IconWarning, IconRefresh, IconDoc } from '@/components/icons'

interface Props {
  onNavigate: (view: AppView) => void
}

const STATUS_STYLE: Record<string, { label: string; bg: string; text: string }> = {
  in_progress:    { label: '進行中',    bg: 'bg-blue-100',   text: 'text-blue-700'   },
  pending_review: { label: '待人工覆核', bg: 'bg-orange-100', text: 'text-orange-700' },
  completed:      { label: '已完成',    bg: 'bg-green-100',  text: 'text-green-700'  },
  approved:       { label: '已核准',    bg: 'bg-violet-100', text: 'text-violet-700' },
}

// ── KPI Card — vertical layout ─────────────────────────────────
function StatCard({
  label, value, sub, icon, color,
}: {
  label: string; value: number | string; sub?: string
  icon: React.ReactNode; color: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col items-start gap-2 min-h-[120px]">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-[32px] font-bold text-gray-800 leading-none">{value}</div>
        <div className="text-sm text-gray-600 mt-1 font-medium">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────
export default function DashboardView({ onNavigate }: Props) {
  const s = DASHBOARD_STATS

  return (
    <div className="w-full md:flex-1 md:overflow-y-auto overflow-x-hidden bg-gray-50 pb-24 md:pb-6">
      {/* Content wrapper — mobile max-width + centered */}
      <div className="w-full max-w-[430px] md:max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">

        {/* ── Hero Banner ───────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-2xl px-5 py-5 md:px-6 md:py-5">
          {/* Mobile: stacked; Desktop: row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-white text-lg md:text-xl font-bold leading-snug">
                永豐 AI 法規檢核助手
              </h1>
              <p className="text-blue-200 text-xs md:text-sm mt-1">
                台中市建築法規專家系統 V2.0 ・ {new Date().toLocaleDateString('zh-TW')}
              </p>
            </div>
            <button
              onClick={() => onNavigate('check')}
              className="
                bg-white text-blue-700 font-semibold text-sm
                px-5 py-3 rounded-xl
                hover:bg-blue-50 active:bg-blue-100
                transition-colors shadow-sm shrink-0
                min-h-[44px] w-full md:w-auto
              "
            >
              開始新檢核 →
            </button>
          </div>
        </div>

        {/* ── KPI Cards — 2×2 mobile, 4-col desktop ─────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            label="本月案件數"
            value={s.thisMonth.cases}
            sub="較上月 +2"
            icon={<IconFolder size={20} />}
            color="bg-blue-100 text-blue-700"
          />
          <StatCard
            label="檢核次數"
            value={s.thisMonth.checks}
            sub="本月執行"
            icon={<IconCheck size={20} />}
            color="bg-emerald-100 text-emerald-700"
          />
          <StatCard
            label="人工覆核數"
            value={s.thisMonth.manualReviews}
            sub="待確認項目"
            icon={<IconWarning size={20} />}
            color="bg-orange-100 text-orange-700"
          />
          <StatCard
            label="法規更新次數"
            value={s.thisMonth.regulationUpdates}
            sub="本月更新"
            icon={<IconRefresh size={20} />}
            color="bg-violet-100 text-violet-700"
          />
        </div>

        {/* ── Charts — stacked on mobile, 3-col on desktop ──────── */}
        <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-5">

          {/* Case status */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-4">案件狀態統計</h3>
            <div className="space-y-3">
              {s.caseStatus.map((cs) => {
                const total = s.caseStatus.reduce((a, b) => a + b.count, 0)
                return (
                  <div key={cs.status} className="flex items-center gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cs.color }}
                    />
                    <span className="text-sm text-gray-600 flex-1 leading-tight">{cs.label}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(cs.count / total) * 100}%`,
                            backgroundColor: cs.color,
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-700 w-4 text-right">
                        {cs.count}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top triggers — spans 2 cols on desktop */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-4">最常觸發法規模組</h3>
            <div className="space-y-2.5">
              {s.topTriggers.slice(0, 6).map((t) => (
                <div key={t.moduleCode} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-400 w-16 shrink-0">
                    {t.moduleCode}
                  </span>
                  <span className="text-xs text-gray-700 flex-1 truncate">{t.moduleName}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${t.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{t.count}次</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent cases + Regulation updates — stacked/2-col ─── */}
        <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-5">

          {/* Recent cases */}
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-700">最近案件</h3>
              <button
                onClick={() => onNavigate('cases')}
                className="text-xs text-blue-600 hover:underline"
              >
                查看全部 →
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {s.recentCases.map((c) => {
                const st = STATUS_STYLE[c.status]
                return (
                  <div key={c.id} className="flex items-start gap-3 px-5 py-3.5">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{c.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5 truncate">
                        {c.district}・{c.buildingUse}・{c.checkedAt}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs text-red-600 font-bold">{c.requiredCount}</span>
                      <span className="text-gray-300 text-xs">/</span>
                      <span className="text-xs text-orange-500 font-bold">{c.manualReviewCount}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.bg} ${st.text}`}>
                        {st.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Regulation updates */}
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-700">法規更新通知</h3>
              <button
                onClick={() => onNavigate('version_mgmt')}
                className="text-xs text-blue-600 hover:underline"
              >
                版本管理 →
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {REGULATION_UPDATES.map((ru) => (
                <div key={ru.id} className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      ru.severity === 'major' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      <IconDoc size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-800 leading-snug">
                          {ru.title}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-bold shrink-0 ${
                          ru.severity === 'major' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {ru.severity === 'major' ? '重要' : '一般'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{ru.summary}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-gray-400">{ru.date}</span>
                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          {ru.module}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <div className="text-xs font-semibold text-gray-500 mb-2">快捷操作</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onNavigate('check')}
                  className="text-sm bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3 py-2.5 rounded-xl font-medium transition-colors min-h-[44px]"
                >
                  ＋ 新增檢核
                </button>
                <button
                  onClick={() => onNavigate('land_query')}
                  className="text-sm bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-700 border border-gray-200 px-3 py-2.5 rounded-xl font-medium transition-colors min-h-[44px]"
                >
                  🔍 地號查詢
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-gray-400 bg-white rounded-xl border border-gray-100 px-5 py-3 leading-relaxed">
          ⚡ 本系統由 AI 自動產生檢核結果，統計資料為 Mock 示範數據。正式版將串接台中市建築法規資料庫及地政局地籍查詢系統。所有法規適用性請由建築師確認後簽認。
        </div>

      </div>
    </div>
  )
}
