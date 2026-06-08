'use client'

import { useState, useMemo } from 'react'

// ─── 資料定義 ──────────────────────────────────────────────────────────────

type RegTag = '台中市' | '全國' | '民間平台'

interface RegResource {
  id: string
  name: string
  url: string
  desc: string
  tag: RegTag
  keywords?: string[]
}

interface RegCategory {
  id: string
  emoji: string
  title: string
  resources: RegResource[]
}

const REG_CATEGORIES: RegCategory[] = [
  {
    id: 'taichung',
    emoji: '🏛️',
    title: '台中市法規',
    resources: [
      {
        id: 'tc-01',
        name: '都市計畫法臺中市施行自治條例',
        url: 'https://law.taichung.gov.tw/LawContent.aspx?id=GL002020',
        desc: '台中市都市計畫法之施行細則與地方補充規定',
        tag: '台中市',
        keywords: ['都市計畫', '都計', '自治條例', '土地使用'],
      },
      {
        id: 'tc-02',
        name: '臺中市水湳機場原址整體開發區都市設計審議規範',
        url: 'https://law.taichung.gov.tw/LawContent.aspx?id=GL003371',
        desc: '水湳智慧城區都市設計審議標準及規範文件',
        tag: '台中市',
        keywords: ['水湳', '機場', '都審', '都市設計', '智慧城'],
      },
      {
        id: 'tc-03',
        name: '臺中市鼓勵宜居建築設施設置及回饋辦法',
        url: 'https://law.taichung.gov.tw/LawContent.aspx?id=GL003620',
        desc: '台中市宜居建築容積獎勵與設施設置規定',
        tag: '台中市',
        keywords: ['宜居', '宜居建築', '容積獎勵', '陽台', '露台'],
      },
    ],
  },
  {
    id: 'dangerous',
    emoji: '🔨',
    title: '危老重建',
    resources: [
      {
        id: 'do-01',
        name: '都市危險及老舊建築物加速重建條例',
        url: 'https://glrs.moi.gov.tw/LawContent.aspx?id=GL000980',
        desc: '危老重建申請條件、容積獎勵、稅務減免之法規依據',
        tag: '全國',
        keywords: ['危老', '重建', '容積獎勵', '老舊建築', '都市更新'],
      },
      {
        id: 'do-02',
        name: '加速都市危險及老舊建築物重建',
        url: 'https://www.ey.gov.tw/page/5a8a0cb5b41da11e/5410e269-3e03-43f7-87b3-8f573d2cbb83',
        desc: '行政院危老重建推動平台，含申請流程、計畫書範本及審查資訊',
        tag: '全國',
        keywords: ['危老', '重建', '申請', '流程', '計畫書'],
      },
    ],
  },
  {
    id: 'urban_design',
    emoji: '🏙️',
    title: '都審與宜居建築',
    resources: [
      {
        id: 'ud-01',
        name: '台中市都審裝飾板花台 2.0',
        url: 'https://www.arcnet.org.tw/system/artical_files/files/000/000/331/original/111.06.08%E9%83%BD%E5%AF%A9_%E8%A3%9D%E9%A3%BE%E6%9D%BF%E8%8A%B1%E5%8F%B02.0.pdf',
        desc: '台中市都審裝飾板及花台設計規範（第二版）',
        tag: '台中市',
        keywords: ['都審', '裝飾板', '花台', '外牆', '陽台'],
      },
    ],
  },
  {
    id: 'accessible',
    emoji: '♿',
    title: '無障礙',
    resources: [
      {
        id: 'ac-01',
        name: '臺中市建築物無障礙相關審查作業參考手冊',
        url: 'https://www.tccarch.org.tw/Upload/20250324200458_19782.pdf',
        desc: '台中市建築物無障礙設施審查標準與圖說參考',
        tag: '台中市',
        keywords: ['無障礙', '殘障', '輪椅', '坡道', '電梯', '審查'],
      },
    ],
  },
  {
    id: 'condo',
    emoji: '🏢',
    title: '公寓大廈',
    resources: [
      {
        id: 'cd-01',
        name: '公寓大廈管理條例',
        url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070118',
        desc: '公寓大廈共有部分、管理委員會、區分所有權之規定',
        tag: '全國',
        keywords: ['公寓大廈', '管理委員會', '區分所有', '共用', '社區'],
      },
    ],
  },
  {
    id: 'construction_mgmt',
    emoji: '📋',
    title: '建管作業',
    resources: [
      {
        id: 'cm-01',
        name: '台中市建管作業參考手冊',
        url: 'https://mcgbm.taichung.gov.tw/',
        desc: '台中市建造執照、使用執照申請作業流程與圖說要求（PDF 請洽建管系統下載）',
        tag: '台中市',
        keywords: ['建管', '建造執照', '使用執照', '申請', '竣工', '查驗'],
      },
    ],
  },
  {
    id: 'platforms',
    emoji: '🔗',
    title: '民間法規平台',
    resources: [
      {
        id: 'pl-01',
        name: '建築人法規查詢',
        url: 'https://arch-people.com/laws/',
        desc: '建築法規條文全文檢索，含修正沿革及相關解釋',
        tag: '民間平台',
        keywords: ['法規', '條文', '建築法', '全文檢索', '建築人'],
      },
      {
        id: 'pl-02',
        name: 'ArkiTeki 建築法規整理',
        url: 'https://arkiteki.com/',
        desc: '建築師整理之法規重點摘要與實務解說',
        tag: '民間平台',
        keywords: ['法規', '摘要', '實務', 'ArkiTeki'],
      },
      {
        id: 'pl-03',
        name: '建築 AI 法規查詢平台',
        url: 'https://notebooklm.google.com/notebook/bf6c6ee3-768e-4b03-9067-f92e54ee69a0',
        desc: 'Google NotebookLM AI 輔助法規問答平台',
        tag: '民間平台',
        keywords: ['AI', 'NotebookLM', 'Google', 'AI法規', '問答'],
      },
    ],
  },
]

const ALL_REG: (RegResource & { catTitle: string })[] =
  REG_CATEGORIES.flatMap(cat => cat.resources.map(r => ({ ...r, catTitle: cat.title })))

const REG_TOTAL = ALL_REG.length

// ─── 標籤顏色 ──────────────────────────────────────────────────────────────

const TAG_STYLES: Record<RegTag, { bg: string; text: string; border: string }> = {
  台中市:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  全國:     { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  民間平台: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
}

// ─── 搜尋邏輯 ──────────────────────────────────────────────────────────────

function matchReg(r: RegResource, q: string): boolean {
  if (!q) return true
  const lower = q.toLowerCase()
  return (
    r.name.toLowerCase().includes(lower) ||
    r.desc.toLowerCase().includes(lower) ||
    (r.keywords ?? []).some(kw => kw.toLowerCase().includes(lower))
  )
}

// ─── 元件：外部連結圖示 ────────────────────────────────────────────────────

function ExternalArrow() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
}

// ─── 元件：法規卡片 ────────────────────────────────────────────────────────

function RegCard({ resource }: { resource: RegResource }) {
  const tagStyle = TAG_STYLES[resource.tag]

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all flex flex-col">
      <div className="px-4 pt-4 pb-3 flex-1">
        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${tagStyle.bg} ${tagStyle.text} ${tagStyle.border} mb-2`}>
          {resource.tag}
        </span>
        <h3 className="text-sm font-bold text-gray-800 leading-snug mb-1.5">
          {resource.name}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          {resource.desc}
        </p>
      </div>
      <div className="px-4 pb-4">
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold transition-colors"
        >
          <ExternalArrow />
          開啟查詢
        </a>
      </div>
    </div>
  )
}

// ─── 元件：分類區塊 ────────────────────────────────────────────────────────

function CategorySection({ cat }: { cat: RegCategory }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base leading-none">{cat.emoji}</span>
        <h2 className="text-sm font-bold text-gray-700">{cat.title}</h2>
        <span className="text-xs text-gray-400 font-medium">{cat.resources.length} 項</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {cat.resources.map(r => (
          <RegCard key={r.id} resource={r} />
        ))}
      </div>
    </section>
  )
}

// ─── 主元件 ────────────────────────────────────────────────────────────────

export default function RegulationDbView() {
  const [query, setQuery] = useState('')

  const isSearching = query.trim() !== ''

  const searchResults = useMemo(
    () => isSearching ? ALL_REG.filter(r => matchReg(r, query.trim())) : [],
    [isSearching, query]
  )

  const filteredCategories = useMemo(
    () =>
      REG_CATEGORIES.map(cat => ({
        ...cat,
        resources: cat.resources.filter(r => matchReg(r, query.trim())),
      })).filter(cat => cat.resources.length > 0),
    [query]
  )

  return (
    <div className="w-full md:flex-1 md:overflow-y-auto bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8 pb-24 md:pb-12">

        {/* ── 頁首 ──────────────────────────────────────── */}
        <div className="mb-5">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-xl">📚</span>
            <h1 className="text-xl font-bold text-gray-800">法規資料庫</h1>
            <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
              {REG_TOTAL} 項資源
            </span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            彙整台中市及全國常用建築法規、自治條例、民間法規查詢平台。
          </p>
        </div>

        {/* ── 搜尋框 ──────────────────────────────────── */}
        <div className="relative mb-6">
          <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜尋法規，例如：危老、都審、宜居、無障礙、公寓大廈"
            className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="清除搜尋"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* ── 搜尋模式 ─────────────────────────────────── */}
        {isSearching && (
          <>
            {searchResults.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-4xl mb-3">🔍</div>
                <div className="text-sm font-semibold">找不到「{query}」的相關法規</div>
                <button
                  onClick={() => setQuery('')}
                  className="mt-3 text-xs text-blue-500 hover:text-blue-700 hover:underline transition-colors"
                >
                  清除搜尋，顯示全部
                </button>
              </div>
            ) : (
              <>
                <div className="text-xs text-gray-500 mb-3 font-medium">
                  找到 <span className="text-gray-800 font-bold">{searchResults.length}</span> 項符合「{query}」的法規
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {searchResults.map(r => (
                    <RegCard key={r.id} resource={r} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ── 分類顯示 ─────────────────────────────────── */}
        {!isSearching && (
          <div className="space-y-8">
            {filteredCategories.map(cat => (
              <CategorySection key={cat.id} cat={cat} />
            ))}
          </div>
        )}

        {/* ── 頁尾說明 ─────────────────────────────────── */}
        <div className="mt-10 flex items-start gap-2.5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-xs text-amber-700 leading-relaxed">
            所有連結均導向外部政府機關或民間平台，法規內容以主管機關最新公告版本為準。如有連結失效，請通知系統管理員更新。
          </p>
        </div>

      </div>
    </div>
  )
}
