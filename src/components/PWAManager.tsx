'use client'

import { useEffect, useState } from 'react'

// Extend the global Window interface for the install event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export default function PWAManager() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  useEffect(() => {
    // ── 1. Register service worker ─────────────────────────────
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => console.warn('[PWA] SW registration failed:', err))
    }

    // ── 2. Already running as installed PWA ───────────────────
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    ) {
      setIsInstalled(true)
      return
    }

    // ── 3. Check if previously dismissed ──────────────────────
    if (sessionStorage.getItem('pwa-dismissed')) {
      setIsDismissed(true)
      return
    }

    // ── 4. Android/Desktop: capture beforeinstallprompt ───────
    const handleInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handleInstallPrompt)

    // ── 5. Listen for successful install ──────────────────────
    const handleInstalled = () => setIsInstalled(true)
    window.addEventListener('appinstalled', handleInstalled)

    // ── 6. iOS: detect Safari (no beforeinstallprompt support) ─
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    if (isIOS && isSafari) {
      // Show iOS guide after a delay to not interrupt initial load
      const t = setTimeout(() => setShowIOSGuide(true), 3000)
      return () => clearTimeout(t)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    setInstallPrompt(null)
  }

  const handleDismiss = () => {
    sessionStorage.setItem('pwa-dismissed', '1')
    setIsDismissed(true)
    setInstallPrompt(null)
    setShowIOSGuide(false)
  }

  // Nothing to show
  if (isInstalled || isDismissed) return null
  if (!installPrompt && !showIOSGuide) return null

  return (
    /* Banner sits above the mobile tab bar (bottom-20) on mobile,
       and in the bottom-right corner on desktop (md:bottom-6 md:right-6) */
    <div className="fixed bottom-20 left-3 right-3 md:bottom-6 md:left-auto md:right-6 md:w-80 z-50 pointer-events-none">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">

        {/* ── Android / Desktop install prompt ── */}
        {installPrompt && (
          <div className="flex items-center gap-3 px-4 py-3">
            {/* Icon */}
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg">
              YF
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">加入手機主畫面</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">永豐 AI 法規檢核助手</p>
            </div>

            <button
              onClick={handleInstall}
              className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold px-3.5 py-2 rounded-xl shrink-0 transition-colors min-h-[40px]"
            >
              安裝
            </button>

            <button
              onClick={handleDismiss}
              aria-label="關閉"
              className="text-slate-500 hover:text-white transition-colors shrink-0 p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* ── iOS Safari: manual share guide ── */}
        {showIOSGuide && !installPrompt && (
          <div className="px-4 py-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 font-bold">
                  YF
                </div>
                <div>
                  <p className="font-semibold text-sm">加入主畫面</p>
                  <p className="text-xs text-slate-400">像 App 一樣使用</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                aria-label="關閉"
                className="text-slate-500 hover:text-white transition-colors p-1 shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <ol className="space-y-2">
              <li className="flex items-start gap-2.5 text-sm text-slate-300">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">1</span>
                <span>
                  點選底部工具列的{' '}
                  <span className="inline-flex items-center gap-0.5 bg-slate-700 px-1.5 py-0.5 rounded text-xs font-medium">
                    {/* iOS share icon */}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    分享
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-300">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">2</span>
                <span>
                  選擇{' '}
                  <span className="bg-slate-700 px-1.5 py-0.5 rounded text-xs font-medium">加入主畫面</span>
                </span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-300">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">3</span>
                <span>點選右上角「新增」即完成</span>
              </li>
            </ol>

            {/* Arrow pointing down toward the share button */}
            <div className="flex justify-center mt-3">
              <svg className="w-5 h-5 text-blue-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
