'use client'

import { useState, useMemo } from 'react'

// ─── 資料定義 ──────────────────────────────────────────────────────────────

type RegTag = '全國' | '台中市' | '民間平台'

interface RegResource {
  id: string
  name: string
  url: string
  desc: string
  tag: RegTag
  keywords?: string[]
  highlight?: boolean   // 宜居專區高亮標籤
}

interface RegCategory {
  id: string
  emoji: string
  title: string
  subtitle?: string
  accent?: string       // 特別色（宜居專區用）
  resources: RegResource[]
}

const REG_CATEGORIES: RegCategory[] = [
  {
    id: 'national',
    emoji: '⚖️',
    title: '中央法規',
    resources: [
      {
        id: 'na-01',
        name: '建築法',
        url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070001',
        desc: '建築物之建造、使用、拆除及主管機關，建築師及承造人規定之基本法源',
        tag: '全國',
        keywords: ['建築法', '建照', '使照', '起造人', '承造人', '建築師'],
      },
      {
        id: 'na-02',
        name: '建築技術規則',
        url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070115',
        desc: '建築物設計施工、構造、設備之技術規範，涵蓋面積、高度、防火、無障礙等所有技術規定',
        tag: '全國',
        keywords: ['建築技術規則', '設計施工', '防火', '無障礙', '停車', '樓梯', '安全梯'],
      },
      {
        id: 'na-03',
        name: '都市計畫法',
        url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070003',
        desc: '土地使用分區管制、建蔽率、容積率、公共設施保留地之法源依據',
        tag: '全國',
        keywords: ['都市計畫法', '土地使用', '建蔽率', '容積率', '使用分區', '都計'],
      },
      {
        id: 'na-04',
        name: '公寓大廈管理條例',
        url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070118',
        desc: '公寓大廈共有部分、管理委員會、區分所有權之規定，影響集合住宅設計與公設規劃',
        tag: '全國',
        keywords: ['公寓大廈', '管理委員會', '區分所有', '共用', '社區', '管委會'],
      },
      {
        id: 'na-05',
        name: '都市危險及老舊建築物加速重建條例',
        url: 'https://glrs.moi.gov.tw/LawContent.aspx?id=GL000980',
        desc: '危老重建申請條件、容積獎勵（基本10%、時程最高10%、設計獎勵）、稅務減免之法規依據',
        tag: '全國',
        keywords: ['危老', '重建', '容積獎勵', '老舊建築', '危老條例', '時程獎勵'],
      },
    ],
  },
  {
    id: 'taichung',
    emoji: '🏛️',
    title: '台中市法規',
    resources: [
      {
        id: 'tc-01',
        name: '都市計畫法臺中市施行自治條例',
        url: 'https://law.taichung.gov.tw/LawContent.aspx?id=GL002020',
        desc: '台中市都市計畫法之施行細則與地方補充規定，含建蔽率、容積率、退縮規定',
        tag: '台中市',
        keywords: ['都市計畫', '都計', '自治條例', '土地使用', '台中市'],
      },
      {
        id: 'tc-02',
        name: '臺中市水湳機場原址整體開發區都市設計審議規範',
        url: 'https://law.taichung.gov.tw/LawContent.aspx?id=GL003371',
        desc: '水湳智慧城區都市設計審議標準，獨立於一般台中市都審規範，有特別的高度、天際線及智慧建築規定',
        tag: '台中市',
        keywords: ['水湳', '機場', '都審', '都市設計', '智慧城', '水湳經貿'],
      },
    ],
  },
  {
    id: 'yiju',
    emoji: '🌿',
    title: '宜居建築專區',
    subtitle: '容積獎勵 · 宜居陽台 · 裝飾板花台',
    accent: 'green',
    resources: [
      {
        id: 'yj-01',
        name: '臺中市鼓勵宜居建築設施設置及回饋辦法',
        url: 'https://law.taichung.gov.tw/LawContent.aspx?id=GL003620',
        desc: '台中市宜居建築容積獎勵（上限 10%）與設施設置規定，含宜居陽台（深度 ≥ 150 cm）、托嬰中心、老人日照等設施回饋辦法',
        tag: '台中市',
        keywords: ['宜居', '宜居建築', '容積獎勵', '宜居陽台', '空中花園', '綠化平台', '托嬰', '長照', '回饋金'],
        highlight: true,
      },
      {
        id: 'yj-02',
        name: '台中市都審裝飾板花台 2.0',
        url: 'https://www.arcnet.org.tw/system/artical_files/files/000/000/331/original/111.06.08%E9%83%BD%E5%AF%A9_%E8%A3%9D%E9%A3%BE%E6%9D%BF%E8%8A%B1%E5%8F%B02.0.pdf',
        desc: '台中市都審裝飾板及花台設計規範（第二版），規定外牆裝飾板深度、花台尺寸及間距，申請都審前必讀',
        tag: '台中市',
        keywords: ['裝飾板', '花台', '外牆', '都審', '宜居陽台', '裝飾物', '2.0版'],
        highlight: true,
      },
    ],
  },
  {
    id: 'practice',
    emoji: '📋',
    title: '實務參考',
    resources: [
      {
        id: 'pr-01',
        name: '台中市建管作業參考手冊',
        url: 'https://mcgbm.taichung.gov.tw/',
        desc: '台中市建造執照、使用執照申請作業流程與圖說要求，PDF 手冊請洽建管系統下載頁面',
        tag: '台中市',
        keywords: ['建管', '建造執照', '使用執照', '申請', '竣工', '查驗', '建管手冊'],
      },
      {
        id: 'pr-02',
        name: '臺中市建築物無障礙相關審查作業參考手冊（2024）',
        url: 'https://www.tccarch.org.tw/Upload/20250324200458_19782.pdf',
        desc: '台中市無障礙設施審查標準與圖說參考，含坡道、通路、廁所、昇降機規格說明（PDF）',
        tag: '台中市',
        keywords: ['無障礙', '坡道', '輪椅', '無障礙廁所', '審查', '無障礙手冊'],
      },
    ],
  },
  {
    id: 'aitools',
    emoji: '🤖',
    title: 'AI 法規工具',
    resources: [
      {
        id: 'ai-01',
        name: '建築人法規查詢',
        url: 'https://arch-people.com/laws/',
        desc: '建築法規條文全文檢索，含修正沿革、相關解釋函，適合快速查詢條文原文與歷次修正',
        tag: '民間平台',
        keywords: ['建築人', '法規查詢', '條文', '全文檢索', '修正沿革'],
      },
      {
        id: 'ai-02',
        name: '建築 AI 法規查詢平台',
        url: 'https://notebooklm.google.com/notebook/bf6c6ee3-768e-4b03-9067-f92e54ee69a0',
        desc: 'Google NotebookLM AI 輔助建築法規問答，可直接以自然語言詢問法規問題，適合快速釐清法規疑義',
        tag: '民間平台',
        keywords: ['AI', 'NotebookLM', 'Google', 'AI法規', '問答', '自然語言'],
      },
    ],
  },
]

const ALL_REG: (RegResource & { catTitle: string; catEmoji: string })[] =
  REG_CATEGORIES.flatMap(cat =>
    cat.resources.map(r => ({ ...r, catTitle: cat.title, catEmoji: cat.emoji }))
  )

const REG_TOTAL = ALL_REG.length

// ─── 標籤顏色 ──────────────────────────────────────────────────────────────

const TAG_STYLES: Record<RegTag, { bg: string; text: string; border: string }> = {
  全國:     { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  台中市:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
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
    <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all flex flex-col
      ${resource.highlight ? 'border-green-200 hover:border-green-300' : 'border-gray-200 hover:border-gray-300'}`}>
      <div className="px-4 pt-4 pb-3 flex-1">
        {/* 標籤列 */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${tagStyle.bg} ${tagStyle.text} ${tagStyle.border}`}>
            {resource.tag}
          </span>
          {resource.highlight && (
            <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
              宜居專區
            </span>
          )}
        </div>

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
          className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-white text-xs font-semibold transition-colors
            ${resource.highlight
              ? 'bg-green-600 hover:bg-green-700 active:bg-green-800'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'}`}
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
  const isYiju = cat.id === 'yiju'

  return (
    <section>
      {/* 區塊標題 */}
      <div className={`flex items-center gap-2.5 mb-3 ${isYiju ? 'pb-2 border-b-2 border-green-200' : ''}`}>
        <span className="text-base leading-none">{cat.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-700">{cat.title}</h2>
            {isYiju && (
              <span className="text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                重要
              </span>
            )}
            <span className="text-xs text-gray-400 font-medium">{cat.resources.length} 項</span>
          </div>
          {cat.subtitle && (
            <div className="text-[11px] text-green-600 font-medium mt-0.5">{cat.subtitle}</div>
          )}
        </div>
      </div>

      {/* 卡片格 */}
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
            彙整中央法規、台中市自治條例、宜居建築專區、實務手冊及 AI 法規工具。
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
            placeholder="搜尋法規，例如：危老、都審、宜居、無障礙、公寓大廈、水湳"
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
