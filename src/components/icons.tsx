// Centralised inline-SVG icon set — all 24×24 viewBox, stroke-based

interface IconProps {
  className?: string
  size?: number
}

function cls({ className, size }: IconProps): string {
  if (size) return `shrink-0`  // inline style will set dimensions
  return className ?? 'w-4 h-4'
}

function sizeStyle(size?: number): React.CSSProperties | undefined {
  return size ? { width: size, height: size } : undefined
}

export function IconDashboard(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="2" />
    </svg>
  )
}

export function IconCheck(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

export function IconFolder(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  )
}

export function IconHistory(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

export function IconBookmark(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  )
}

export function IconBook(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

export function IconSearch(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

export function IconLink(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  )
}

export function IconDoc(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

export function IconSettings(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

export function IconUsers(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

export function IconShield(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}

export function IconBell(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}

export function IconHelp(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

export function IconDownload(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )
}

export function IconRefresh(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}

export function IconSave(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  )
}

export function IconUpload(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  )
}

export function IconChevronRight(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  )
}

export function IconChevronDown(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export function IconX(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export function IconBot(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="8" width="18" height="12" rx="2" strokeWidth="2"/>
      <path strokeWidth="2" d="M12 8V4M8 4h8"/>
      <circle cx="9" cy="14" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="15" cy="14" r="1.5" fill="currentColor" stroke="none"/>
      <path strokeLinecap="round" strokeWidth="2" d="M9 17.5h6"/>
    </svg>
  )
}

// ─── Module-specific icons ────────────────────────────────────

export function IconBuilding(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
}

export function IconMap(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  )
}

export function IconFire(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  )
}

export function IconLeaf(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3s6 0 9 3 4 8 2 13c-4-1-8-3-10-7S5 3 5 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3l7 10" />
    </svg>
  )
}

export function IconAccessibility(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="5" r="1.5" strokeWidth="2"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9h12M12 9v5m0 0l-3 5m3-5l3 5" />
    </svg>
  )
}

export function IconCar(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 17H3v-6l2-4h14l2 4v6h-2M5 17a2 2 0 104 0m6 0a2 2 0 104 0" />
    </svg>
  )
}

export function IconWarning(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

export function IconCheckCircle(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

export function IconInfo(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

export function IconStar(p: IconProps) {
  return (
    <svg className={cls(p)} style={sizeStyle(p.size)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  )
}

// Module code → icon mapping
export function ModuleIcon({ code, className, size }: { code: string; className?: string; size?: number }) {
  const p = { className, size }
  switch (code) {
    case 'MOD_01': return <IconMap {...p} />
    case 'MOD_02': return <IconBuilding {...p} />
    case 'MOD_03': return <IconStar {...p} />
    case 'MOD_04': return <IconBuilding {...p} />
    case 'MOD_05': return <IconWarning {...p} />
    case 'MOD_06': return <IconDoc {...p} />
    case 'MOD_07': return <IconLeaf {...p} />
    case 'MOD_08': return <IconCheckCircle {...p} />
    case 'MOD_09': return <IconLink {...p} />
    case 'MOD_10': return <IconMap {...p} />
    case 'MOD_11': return <IconCar {...p} />
    case 'MOD_12': return <IconAccessibility {...p} />
    case 'MOD_13': return <IconFire {...p} />
    case 'SZ_MRT': return <IconBuilding {...p} />
    case 'SZ_HSR': return <IconBuilding {...p} />
    case 'SZ_HERITAGE': return <IconBookmark {...p} />
    case 'SZ_HILLSIDE': return <IconWarning {...p} />
    case 'SZ_GEO':   return <IconWarning {...p} />
    case 'MAN_FAR':  return <IconInfo {...p} />
    case 'MAN_HIGHRISE_SCHEDULE': return <IconHistory {...p} />
    default:         return <IconDoc {...p} />
  }
}
