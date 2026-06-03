'use client'

import type { AppView } from '@/types'
import { IconDashboard, IconMap, IconCheck, IconFolder, IconBot } from './icons'

interface Tab {
  id: AppView
  label: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
}

const TABS: Tab[] = [
  { id: 'dashboard',    label: '首頁',   Icon: IconDashboard },
  { id: 'land_query',   label: '地號',   Icon: IconMap },
  { id: 'check',        label: '檢核',   Icon: IconCheck },
  { id: 'cases',        label: '案件',   Icon: IconFolder },
  { id: 'ai_assistant', label: 'AI助理', Icon: IconBot },
]

interface Props {
  activeView: AppView
  onNavigate: (view: AppView) => void
}

export default function BottomTabBar({ activeView, onNavigate }: Props) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Fixed 64px height, font-size locked to prevent system scaling */}
      <div className="flex items-stretch h-16">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeView === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`
                relative flex-1 flex flex-col items-center justify-center gap-[3px]
                transition-colors active:bg-gray-50
                ${isActive ? 'text-blue-600' : 'text-gray-400'}
              `}
            >
              {/* Active indicator — top bar */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-blue-600 rounded-b-full" />
              )}
              {/* Icon: fixed 24px */}
              <Icon size={24} />
              {/* Label: locked 12px regardless of OS text size */}
              <span
                style={{ fontSize: '12px', lineHeight: '14px', fontWeight: isActive ? 600 : 400 }}
                className={isActive ? 'text-blue-600' : 'text-gray-400'}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
