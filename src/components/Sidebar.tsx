'use client'

import { useState } from 'react'
import type { AppView } from '@/types'
import {
  IconDashboard, IconCheck, IconFolder, IconHistory, IconBookmark,
  IconBook, IconSearch, IconLink, IconDoc, IconSettings,
  IconUsers, IconShield, IconBot, IconChevronRight, IconChevronDown,
  IconMap, IconStar,
} from './icons'

// ─── 外部連結 icon（內聯，不需額外 icon 元件）────────────────────────
function IconExternal({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
}

// ─── NavItem 型別 ─────────────────────────────────────────────────────
// id    → 內部頁面導覽（button）
// href  → 外部連結（<a target="_blank">）
// divider → 小分組標籤（非可點擊，僅供視覺分組）

interface NavItem {
  id?: AppView
  href?: string
  label: string
  icon?: React.ReactNode
  badge?: string
  divider?: boolean
}

interface NavSection {
  title?: string
  items: NavItem[]
}

interface Props {
  activeView: AppView
  onNavigate: (view: AppView) => void
  userName?: string
  userInitials?: string
  userDepartment?: string
  onLogout?: () => void
}

// ─── 導覽結構 ─────────────────────────────────────────────────────────
const SECTIONS: NavSection[] = [
  {
    items: [
      { id: 'dashboard', label: '儀表板', icon: <IconDashboard size={15} /> },
    ],
  },
  {
    title: '檢核作業',
    items: [
      { id: 'check',        label: '法規檢核',    icon: <IconCheck size={15} />, badge: 'V2' },
      { id: 'cases',        label: '案件管理',    icon: <IconFolder size={15} /> },
      { id: 'history',      label: '歷史檢核紀錄', icon: <IconHistory size={15} /> },
      { id: 'land_query',   label: '地號查詢',    icon: <IconMap size={15} />, badge: 'NEW' },
      { id: 'zoning_rules', label: '建蔽容積查詢', icon: <IconBook size={15} /> },
      // ── 外部基地查詢 ──
      { divider: true, label: '外部基地查詢' },
      {
        href:  'https://lohas.taichung.gov.tw/webgis/',
        label: '158 空間資訊網',
        icon:  <IconMap size={14} />,
      },
      {
        href:  'https://luz.nlma.gov.tw/web/',
        label: 'LUZ 土地使用分區',
        icon:  <IconLink size={14} />,
      },
    ],
  },
  {
    title: '建築資源中心',
    items: [
      { id: 'resource_center', label: '建築資源中心', icon: <IconMap size={15} />, badge: 'NEW' },
    ],
  },
  {
    title: '法規資料庫',
    items: [
      { id: 'regulation_db',  label: '法規資料庫', icon: <IconBook size={15} /> },
      { id: 'article_search', label: '條文檢索',   icon: <IconSearch size={15} /> },
      { id: 'related_laws',   label: '相關法規',   icon: <IconLink size={15} /> },
      { id: 'ai_rulings',     label: '函釋案例',   icon: <IconDoc size={15} /> },
      // ── 外部法規查詢 ──
      { divider: true, label: '外部法規查詢' },
      {
        href:  'https://www.ud.taichung.gov.tw/28928/29030/29058/2346379',
        label: '台中市土管查詢',
        icon:  <IconDoc size={14} />,
      },
      {
        href:  'https://arch-people.com/laws/',
        label: '建築人法規查詢',
        icon:  <IconSearch size={14} />,
      },
    ],
  },
  {
    title: '系統管理',
    items: [
      { id: 'version_mgmt', label: '法規版本管理', icon: <IconBookmark size={15} /> },
      { id: 'rule_engine',  label: '規則引擎管理', icon: <IconStar size={15} /> },
      { id: 'user_mgmt',    label: '使用者管理',   icon: <IconUsers size={15} /> },
    ],
  },
]

// ─── Sidebar 元件 ─────────────────────────────────────────────────────
export default function Sidebar({
  activeView,
  onNavigate,
  userName,
  userInitials = 'YF',
  userDepartment,
  onLogout,
}: Props) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`
      hidden md:flex flex-col
      ${collapsed ? 'w-14' : 'w-56'}
      shrink-0 bg-slate-900 h-screen sticky top-0 transition-all duration-200
    `}>
      {/* Logo */}
      <div className="px-3 py-4 border-b border-slate-700/60 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm overflow-hidden" style={{ background: '#0F2747', border: '1px solid #D6A85A33' }}>
          <svg viewBox="0 0 48 48" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="6" width="36" height="1.8" rx="0.9" fill="#D6A85A"/>
            <rect x="6" y="40.2" width="36" height="1.8" rx="0.9" fill="#D6A85A"/>
            <text x="3" y="38" fontFamily="Georgia, serif" fontSize="26" fontWeight="900" fill="#D6A85A">Y</text>
            <text x="24" y="38" fontFamily="Georgia, serif" fontSize="26" fontWeight="900" fill="white">F</text>
          </svg>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-white font-bold text-sm leading-tight truncate">永豐 AI 助手</div>
            <div className="text-slate-500 text-xs">Taichung Building Regulation AI</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-slate-500 hover:text-slate-300 transition-colors shrink-0"
        >
          {collapsed ? <IconChevronRight size={14} /> : <IconChevronDown size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-4">
        {SECTIONS.map((section, si) => (
          <div key={si}>
            {section.title && !collapsed && (
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 px-4">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5 px-2">
              {section.items.map((item, ii) => {

                // ── 小分組標籤（divider）────────────────────────────
                if (item.divider) {
                  return collapsed ? null : (
                    <div
                      key={`divider-${si}-${ii}`}
                      className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-2.5 pt-3 pb-0.5"
                    >
                      {item.label}
                    </div>
                  )
                }

                // ── 外部連結（<a>）──────────────────────────────────
                if (item.href) {
                  return (
                    <a
                      key={`ext-${si}-${ii}`}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={collapsed ? item.label : undefined}
                      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-all text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                    >
                      <span className="shrink-0 text-slate-600">{item.icon}</span>
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate text-xs font-medium">{item.label}</span>
                          <span className="shrink-0 text-slate-700">
                            <IconExternal size={10} />
                          </span>
                        </>
                      )}
                    </a>
                  )
                }

                // ── 內部導覽（button）──────────────────────────────
                const isActive = activeView === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => item.id && onNavigate(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`
                      w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all text-sm
                      ${isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
                    `}
                  >
                    <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate font-medium">{item.label}</span>
                        {item.badge && (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-bold shrink-0 ${
                            isActive
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-700 text-slate-400'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* AI Assistant button */}
      <div className="p-2 border-t border-slate-700/60">
        <button
          onClick={() => onNavigate('ai_assistant')}
          className={`
            w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all
            ${activeView === 'ai_assistant'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}
          `}
          title={collapsed ? 'AI 法規助理' : undefined}
        >
          <span className={`shrink-0 ${activeView === 'ai_assistant' ? 'text-white' : 'text-blue-400'}`}>
            <IconBot size={15} />
          </span>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-semibold truncate">AI 法規助理</div>
                <div className="text-xs opacity-60 truncate">隨時可諮詢</div>
              </div>
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full shrink-0 animate-pulse" />
            </>
          )}
        </button>

        {!collapsed && (
          <div className="flex items-center gap-2 mt-2 px-1.5">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 select-none">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-slate-300 text-xs font-medium truncate">{userName ?? '永豐建築師事務所'}</div>
              <div className="text-slate-500 text-xs truncate">{userDepartment ?? 'V2.0'}</div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                title="登出"
                className="shrink-0 text-slate-500 hover:text-red-400 transition-colors p-0.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
