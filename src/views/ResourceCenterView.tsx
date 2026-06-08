'use client'

import { useState } from 'react'

// ─── 資源資料 ─────────────────────────────────────────────────────────────

interface Resource {
  label: string
  url: string
  desc?: string
}

interface Category {
  id: string
  icon: string
  title: string
  subtitle: string
  color: string        // Tailwind bg class for icon box
  textColor: string    // Tailwind text class for icon
  borderColor: string  // Tailwind border class for card accent
  resources: Resource[]
}

const CATEGORIES: Category[] = [
  {
    id: 'site',
    icon: '🗺️',
    title: '基地資訊',
    subtitle: '土地使用分區、地籍、都市計畫',
    color: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    resources: [
      {
        label: '158 空間資訊網',
        url: 'https://lohas.taichung.gov.tw/webgis/',
        desc: '台中市多元圖層空間資訊查詢',
      },
      {
        label: 'LUZ 土地使用分區',
        url: 'https://luz.nlma.gov.tw/web/',
        desc: '全國土地使用分區查詢系統',
      },
      {
        label: '台中都市計畫查詢',
        url: 'https://www.ud.taichung.gov.tw/28928/29030/29058/2346379',
        desc: '台中市土地使用管制查詢',
      },
      {
        label: '地籍圖查詢',
        url: 'https://easymap.land.moi.gov.tw/W3/index',
        desc: '內政部地政司地籍圖資查詢',
      },
    ],
  },
  {
    id: 'geology',
    icon: '🏔️',
    title: '地質環境',
    subtitle: '液化、斷層、地質敏感區',
    color: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    resources: [
      {
        label: '土壤液化潛勢查詢',
        url: 'https://www.liquid.net.tw/',
        desc: '國家地震工程研究中心液化潛勢圖',
      },
      {
        label: '活動斷層查詢',
        url: 'https://fault.moeacgs.gov.tw/MgFault/',
        desc: '中央地質調查所活動斷層地理資訊',
      },
      {
        label: '地質敏感區查詢',
        url: 'https://egis.moeacgs.gov.tw/GServer/geoSensitive/index.aspx',
        desc: '地質法地質敏感區範圍查詢',
      },
      {
        label: '地下水補注區查詢',
        url: 'https://gweb.water.gov.tw/wrhygis/',
        desc: '水利署地下水資源地理資訊系統',
      },
    ],
  },
  {
    id: 'water',
    icon: '💧',
    title: '水保環境',
    subtitle: '水土保持、集水區、淹水潛勢',
    color: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    borderColor: 'border-cyan-200',
    resources: [
      {
        label: '水土保持資訊網',
        url: 'https://246.swcb.gov.tw/',
        desc: '農業部水土保持署查詢平台',
      },
      {
        label: '水庫集水區查詢',
        url: 'https://gis.wra.gov.tw/wra_gis/',
        desc: '水利署 GIS 集水區範圍查詢',
      },
      {
        label: '河川區域查詢',
        url: 'https://gis.wra.gov.tw/wra_gis/',
        desc: '河川區域線（洪泛區）地理資訊',
      },
      {
        label: '淹水潛勢查詢',
        url: 'https://dmap.soil.gov.tw/',
        desc: '農業部淹水潛勢圖台灣版',
      },
    ],
  },
  {
    id: 'culture',
    icon: '🏛️',
    title: '文化環境',
    subtitle: '文化資產、古蹟、遺址',
    color: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    resources: [
      {
        label: '文化資產查詢系統',
        url: 'https://nchdb.boch.gov.tw/',
        desc: '文化部文化資產局登錄資料庫',
      },
      {
        label: '古蹟指定查詢',
        url: 'https://nchdb.boch.gov.tw/assets/overview/historicSite/type/1',
        desc: '國定、直轄市、縣市定古蹟',
      },
      {
        label: '遺址查詢',
        url: 'https://nchdb.boch.gov.tw/assets/overview/archaeologicalSite',
        desc: '考古遺址分佈與保護範圍',
      },
    ],
  },
  {
    id: 'gov',
    icon: '🏢',
    title: '政府窗口',
    subtitle: '各主管機關官方入口',
    color: 'bg-slate-50',
    textColor: 'text-slate-600',
    borderColor: 'border-slate-200',
    resources: [
      {
        label: '台中市都市發展局',
        url: 'https://www.udl.taichung.gov.tw/',
        desc: '建築管理、都市計畫主管機關',
      },
      {
        label: '建管科查詢服務',
        url: 'https://www.udl.taichung.gov.tw/706357/706366/706374/706381/',
        desc: '建築許可、竣工查詢服務',
      },
      {
        label: '都市設計審議窗口',
        url: 'https://www.udl.taichung.gov.tw/706357/706366/706374/706382/',
        desc: '都市設計審議申請與進度',
      },
      {
        label: '台中市地政局',
        url: 'https://www.land.taichung.gov.tw/',
        desc: '地籍資料、土地謄本申請',
      },
      {
        label: '農業部水土保持署',
        url: 'https://www.swcb.gov.tw/',
        desc: '水土保持計畫申請規範',
      },
    ],
  },
]

// ─── 子元件 ───────────────────────────────────────────────────────────────

function ExternalIcon() {
  return (
    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
}

function ResourceCard({ cat }: { cat: Category }) {
  return (
    <div className={`bg-white rounded-2xl border ${cat.borderColor} shadow-sm overflow-hidden`}>
      {/* Card header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl ${cat.color} flex items-center justify-center text-lg shrink-0`}>
          {cat.icon}
        </div>
        <div>
          <div className="text-sm font-bold text-gray-800 leading-tight">{cat.title}</div>
          <div className="text-xs text-gray-400 mt-0.5">{cat.subtitle}</div>
        </div>
        <div className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${cat.color} ${cat.textColor}`}>
          {cat.resources.length} 項
        </div>
      </div>

      {/* Links */}
      <div className="divide-y divide-gray-50">
        {cat.resources.map((res) => (
          <a
            key={res.url}
            href={res.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors truncate">
                  {res.label}
                </span>
                <span className="text-gray-300 group-hover:text-blue-400 transition-colors shrink-0">
                  <ExternalIcon />
                </span>
              </div>
              {res.desc && (
                <div className="text-xs text-gray-400 mt-0.5 leading-relaxed truncate">
                  {res.desc}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

// ─── 主元件 ───────────────────────────────────────────────────────────────

export default function ResourceCenterView() {
  const [search, setSearch] = useState('')

  // 搜尋篩選（未來擴充：僅在此過濾資料）
  const filtered = CATEGORIES.map(cat => ({
    ...cat,
    resources: cat.resources.filter(r =>
      !search ||
      r.label.toLowerCase().includes(search.toLowerCase()) ||
      (r.desc ?? '').toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => !search || cat.resources.length > 0)

  const totalCount = CATEGORIES.reduce((s, c) => s + c.resources.length, 0)

  return (
    <div className="w-full md:flex-1 md:overflow-y-auto bg-gray-50 pb-24 md:pb-8">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8">

        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-gray-800">建築資源中心</h1>
            <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2.5 py-0.5 rounded-full">
              {totalCount} 項資源
            </span>
          </div>
          <p className="text-sm text-gray-500">
            集中建築前期規劃所需的政府查詢系統與外部資源，所有連結均以新分頁開啟。
          </p>
        </div>

        {/* Search bar（功能預留，搜尋已啟用）*/}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜尋資源名稱或說明..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* 搜尋無結果提示 */}
        {search && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-3xl mb-3">🔍</div>
            <div className="text-sm font-medium">找不到「{search}」的相關資源</div>
            <button
              onClick={() => setSearch('')}
              className="mt-3 text-xs text-blue-500 hover:underline"
            >
              清除搜尋
            </button>
          </div>
        )}

        {/* Card grid */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(cat => (
              <ResourceCard key={cat.id} cat={cat} />
            ))}
          </div>
        )}

        {/* Footer note */}
        <div className="mt-8 flex items-center gap-2 text-xs text-gray-400">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          所有連結均導向外部政府或學術機構網站，以新分頁開啟。如有連結失效，請通知系統管理員更新。
        </div>

      </div>
    </div>
  )
}
