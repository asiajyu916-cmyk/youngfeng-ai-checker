'use client'

import { useState, useCallback } from 'react'
import type { AppView, BuildingInput, CheckReport, CheckResult } from '@/types'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import InputForm from '@/components/InputForm'
import CheckResults from '@/components/CheckResults'
import CaseSummary from '@/components/CaseSummary'
import DetailPanel from '@/components/DetailPanel'
import AIAssistant from '@/components/AIAssistant'
import BottomTabBar from '@/components/BottomTabBar'
import BottomSheet from '@/components/BottomSheet'
import PWAManager from '@/components/PWAManager'
import LoginPage from '@/components/LoginPage'
import DashboardView from '@/views/DashboardView'
import LandQueryView from '@/views/LandQueryView'
import PlaceholderView from '@/views/PlaceholderView'
import { runCheck } from '@/lib/ruleEngine'
import { useAuth } from '@/hooks/useAuth'
import ResizablePanels from '@/components/ResizablePanels'

// ─── 常數 ─────────────────────────────────────────────────────

const DEFAULT_INPUT: BuildingInput = {
  district: '',
  planAreaId: '',
  specialZoneIds: [],
  zoneType: '',
  landArea: 0,
  buildingUse: '',
  buildingOwnership: 'private',
  floorsAbove: 0,
  floorsBelow: 0,
  heightM: 0,
  totalFloorArea: 0,
  residentialUnits: 0,
  isHazardRebuild: false,
  isFarTransfer: false,
  isOpenSpace: false,
}

const BREADCRUMBS: Partial<Record<AppView, string[]>> = {
  dashboard:      ['儀表板'],
  check:          ['檢核作業', '法規檢核'],
  cases:          ['檢核作業', '案件管理'],
  history:        ['檢核作業', '歷史檢核紀錄'],
  land_query:     ['檢核作業', '地號查詢'],
  regulation_db:  ['法規資料庫', '法規總覽'],
  article_search: ['法規資料庫', '條文檢索'],
  related_laws:   ['法規資料庫', '相關法規'],
  ai_rulings:     ['法規資料庫', '函釋案例'],
  ai_assistant:   ['AI 法規助理'],
  version_mgmt:   ['系統管理', '法規版本管理'],
  rule_engine:    ['系統管理', '規則引擎管理'],
  user_mgmt:      ['系統管理', '使用者管理'],
}

// ─── 三欄檢核版面（含 RWD） ────────────────────────────────────

interface CheckViewProps {
  initialInput?: Partial<BuildingInput>
  fromLandQuery?: boolean
  /** Called on mobile when a result card is tapped — opens BottomSheet */
  onMobileSelect?: (result: CheckResult) => void
}

function CheckView({ initialInput, fromLandQuery, onMobileSelect }: CheckViewProps) {
  const merged = { ...DEFAULT_INPUT, ...initialInput }
  const [input, setInput] = useState<BuildingInput>(merged)
  const [report, setReport] = useState<CheckReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<CheckResult | null>(null)
  // Mobile: which pane is visible ('form' | 'results')
  const [mobilePane, setMobilePane] = useState<'form' | 'results'>('form')

  const handleCheck = () => {
    setLoading(true)
    setSelected(null)
    setTimeout(() => {
      setReport(runCheck(input))
      setLoading(false)
      setMobilePane('results') // auto-switch to results on mobile after check
    }, 400)
  }

  const handleSelect = (result: CheckResult) => {
    setSelected(result)
    onMobileSelect?.(result) // open BottomSheet on mobile
  }

  const requiredCount = report?.required.length ?? 0

  // ── Shared panel content (reused by both mobile and desktop layouts) ──
  const leftContent = (
    <>
      {fromLandQuery && (
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
            <span className="text-blue-500 text-xs">📍</span>
            <div>
              <div className="text-xs font-bold text-blue-700">已從地號查詢帶入</div>
              <div className="text-xs text-blue-500">請補填建築資料後開始檢核</div>
            </div>
          </div>
        </div>
      )}
      <InputForm value={input} onChange={setInput} onSubmit={handleCheck} loading={loading} />
    </>
  )

  const middleContent = report ? (
    <>
      <CaseSummary report={report} />
      <CheckResults
        report={report}
        selectedCode={selected?.moduleCode}
        onSelect={handleSelect}
      />
    </>
  ) : (
    <EmptyResults loading={loading} hasPreFill={!!initialInput} />
  )

  const rightContent = <DetailPanel result={selected} />

  return (
    <div className="w-full flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden" style={{ height: '100%' }}>

      {/* ── Mobile tab switcher (hidden on desktop) ─────────────────────── */}
      <div className="md:hidden sticky top-0 z-10 flex shrink-0 bg-white border-b border-gray-200 shadow-sm">
        <button
          onClick={() => setMobilePane('form')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
            mobilePane === 'form'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-400 border-transparent'
          }`}
        >
          輸入資料
        </button>
        <button
          onClick={() => setMobilePane('results')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
            mobilePane === 'results'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-400 border-transparent'
          }`}
        >
          檢核結果
          {report && requiredCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs bg-red-500 text-white rounded-full font-bold">
              {requiredCount}
            </span>
          )}
          {report && requiredCount === 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs bg-green-500 text-white rounded-full font-bold">
              ✓
            </span>
          )}
        </button>
      </div>

      {/* ── Mobile stacked panes (hidden on desktop) ─────────────────────── */}
      <div className="md:hidden overflow-y-auto flex-1">
        <div className={mobilePane === 'form' ? 'block' : 'hidden'}>
          {leftContent}
          <div className="h-24" />
        </div>
        <div className={mobilePane === 'results' ? 'block' : 'hidden'}>
          {middleContent}
          <div className="h-24" />
        </div>
      </div>

      {/* ── Desktop: resizable 3-column panels (hidden on mobile) ────────── */}
      <div className="hidden md:block md:flex-1 md:min-h-0" style={{ height: '100%' }}>
        <ResizablePanels
          leftContent={leftContent}
          middleContent={middleContent}
          rightContent={rightContent}
        />
      </div>
    </div>
  )
}

function EmptyResults({ loading, hasPreFill }: { loading: boolean; hasPreFill?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-8 bg-gray-50 py-20 pb-24 md:flex-1 md:py-0 md:pb-0">
      {loading ? (
        <>
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <div className="text-sm font-semibold text-gray-500">AI 正在分析法規...</div>
          <div className="text-xs text-gray-400 mt-1">依台中市法規資料庫進行條件比對</div>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl mb-4">
            {hasPreFill ? '📍' : '📋'}
          </div>
          <div className="text-sm font-semibold text-gray-600">
            {hasPreFill ? '基地資料已帶入' : '填寫左側基地資料'}
          </div>
          <div className="text-xs text-gray-400 mt-1.5 leading-relaxed">
            {hasPreFill
              ? '請確認分區資料並補填建築資訊\n按下「開始檢核」系統將自動判斷適用法規'
              : '輸入行政區、建築用途、樓層數等資訊\n按下「開始檢核」系統將自動判斷 13 大法規模組'}
          </div>
          {!hasPreFill && (
            <div className="mt-5 flex flex-wrap gap-2 justify-center">
              {['土地使用分區管制', '都市設計審議', '高層建築物', '危老重建', '停車空間', '消防法規'].map((m) => (
                <span key={m} className="text-xs bg-white border border-gray-200 text-gray-500 px-2.5 py-1 rounded-lg">
                  {m}
                </span>
              ))}
              <span className="text-xs bg-white border border-gray-200 text-gray-400 px-2.5 py-1 rounded-lg">+7 項</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── 主頁面 ───────────────────────────────────────────────────

export default function Home() {
  const { session, loading: authLoading, login, logout } = useAuth()

  const [view, setView] = useState<AppView>('dashboard')
  const [pendingInput, setPendingInput] = useState<Partial<BuildingInput> | undefined>(undefined)
  const [fromLandQuery, setFromLandQuery] = useState(false)

  // Mobile: BottomSheet state for DetailPanel
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetResult, setSheetResult] = useState<CheckResult | null>(null)

  const handleApplyToCheck = useCallback((partial: Partial<BuildingInput>) => {
    setPendingInput(partial)
    setFromLandQuery(true)
    setView('check')
  }, [])

  const handleNavigate = useCallback((nextView: AppView) => {
    if (nextView !== 'check') {
      setFromLandQuery(false)
    }
    setSheetOpen(false)
    setView(nextView)
  }, [])

  const handleMobileSelect = useCallback((result: CheckResult) => {
    setSheetResult(result)
    setSheetOpen(true)
  }, [])

  const breadcrumb = BREADCRUMBS[view] ?? [view]

  const renderMain = () => {
    switch (view) {
      case 'dashboard':
        return <DashboardView onNavigate={handleNavigate} />

      case 'check':
        return (
          <CheckView
            key={fromLandQuery ? JSON.stringify(pendingInput) : 'default'}
            initialInput={fromLandQuery ? pendingInput : undefined}
            fromLandQuery={fromLandQuery}
            onMobileSelect={handleMobileSelect}
          />
        )

      case 'land_query':
        return <LandQueryView onApplyToCheck={handleApplyToCheck} />

      case 'ai_assistant':
        return <AIAssistant embedded />

      default:
        return <PlaceholderView view={view} />
    }
  }

  // ── Auth gate ─────────────────────────────────────────────────
  // Show nothing while reading localStorage (prevents flash)
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 to-blue-700">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  // Not logged in → show login page
  if (!session) {
    return <LoginPage onLogin={login} />
  }

  return (
    <div className="flex h-[100dvh] bg-gray-100 overflow-hidden">
      {/* Desktop sidebar — hidden on mobile via Sidebar's own classes */}
      <Sidebar
        activeView={view}
        onNavigate={handleNavigate}
        userName={session.displayName}
        userInitials={session.initials}
        userDepartment={session.department}
        onLogout={logout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          breadcrumb={breadcrumb}
          userName={session.displayName}
          userInitials={session.initials}
          userDepartment={session.department}
          onLogout={logout}
        />

        {/* Main content area
            Mobile : flex-1 + overflow-y-auto — full-page scroll
            Desktop: flex-1 flex min-h-0 overflow-hidden — height-constrained 3-column */}
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto md:overflow-hidden">
          {renderMain()}
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <BottomTabBar activeView={view} onNavigate={handleNavigate} />

      {/* PWA: service worker registration + install prompt */}
      <PWAManager />

      {/* Mobile bottom sheet for DetailPanel */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={sheetResult?.moduleName}
        heightVh={88}
      >
        <DetailPanel result={sheetResult} />
      </BottomSheet>
    </div>
  )
}
