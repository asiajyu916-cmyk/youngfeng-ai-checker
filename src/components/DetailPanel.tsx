'use client'

import { useState } from 'react'
import type { CheckResult } from '@/types'
import { getModuleDetail } from '@/data/moduleDetails'
import {
  ModuleIcon, IconDoc, IconCheckCircle, IconWarning, IconInfo,
  IconDownload, IconSave, IconBook, IconLink, IconStar, IconHistory,
} from './icons'

interface Props {
  result: CheckResult | null
}

// ─── 狀態設定 ─────────────────────────────────────────────────

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string; border: string }> = {
  required:      { label: '需檢討',  color: 'text-red-700',    bg: 'bg-red-100',    border: 'border-red-300' },
  conditional:   { label: '條件觸發', color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-300' },
  manual_review: { label: '人工覆核', color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-300' },
  not_required:  { label: '不需檢討', color: 'text-gray-500',   bg: 'bg-gray-100',   border: 'border-gray-300' },
}

// ─── Tab 定義 ─────────────────────────────────────────────────

type Tab = 'overview' | 'articles' | 'cases' | 'rulings'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',  label: '概要',   icon: <IconInfo size={13} /> },
  { id: 'articles',  label: '條文',   icon: <IconBook size={13} /> },
  { id: 'cases',     label: '案例',   icon: <IconHistory size={13} /> },
  { id: 'rulings',   label: '函釋',   icon: <IconDoc size={13} /> },
]

// ─── 子元件 ───────────────────────────────────────────────────

function SectionBox({ icon, title, children, accent }: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  accent?: 'red' | 'blue' | 'green' | 'orange'
}) {
  const accentStyles = {
    red:    'border-red-200 bg-red-50',
    blue:   'border-blue-200 bg-blue-50',
    green:  'border-green-200 bg-green-50',
    orange: 'border-orange-200 bg-orange-50',
  }
  const headerStyles = {
    red:    'bg-red-100 text-red-700',
    blue:   'bg-blue-100 text-blue-700',
    green:  'bg-green-100 text-green-700',
    orange: 'bg-orange-100 text-orange-700',
  }
  return (
    <div className={`rounded-xl border overflow-hidden ${accent ? accentStyles[accent] : 'border-gray-200 bg-white'}`}>
      <div className={`flex items-center gap-2 px-3 py-2 border-b ${accent ? `${headerStyles[accent]} border-current border-opacity-20` : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
        <span className="shrink-0">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
      </div>
      <div className="px-3 py-3">{children}</div>
    </div>
  )
}

function BulletList({ items, color = 'text-gray-700' }: { items: string[]; color?: string }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 shrink-0 opacity-40" />
          <span className={`text-xs leading-relaxed ${color}`}>{item}</span>
        </li>
      ))}
    </ul>
  )
}

// ─── 空狀態 ───────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-300 mb-4">
        <IconDoc size={28} />
      </div>
      <div className="text-sm font-semibold text-gray-400">選擇項目查看詳情</div>
      <div className="text-xs text-gray-300 mt-1.5 leading-relaxed">
        點擊左側任一法規項目<br/>即可查看條文摘要、案例與函釋
      </div>
    </div>
  )
}

// ─── Tab 內容 ─────────────────────────────────────────────────

function OverviewTab({ result }: { result: CheckResult }) {
  const detail = getModuleDetail(result.moduleCode)

  return (
    <div className="space-y-3">
      {/* Overview */}
      {detail?.overview && (
        <SectionBox icon={<IconInfo size={13} />} title="模組概述" accent="blue">
          <p className="text-xs text-blue-800 leading-relaxed">{detail.overview}</p>
        </SectionBox>
      )}

      {/* Trigger reason */}
      <SectionBox icon={<IconWarning size={13} />} title="觸發原因">
        <p className="text-sm text-gray-700 leading-relaxed">{result.triggerReason}</p>
        {result.notes && (
          <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <p className="text-xs text-amber-800 leading-relaxed">
              <span className="font-bold">⚠️ 注意：</span>{result.notes}
            </p>
          </div>
        )}
      </SectionBox>

      {/* Check points */}
      {detail?.checkPoints && (
        <SectionBox icon={<IconCheckCircle size={13} />} title="檢核重點">
          <ol className="space-y-1.5">
            {detail.checkPoints.map((pt, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-xs leading-relaxed text-gray-700">{pt}</span>
              </li>
            ))}
          </ol>
        </SectionBox>
      )}

      {/* Common errors */}
      {detail?.commonErrors && detail.commonErrors.length > 0 && (
        <SectionBox icon={<IconWarning size={13} />} title="常見錯誤" accent="red">
          <BulletList items={detail.commonErrors} color="text-red-800" />
        </SectionBox>
      )}

      {/* Tips */}
      {detail?.tips && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
          <div className="flex items-start gap-2">
            <span className="text-green-600 shrink-0 mt-0.5"><IconStar size={13} /></span>
            <p className="text-xs text-green-800 leading-relaxed">
              <span className="font-bold">實務小提示：</span>{detail.tips}
            </p>
          </div>
        </div>
      )}

      {/* Related modules */}
      {detail?.relatedModules && detail.relatedModules.length > 0 && (
        <SectionBox icon={<IconLink size={13} />} title="需搭配檢討">
          <div className="flex flex-wrap gap-1.5">
            {detail.relatedModules.map((code) => (
              <span key={code} className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-1 rounded-lg font-mono font-medium">
                {code}
              </span>
            ))}
          </div>
        </SectionBox>
      )}
    </div>
  )
}

function ArticlesTab({ result }: { result: CheckResult }) {
  const detail = getModuleDetail(result.moduleCode)
  const clauses = detail?.articleClauses ?? []

  if (clauses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">暫無條文資料</div>
    )
  }

  return (
    <div className="space-y-3">
      {clauses.map((c, i) => (
        <div key={i} className="rounded-xl border border-blue-200 overflow-hidden">
          {/* Article header */}
          <div className="bg-blue-50 px-3 py-2 flex items-start justify-between gap-2 border-b border-blue-200">
            <div>
              <div className="text-xs font-bold text-blue-800">{c.law}</div>
              <div className="text-xs text-blue-600 mt-0.5">
                <span className="font-mono font-bold">{c.article}</span>
                {c.title && <span className="ml-1.5">{c.title}</span>}
              </div>
            </div>
          </div>
          {/* Article text */}
          <div className="px-3 py-3 bg-white">
            <p className="text-xs text-gray-700 leading-relaxed">{c.text}</p>
          </div>
        </div>
      ))}

      {/* All legal basis */}
      {result.legalBasis.length > 0 && (
        <SectionBox icon={<IconBook size={13} />} title="法源依據清單">
          <div className="flex flex-wrap gap-1.5">
            {result.legalBasis.map((b) => (
              <span key={b} className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2 py-1 rounded-lg font-medium">
                {b}
              </span>
            ))}
          </div>
        </SectionBox>
      )}
    </div>
  )
}

function CasesTab({ result }: { result: CheckResult }) {
  const detail = getModuleDetail(result.moduleCode)
  const cases = detail?.relatedCases ?? []

  if (cases.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-300 text-3xl mb-2">📂</div>
        <div className="text-sm text-gray-400">暫無相關案例</div>
        <div className="text-xs text-gray-300 mt-1">案例資料庫持續更新中</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {cases.map((c) => (
        <div key={c.id} className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-3 py-2.5 border-b border-gray-200">
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold text-sm text-gray-800">{c.title}</div>
              <div className="flex items-center gap-1 shrink-0">
                {c.district && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{c.district}</span>
                )}
                {c.year && (
                  <span className="text-xs text-gray-400">{c.year}</span>
                )}
              </div>
            </div>
          </div>
          <div className="px-3 py-3 space-y-2.5">
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-1">案件摘要</div>
              <p className="text-xs text-gray-700 leading-relaxed">{c.summary}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <div className="text-xs font-semibold text-green-700 mb-1">結果與教訓</div>
              <p className="text-xs text-green-800 leading-relaxed">{c.outcome}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function RulingsTab({ result }: { result: CheckResult }) {
  const detail = getModuleDetail(result.moduleCode)
  const rulings = detail?.rulings ?? []

  if (rulings.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-300 text-3xl mb-2">📋</div>
        <div className="text-sm text-gray-400">暫無函釋資料</div>
        <div className="text-xs text-gray-300 mt-1">函釋資料庫持續收錄中</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {rulings.map((r, i) => (
        <div key={i} className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-violet-50 px-3 py-2.5 border-b border-violet-200">
            <div className="text-xs font-mono font-bold text-violet-800">{r.ref}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-violet-600">{r.authority}</span>
              <span className="text-xs text-violet-400">{r.date}</span>
            </div>
          </div>
          <div className="px-3 py-3">
            <div className="text-xs font-semibold text-gray-500 mb-1.5">函釋要旨</div>
            <p className="text-xs text-gray-700 leading-relaxed">{r.summary}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── 主元件 ───────────────────────────────────────────────────

export default function DetailPanel({ result }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  if (!result) {
    return (
      <div className="h-full bg-white border-l border-gray-200 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 shrink-0">
          <h2 className="text-sm font-semibold text-gray-800">法規依據</h2>
          <p className="text-xs text-gray-400 mt-0.5">點選項目查看條文、案例與函釋</p>
        </div>
        <EmptyState />
      </div>
    )
  }

  const cfg = STATUS_LABEL[result.status] ?? STATUS_LABEL.not_required
  const detail = getModuleDetail(result.moduleCode)

  // Badge counts for tabs
  const articleCount = detail?.articleClauses.length ?? 0
  const caseCount = detail?.relatedCases.length ?? 0
  const rulingCount = detail?.rulings.length ?? 0

  return (
    <div className="h-full bg-white border-l border-gray-200 flex flex-col">
      {/* ── Header ─────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-200 shrink-0">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <ModuleIcon code={result.moduleCode} size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-gray-800">{result.moduleName}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border shrink-0 ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                {cfg.label}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs font-mono text-gray-400">{result.moduleCode}</span>
              {detail?.category && (
                <>
                  <span className="text-gray-300 text-xs">·</span>
                  <span className="text-xs text-blue-600 font-medium">{detail.category}</span>
                </>
              )}
              <span className="text-gray-300 text-xs">·</span>
              <span className="text-xs text-gray-400">P{result.priority}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mt-3 border border-gray-200 rounded-xl overflow-hidden">
          {TABS.map((tab) => {
            const count = tab.id === 'articles' ? articleCount
              : tab.id === 'cases' ? caseCount
              : tab.id === 'rulings' ? rulingCount
              : null
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-medium transition-colors
                  ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {count !== null && count > 0 && (
                  <span className={`text-xs rounded-full px-1 font-bold ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Tab content ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {activeTab === 'overview'  && <OverviewTab  result={result} />}
        {activeTab === 'articles'  && <ArticlesTab  result={result} />}
        {activeTab === 'cases'     && <CasesTab     result={result} />}
        {activeTab === 'rulings'   && <RulingsTab   result={result} />}
      </div>

      {/* ── Action buttons ───────────────────────────── */}
      <div className="px-4 py-3 border-t border-gray-200 flex gap-2 shrink-0">
        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors">
          <IconSave size={13} />
          儲存此項
        </button>
        <button className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-xl transition-colors">
          <IconDownload size={13} />
          匯出
        </button>
      </div>
    </div>
  )
}
