'use client'

import { useState, useMemo } from 'react'
import type { AppView } from '@/types'

// ─── 資料定義 ──────────────────────────────────────────────────────────────

type Tag = '台中市' | '全國' | '國際資源' | '內部資源'

interface Resource {
  id: string
  name: string
  url: string
  desc: string
  tag: Tag
  /** 額外搜尋關鍵字（name/desc 以外） */
  keywords?: string[]
}

interface Category {
  id: string
  emoji: string
  title: string
  resources: Resource[]
}

const CATEGORIES: Category[] = [
  {
    id: 'land',
    emoji: '🗺️',
    title: '地籍與土地查詢',
    resources: [
      {
        id: 'land-01',
        name: '158 空間資訊網',
        url: 'https://lohas.taichung.gov.tw/webgis/',
        desc: '查詢地號、都市計畫區、土地使用分區',
        tag: '台中市',
        keywords: ['空間', '地號', '土管', '分區'],
      },
      {
        id: 'land-02',
        name: '台中新舊地建號查詢',
        url: 'https://landquery.taichung.gov.tw/query/rwd/oldnew.jsp?menu=true&type=M&reqType=rwd',
        desc: '查詢新舊地號、新舊建號對照，適用舊建照追蹤、都更、危老、歷史建照資料查詢',
        tag: '台中市',
        keywords: ['地籍', '舊地號', '舊建號', '地號', '建號', '都更', '危老', '歷史建照', '建照'],
      },
      {
        id: 'land-03',
        name: 'LUZ 土地使用分區查詢',
        url: 'https://luz.nlma.gov.tw/web/',
        desc: '查詢土地使用分區及基地位置',
        tag: '全國',
        keywords: ['分區', 'LUZ', '土管'],
      },
      {
        id: 'land-04',
        name: '地籍套繪圖查詢',
        url: 'https://mcgbm.taichung.gov.tw/geoViewer2/geoViewAction.do?infopage=1&pas=I80',
        desc: '查詢地籍套繪圖',
        tag: '台中市',
        keywords: ['地籍', '套繪', '地號', '建照'],
      },
      {
        id: 'land-05',
        name: '台中市都市計畫土地使用分區管制要點查詢',
        url: 'https://www.ud.taichung.gov.tw/28928/29030/29058/2346379',
        desc: '查詢各都市計畫區土地使用分區管制要點',
        tag: '台中市',
        keywords: ['土管', '分區', '管制', '容積', '建蔽', '都計'],
      },
    ],
  },
  {
    id: 'geology',
    emoji: '⛰️',
    title: '環境與災害查詢',
    resources: [
      {
        id: 'geo-01',
        name: '台中水利地山坡查詢',
        url: 'https://wrbeochi.taichung.gov.tw/slide/',
        desc: '查詢山坡地範圍及水利相關資料',
        tag: '台中市',
        keywords: ['山坡', '水利', '坡地', '斜坡'],
      },
      {
        id: 'geo-02',
        name: '地質敏感區查詢',
        url: 'https://gsa.gsmma.gov.tw/gwh/gsb97-1/sys_2014b_pg/index.cfm',
        desc: '查詢地質敏感區',
        tag: '全國',
        keywords: ['地質', '敏感', '斷層', '活動斷層'],
      },
      {
        id: 'geo-03',
        name: '土壤液化潛勢查詢系統',
        url: 'https://www.liquid.net.tw/cgs/public/',
        desc: '查詢土壤液化潛勢',
        tag: '全國',
        keywords: ['液化', '土壤', '地震', '潛勢'],
      },
    ],
  },
  {
    id: 'culture',
    emoji: '🌿',
    title: '文化與生態查詢',
    resources: [
      {
        id: 'cul-01',
        name: '台中文化資產查詢',
        url: 'https://culgis.taichung.gov.tw/taicul/index.html',
        desc: '查詢文化資產、古蹟、歷史建築',
        tag: '台中市',
        keywords: ['文資', '古蹟', '歷史建築', '文化'],
      },
      {
        id: 'cul-02',
        name: '受保護樹木查詢',
        url: 'https://lohas.taichung.gov.tw/webgis/index.html?toolname=%E5%8F%97%E4%BF%9D%E8%AD%B7%E6%A8%B9',
        desc: '查詢受保護樹木',
        tag: '台中市',
        keywords: ['樹木', '保護樹', '老樹', '珍貴樹木'],
      },
      {
        id: 'cul-03',
        name: '建設局友善樹木空間資訊管理',
        url: 'https://itree.taichung.gov.tw/Tccg_Tree/index.aspx',
        desc: '查詢友善樹木及樹木管理資訊',
        tag: '台中市',
        keywords: ['樹木', '友善樹', '樹木管理', '保護樹'],
      },
    ],
  },
  {
    id: 'construction',
    emoji: '🏗️',
    title: '建管相關',
    resources: [
      {
        id: 'con-01',
        name: '建管系統便民服務網',
        url: 'https://mcgbm.taichung.gov.tw/',
        desc: '查詢建造執照、使用執照、建管相關資訊',
        tag: '台中市',
        keywords: ['建照', '建管', '使用執照', '建造執照', '執照', '竣工'],
      },
    ],
  },
  {
    id: 'urban_design',
    emoji: '🏙️',
    title: '都市設計審議',
    resources: [
      {
        id: 'ud-01',
        name: '都市設計審議會議入口',
        url: 'https://urbandesign.taichung.gov.tw/SBA/web_page/SBA030101.jsp',
        desc: '查詢都審會議紀錄、審議資料及相關資訊',
        tag: '台中市',
        keywords: ['都審', '都設審', '都市設計', '都市設計審議', '審議'],
      },
    ],
  },
  {
    id: 'drawing',
    emoji: '✏️',
    title: '繪圖與BIM資源',
    resources: [
      {
        id: 'drw-01',
        name: 'CAD Blocks 免費 CAD 圖塊資源',
        url: 'https://www.cad-blocks.net/index.html',
        desc: '免費下載建築常用 DWG 圖塊素材',
        tag: '國際資源',
        keywords: ['CAD', 'DWG', '圖塊', 'AutoCAD', '素材'],
      },
      {
        id: 'drw-02',
        name: 'BIM 知識資源平台',
        url: 'https://www.homemesh.com.tw/bim/category/2',
        desc: '台灣 BIM 技術交流與教學資源平台',
        tag: '全國',
        keywords: ['BIM', 'Revit', '建築資訊模型', '台灣BIM'],
      },
      {
        id: 'drw-03',
        name: 'Archiproducts 材質資料庫',
        url: 'https://bim.archiproducts.com/zh',
        desc: '國際建築材質、建材產品資料庫',
        tag: '國際資源',
        keywords: ['材質', '建材', '產品', 'Archiproducts'],
      },
      {
        id: 'drw-04',
        name: 'BIMobject Revit 元件資料庫',
        url: 'https://www.bimobject.com/zh',
        desc: '免費下載廠商認證 BIM／Revit 元件',
        tag: '國際資源',
        keywords: ['BIM', 'Revit', '元件', '族群', 'family'],
      },
    ],
  },
]

// 所有資源攤平（搜尋用）
const ALL_RESOURCES: (Resource & { catTitle: string; catEmoji: string })[] =
  CATEGORIES.flatMap(cat =>
    cat.resources.map(r => ({ ...r, catTitle: cat.title, catEmoji: cat.emoji }))
  )

const TOTAL = ALL_RESOURCES.length

// ─── 標籤顏色 ──────────────────────────────────────────────────────────────

const TAG_STYLES: Record<Tag, { bg: string; text: string; border: string }> = {
  台中市:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  全國:     { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  國際資源: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  內部資源: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
}

// ─── 搜尋邏輯 ──────────────────────────────────────────────────────────────

function matchResource(r: Resource, q: string): boolean {
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

// ─── 元件：資源卡片 ────────────────────────────────────────────────────────

function ResourceCard({ resource }: { resource: Resource }) {
  const tagStyle = TAG_STYLES[resource.tag]

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all flex flex-col">
      {/* 內容區 */}
      <div className="px-4 pt-4 pb-3 flex-1">
        {/* 標籤 */}
        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${tagStyle.bg} ${tagStyle.text} ${tagStyle.border} mb-2`}>
          {resource.tag}
        </span>

        {/* 名稱 */}
        <h3 className="text-sm font-bold text-gray-800 leading-snug mb-1.5">
          {resource.name}
        </h3>

        {/* 用途說明 */}
        <p className="text-xs text-gray-500 leading-relaxed">
          {resource.desc}
        </p>
      </div>

      {/* 按鈕區 */}
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

// ─── 元件：分類區塊（依類別分組顯示用） ────────────────────────────────────

function CategorySection({ cat }: { cat: Category }) {
  return (
    <section>
      {/* 區塊標題 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base leading-none">{cat.emoji}</span>
        <h2 className="text-sm font-bold text-gray-700">{cat.title}</h2>
        <span className="text-xs text-gray-400 font-medium">{cat.resources.length} 項</span>
      </div>

      {/* 卡片格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {cat.resources.map(r => (
          <ResourceCard key={r.id} resource={r} />
        ))}
      </div>
    </section>
  )
}

// ─── 內部導覽區塊 ──────────────────────────────────────────────────────────

interface InternalItem {
  emoji: string
  label: string
  desc: string
  view?: AppView
  coming?: boolean
}

function InternalSection({
  title, emoji, items, onNavigate,
}: {
  title: string
  emoji: string
  items: InternalItem[]
  onNavigate: (view: AppView) => void
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base leading-none">{emoji}</span>
        <h2 className="text-sm font-bold text-gray-700">{title}</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {items.map(item => (
          <button
            key={item.label}
            onClick={() => !item.coming && item.view && onNavigate(item.view)}
            disabled={item.coming}
            className={`text-left bg-white rounded-xl border p-3.5 flex flex-col gap-1.5 transition-all
              ${item.coming
                ? 'border-gray-100 opacity-60 cursor-not-allowed'
                : 'border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 active:translate-y-0'}`}
          >
            <span className="text-xl leading-none">{item.emoji}</span>
            <div>
              <div className="text-xs font-bold text-gray-800 leading-tight">{item.label}</div>
              <div className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{item.desc}</div>
            </div>
            {item.coming ? (
              <span className="self-start text-[9px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-semibold">
                即將推出
              </span>
            ) : (
              <span className="self-start text-[9px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                進入
                <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  )
}

// ─── 主元件 ────────────────────────────────────────────────────────────────

interface Props {
  onNavigate?: (view: AppView) => void
}

export default function ResourceCenterView({ onNavigate }: Props) {
  const [query, setQuery] = useState('')

  const isSearching = query.trim() !== ''

  // 搜尋結果（攤平列表）
  const searchResults = useMemo(
    () => isSearching ? ALL_RESOURCES.filter(r => matchResource(r, query.trim())) : [],
    [isSearching, query]
  )

  // 分類顯示時的過濾（不搜尋時全顯示）
  const filteredCategories = useMemo(
    () =>
      CATEGORIES.map(cat => ({
        ...cat,
        resources: cat.resources.filter(r => matchResource(r, query.trim())),
      })).filter(cat => cat.resources.length > 0),
    [query]
  )

  return (
    <div className="w-full md:flex-1 md:overflow-y-auto bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8 pb-24 md:pb-12">

        {/* ── 頁首 ──────────────────────────────────────── */}
        <div className="mb-5">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-xl">🏢</span>
            <h1 className="text-xl font-bold text-gray-800">建築資源中心</h1>
            <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
              {TOTAL} 項資源
            </span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            整合建築師事務所常用之基地分析、法規查詢、都審、建管及政府資訊平台。
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
            placeholder="搜尋資源，例如：土壤液化、斷層、土管、都審、地籍、建照"
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

        {/* ── 內建工具：快速入口卡片 ──────────────────── */}
        {!isSearching && onNavigate && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">🔧</span>
              <h2 className="text-sm font-bold text-gray-700">內建工具</h2>
            </div>

            {/* H2 主要 Banner */}
            <div
              onClick={() => onNavigate('h2_checklist')}
              className="cursor-pointer bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-5 flex items-center gap-5 hover:from-blue-800 hover:to-blue-950 transition-all shadow-md group mb-3"
            >
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl shrink-0">
                📋
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-base leading-tight">H2 法規自主檢討項目表</div>
                <div className="text-blue-200 text-xs mt-1">H2 階段自主法規檢核工具，涵蓋建築面積、安全梯、防火、無障礙、宜居建築等核心項目</div>
                <div className="text-blue-300 text-xs mt-1">共 20 項主題｜⭐ 4 項台中特殊重要項目・可搜尋・可收藏・可列印</div>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-semibold">
                  進入檢討表
                </span>
                <svg className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* 次要快速入口卡片 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { emoji: '📖', label: '法規資料庫', desc: '台中市法規・危老', view: 'regulation_db' as AppView },
                { emoji: '🔍', label: '條文搜尋', desc: '全文檢索法規條文', view: 'article_search' as AppView },
                { emoji: '📂', label: '歷史檢核紀錄', desc: '案件歷史查閱', view: 'history' as AppView },
                { emoji: '🤖', label: 'AI 法規助理', desc: '智慧法規問答', view: 'ai_assistant' as AppView },
              ].map(item => (
                <button
                  key={item.view}
                  onClick={() => onNavigate(item.view)}
                  className="text-left bg-white rounded-xl border border-gray-200 px-3.5 py-3 flex items-center gap-2.5 hover:border-blue-200 hover:shadow-sm hover:-translate-y-0.5 transition-all"
                >
                  <span className="text-lg leading-none shrink-0">{item.emoji}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-gray-800 truncate">{item.label}</div>
                    <div className="text-[10px] text-gray-400 truncate">{item.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── 內部導覽區塊（非搜尋時顯示）────────────────── */}
        {!isSearching && onNavigate && (
          <div className="mb-8 space-y-5">

            {/* 法規工具 */}
            <InternalSection
              title="法規工具"
              emoji="⚖️"
              items={[
                { emoji: '📋', label: 'H2 法規自主檢討表', desc: '8分類 46項・TOP20警示', view: 'h2_checklist' as AppView },
                { emoji: '📖', label: '建築技術規則速查', desc: '台中市法規・危老・無障礙', view: 'regulation_db' as AppView },
                { emoji: '🔍', label: '條文搜尋', desc: '全文檢索法規條文', view: 'article_search' as AppView },
                { emoji: '📚', label: '法規資料庫', desc: '彙整台中市常用法規', view: 'regulation_db' as AppView },
                { emoji: '🔗', label: '函釋案例', desc: '主管機關解釋函彙整', view: 'ai_rulings' as AppView },
                { emoji: '🏷️', label: '法規更新紀錄', desc: '條文修正版本追蹤', view: 'version_mgmt' as AppView },
              ]}
              onNavigate={onNavigate}
            />

            {/* 台中特殊法規 */}
            <InternalSection
              title="台中特殊法規"
              emoji="🏙️"
              items={[
                { emoji: '🏢', label: '宜居建築', desc: '宜居陽台・平台・回饋金', view: 'regulation_db' as AppView },
                { emoji: '🌳', label: '開放空間', desc: '透空率・告示牌・維管', coming: true },
                { emoji: '🔄', label: '容積移轉', desc: '容積移轉申請規範', coming: true },
                { emoji: '🔨', label: '危老獎勵', desc: '危老條例・時程獎勵', view: 'regulation_db' as AppView },
                { emoji: '🏗️', label: '都市更新', desc: '都更條例・獎勵', coming: true },
                { emoji: '🏛️', label: '都市審議', desc: '屋脊・外牆裝飾物', view: 'regulation_db' as AppView },
              ]}
              onNavigate={onNavigate}
            />

            {/* 案例與資源 */}
            <InternalSection
              title="案例與資源"
              emoji="📂"
              items={[
                { emoji: '📁', label: '案例庫', desc: '歷史檢核案例查閱', coming: true },
                { emoji: '⚠️', label: '常見錯誤案例', desc: '法規審查常見問題', coming: true },
                { emoji: '🤖', label: 'AI 法規助理', desc: '智慧法規問答', view: 'ai_assistant' as AppView },
              ]}
              onNavigate={onNavigate}
            />
          </div>
        )}

        {/* ── 搜尋模式：平鋪結果 ──────────────────────── */}
        {isSearching && (
          <>
            {searchResults.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-4xl mb-3">🔍</div>
                <div className="text-sm font-semibold">找不到「{query}」的相關資源</div>
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
                  找到 <span className="text-gray-800 font-bold">{searchResults.length}</span> 項符合「{query}」的資源
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {searchResults.map(r => (
                    <ResourceCard key={r.id} resource={r} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ── 一般模式：依類別分組 ─────────────────────── */}
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
            本區連結為外部查詢工具，查詢結果仍應以主管機關公告、核發證明或書面認定為準。
          </p>
        </div>

      </div>
    </div>
  )
}
