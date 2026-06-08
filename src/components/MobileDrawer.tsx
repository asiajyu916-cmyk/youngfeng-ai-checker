'use client'

import { useEffect } from 'react'
import type { AppView } from '@/types'

// ─── 導覽項目定義 ──────────────────────────────────────────────────────────

interface DrawerItem {
  id: AppView
  label: string
  emoji: string
  badge?: string
}

interface DrawerSection {
  title: string
  items: DrawerItem[]
}

const DRAWER_SECTIONS: DrawerSection[] = [
  {
    title: '建築工具',
    items: [
      { id: 'resource_center', label: '建築資源中心', emoji: '📚' },
      { id: 'h2_checklist',    label: 'H2 法規自主檢核表', emoji: '📋' },
    ],
  },
  {
    title: '法規查詢',
    items: [
      { id: 'regulation_db',  label: '法規資料庫',  emoji: '📖' },
      { id: 'article_search', label: '條文搜尋',    emoji: '🔍' },
      { id: 'related_laws',   label: '相關法規',    emoji: '🔗' },
      { id: 'ai_rulings',     label: '函釋案例',    emoji: '📝' },
    ],
  },
  {
    title: '記錄管理',
    items: [
      { id: 'history',      label: '歷史檢核紀錄', emoji: '📂' },
      { id: 'ai_assistant', label: 'AI 法規助理',  emoji: '🤖' },
    ],
  },
  {
    title: '系統',
    items: [
      { id: 'version_mgmt', label: '法規版本管理', emoji: '🏷️' },
      { id: 'user_mgmt',    label: '系統設定',     emoji: '⚙️' },
    ],
  },
]

// ─── 主元件 ────────────────────────────────────────────────────────────────

interface Props {
  isOpen: boolean
  activeView: AppView
  onClose: () => void
  onNavigate: (view: AppView) => void
}

export default function MobileDrawer({ isOpen, activeView, onClose, onNavigate }: Props) {

  // 開啟時鎖定背景捲動
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // ESC 關閉
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleNavigate = (view: AppView) => {
    onNavigate(view)
    onClose()
  }

  return (
    <>
      {/* ── 半透明遮罩 ────────────────────────────────────────── */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden
      />

      {/* ── 右側 Drawer 面板 ───────────────────────────────────── */}
      <div
        className={`md:hidden fixed top-0 right-0 bottom-0 z-50 w-72 bg-slate-900 flex flex-col shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        role="dialog"
        aria-modal="true"
        aria-label="主選單"
      >
        {/* ── Drawer 頂部 ─────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden shrink-0"
              style={{ background: '#0F2747' }}>
              <svg viewBox="0 0 48 48" width="28" height="28">
                <rect x="6" y="6" width="36" height="1.8" rx="0.9" fill="#D6A85A"/>
                <rect x="6" y="40.2" width="36" height="1.8" rx="0.9" fill="#D6A85A"/>
                <text x="3" y="38" fontFamily="Georgia, serif" fontSize="26" fontWeight="900" fill="#D6A85A">Y</text>
                <text x="24" y="38" fontFamily="Georgia, serif" fontSize="26" fontWeight="900" fill="white">F</text>
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">永豐 AI 助手</div>
              <div className="text-slate-500 text-[10px]">功能選單</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="關閉選單"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── 導覽項目（可捲動）─────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-3">
          {DRAWER_SECTIONS.map((section) => (
            <div key={section.title} className="mb-1">
              {/* 分組標題 */}
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-5 pt-3 pb-1.5">
                {section.title}
              </div>

              {/* 項目列表 */}
              <div className="px-3 space-y-0.5">
                {section.items.map(item => {
                  const isActive = activeView === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all
                        ${isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 active:bg-slate-700'}`}
                    >
                      <span className="text-base leading-none shrink-0 w-5 text-center">
                        {item.emoji}
                      </span>
                      <span className="text-sm font-medium flex-1 truncate">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0
                          ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Drawer 底部提示 ──────────────────────────────────── */}
        <div className="px-5 py-3 border-t border-slate-700/60 shrink-0">
          <p className="text-[10px] text-slate-600 leading-relaxed text-center">
            桌機版可使用左側選單存取全部功能
          </p>
        </div>
      </div>
    </>
  )
}
