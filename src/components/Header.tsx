'use client'

import { useState } from 'react'
import { IconBell, IconSearch, IconChevronRight } from './icons'

interface Props {
  breadcrumb?: string[]
  userName?: string
  userInitials?: string
  userDepartment?: string
  onLogout?: () => void
  onMenuOpen?: () => void
}

export default function Header({
  breadcrumb = ['法規檢核'],
  userName,
  userInitials = 'YF',
  userDepartment,
  onLogout,
  onMenuOpen,
}: Props) {
  const [showMenu, setShowMenu] = useState(false)
  const pageTitle = breadcrumb[breadcrumb.length - 1] ?? '永豐AI'

  return (
    <header className="bg-white border-b border-gray-200 shrink-0 relative">

      {/* ── Desktop header (md+) ───────────────────────────────── */}
      <div className="hidden md:flex h-12 items-center justify-between px-5">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm">
          <span className="text-gray-400">永豐 AI</span>
          {breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className="text-gray-300"><IconChevronRight size={12} /></span>
              <span className={i === breadcrumb.length - 1 ? 'text-gray-800 font-medium' : 'text-gray-400'}>
                {crumb}
              </span>
            </span>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <IconSearch size={15} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors relative">
            <IconBell size={15} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
          </button>

          {/* User avatar + dropdown */}
          <div className="relative ml-1">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold select-none">
                {userInitials}
              </div>
              {userName && (
                <span className="text-sm text-gray-700 font-medium max-w-[80px] truncate">
                  {userName}
                </span>
              )}
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-20">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{userName ?? '使用者'}</p>
                    {userDepartment && (
                      <p className="text-xs text-gray-400 mt-0.5">{userDepartment}</p>
                    )}
                  </div>
                  {/* Logout */}
                  <button
                    onClick={() => { setShowMenu(false); onLogout?.() }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    登出系統
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile header (<md) ────────────────────────────────── */}
      <div className="md:hidden flex h-14 items-center justify-between px-4">
        {/* Logo + page title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden" style={{ background: '#0F2747' }}>
            <svg viewBox="0 0 48 48" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="6" width="36" height="1.8" rx="0.9" fill="#D6A85A"/>
              <rect x="6" y="40.2" width="36" height="1.8" rx="0.9" fill="#D6A85A"/>
              <text x="3" y="38" fontFamily="Georgia, serif" fontSize="26" fontWeight="900" fill="#D6A85A">Y</text>
              <text x="24" y="38" fontFamily="Georgia, serif" fontSize="26" fontWeight="900" fill="white">F</text>
            </svg>
          </div>
          <span className="font-semibold text-gray-800 text-base truncate max-w-[140px]">
            {pageTitle}
          </span>
        </div>

        {/* Right: bell + hamburger + avatar */}
        <div className="flex items-center gap-1">
          <button className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 transition-colors relative">
            <IconBell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-white" />
          </button>

          {/* ☰ Hamburger — 僅手機顯示 */}
          {onMenuOpen && (
            <button
              onClick={onMenuOpen}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              aria-label="開啟選單"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* Mobile user menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold select-none"
            >
              {userInitials}
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-20">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{userName ?? '使用者'}</p>
                    {userDepartment && (
                      <p className="text-xs text-gray-400 mt-0.5">{userDepartment}</p>
                    )}
                  </div>
                  <button
                    onClick={() => { setShowMenu(false); onLogout?.() }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    登出系統
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
