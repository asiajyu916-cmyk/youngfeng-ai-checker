'use client'

import { useState, useEffect, useCallback } from 'react'
import { AUTH_USERS, AUTH_STORAGE_KEY } from '@/config/auth'

export interface AuthSession {
  username: string
  displayName: string
  role: string
  initials: string
  department?: string
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null)
  // true while reading localStorage on first mount (avoids flash)
  const [loading, setLoading] = useState(true)

  // Read persisted session once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY)
      if (raw) {
        const parsed: AuthSession = JSON.parse(raw)
        // Validate that the stored user still exists in config
        const still = AUTH_USERS.find((u) => u.username === parsed.username)
        if (still) setSession(parsed)
        else localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback((username: string, password: string): boolean => {
    const user = AUTH_USERS.find(
      (u) => u.username === username.trim() && u.password === password
    )
    if (!user) return false

    const s: AuthSession = {
      username:    user.username,
      displayName: user.displayName,
      role:        user.role,
      initials:    user.initials,
      department:  user.department,
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(s))
    setSession(s)
    return true
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setSession(null)
  }, [])

  return { session, loading, login, logout }
}
