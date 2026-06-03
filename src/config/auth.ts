/**
 * ─── 登入帳號設定 ────────────────────────────────────────────
 * 正式環境請改用後端 API 驗證，勿將真實密碼硬編碼於前端。
 * 目前為前端 Mock 驗證，僅供內部示範用途。
 */

export interface AuthUser {
  username: string
  password: string
  displayName: string
  role: 'admin' | 'architect'
  initials: string
  department?: string
}

// ── 帳號清單 ── 修改此處以新增/修改/刪除使用者 ──────────────
export const AUTH_USERS: AuthUser[] = [
  {
    username:    'admin',
    password:    'yf2026',
    displayName: '系統管理員',
    role:        'admin',
    initials:    'AD',
    department:  '資訊管理部',
  },
  {
    username:    'lu',
    password:    'yf2026',
    displayName: '呂建築師',
    role:        'architect',
    initials:    '呂',
    department:  '建築設計部',
  },
  {
    username:    'li',
    password:    'yf2026',
    displayName: '李建築師',
    role:        'architect',
    initials:    '李',
    department:  '建築設計部',
  },
  {
    username:    'chen',
    password:    'yf2026',
    displayName: '陳建築師',
    role:        'architect',
    initials:    '陳',
    department:  '法規審查部',
  },
]

// localStorage key
export const AUTH_STORAGE_KEY = 'yf_auth_v1'
