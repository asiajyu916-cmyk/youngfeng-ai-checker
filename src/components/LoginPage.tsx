'use client'

import { useState, useRef } from 'react'

interface Props {
  onLogin: (username: string, password: string) => boolean
}

export default function LoginPage({ onLogin }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const passwordRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      setError('請輸入帳號與密碼')
      return
    }
    setLoading(true)
    setError('')

    // Short delay for UX (simulates async auth)
    await new Promise((r) => setTimeout(r, 600))

    const ok = onLogin(username, password)
    if (!ok) {
      setError('帳號或密碼錯誤，請重新輸入')
      setPassword('')
      passwordRef.current?.focus()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center overflow-x-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 px-4 py-8">

      {/* Background decoration — hidden on tiny screens */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-[400px]">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/50 mb-4">
            <span className="text-white text-3xl font-bold select-none">永</span>
          </div>
          <h1 className="text-white text-xl font-bold tracking-tight">
            永豐 AI 法規檢核助手
          </h1>
          <p className="text-blue-300 text-sm mt-1">台中市建築法規專家系統 V2.0</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-950/50 overflow-hidden">

          {/* Card header */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-100">
            <h2 className="text-gray-800 text-lg font-bold">員工登入</h2>
            <p className="text-gray-500 text-sm mt-0.5">請使用您的內部帳號登入系統</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                帳號
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && passwordRef.current?.focus()}
                  placeholder="請輸入帳號"
                  className="
                    w-full pl-10 pr-4 py-3 text-sm
                    border border-gray-200 rounded-xl
                    bg-gray-50 text-gray-800 placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition min-h-[48px]
                  "
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                密碼
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  id="password"
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  placeholder="請輸入密碼"
                  className="
                    w-full pl-10 pr-12 py-3 text-sm
                    border border-gray-200 rounded-xl
                    bg-gray-50 text-gray-800 placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition min-h-[48px]
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                disabled:opacity-70 disabled:cursor-not-allowed
                text-white font-semibold text-base
                py-3.5 rounded-xl
                transition-colors shadow-sm shadow-blue-200
                flex items-center justify-center gap-2
                min-h-[52px]
              "
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  驗證中…
                </>
              ) : (
                <>
                  登入系統
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Hint */}
          <div className="px-8 pb-7">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5">
              <p className="text-xs font-semibold text-blue-700 mb-2">示範帳號</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { name: '呂建築師', user: 'lu' },
                  { name: '李建築師', user: 'li' },
                  { name: '陳建築師', user: 'chen' },
                  { name: '系統管理員', user: 'admin' },
                ].map((u) => (
                  <button
                    key={u.user}
                    type="button"
                    onClick={() => { setUsername(u.user); setPassword('yf2026'); setError('') }}
                    className="text-left text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <span className="font-semibold">{u.name}</span>
                    <span className="text-blue-400 ml-1">({u.user})</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-blue-400 mt-2">共用密碼：yf2026</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-blue-300 text-xs">
            © 2026 永豐建築師事務所・台中市建築法規 AI 系統
          </p>
          <p className="text-blue-400/60 text-xs">
            如有登入問題，請聯繫系統管理員
          </p>
        </div>
      </div>
    </div>
  )
}
