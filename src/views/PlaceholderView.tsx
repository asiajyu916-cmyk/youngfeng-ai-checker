'use client'

import type { AppView } from '@/types'

const VIEW_LABELS: Record<AppView, string> = {
  dashboard: '儀表板',
  check: '法規檢核',
  cases: '案件管理',
  history: '歷史檢核紀錄',
  land_query: '地號查詢',
  zoning_rules: '建蔽容積查詢',
  resource_center: '建築資源中心',
  regulation_db: '法規資料庫',
  article_search: '條文檢索',
  related_laws: '相關法規',
  ai_rulings: '函釋案例',
  ai_assistant: 'AI 法規助理',
  version_mgmt: '法規版本管理',
  rule_engine: '規則引擎管理',
  user_mgmt: '使用者管理',
}

const VIEW_ICONS: Partial<Record<AppView, string>> = {
  cases: '📁',
  history: '🕐',
  regulation_db: '📚',
  article_search: '🔍',
  related_laws: '🔗',
  ai_rulings: '📋',
  version_mgmt: '🏷️',
  rule_engine: '⚙️',
  user_mgmt: '👥',
}

const VIEW_DESC: Partial<Record<AppView, string>> = {
  cases: '管理所有進行中與完成的建築法規檢核案件，追蹤案件狀態與時程',
  history: '查閱所有歷史檢核紀錄，支援條件篩選與匯出功能',
  regulation_db: '瀏覽台中市及全國建築法規資料庫，包含最新修正版本',
  article_search: '全文檢索法規條文，快速定位相關條款',
  related_laws: '法規關聯圖譜，查看法規間的引用與適用關係',
  ai_rulings: '彙整主管機關函釋、解釋函及裁判案例',
  version_mgmt: '管理法規版本更新紀錄，追蹤條文異動',
  rule_engine: '檢視與管理規則引擎觸發條件與模組設定',
  user_mgmt: '管理系統使用者帳號、權限與組織設定',
}

interface Props {
  view: AppView
}

export default function PlaceholderView({ view }: Props) {
  const label = VIEW_LABELS[view] ?? view
  const icon = VIEW_ICONS[view] ?? '🔧'
  const desc = VIEW_DESC[view] ?? '此功能正在開發中，即將於 V2.1 版本推出。'

  return (
    <div className="w-full md:flex-1 flex items-center justify-center bg-gray-50 py-20 pb-24 md:py-0 md:pb-0">
      <div className="text-center max-w-sm px-6">
        <div className="text-6xl mb-5">{icon}</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{label}</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">{desc}</p>
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs px-4 py-2 rounded-full font-medium">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          開發中 — V2.1 即將推出
        </div>
      </div>
    </div>
  )
}
