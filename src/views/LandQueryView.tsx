'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { BuildingInput } from '@/types'
import { TaichungUrbanPlanAdapter } from '@/lib/adapters/TaichungUrbanPlanAdapter'
import type { ZoningQueryResult } from '@/lib/adapters/types'
import { importGeoJSON, previewFields } from '@/lib/gis/importPipeline'
import { saveZoningFeatures, loadZoningMeta, clearZoningStore, hasImportedData, warmupCache } from '@/lib/gis/zoningStore'
import { DATA_SOURCE_LABELS } from '@/lib/gis/types'
import type { WGS84Coordinate } from '@/lib/gis/types'
import { IconSearch, IconMap, IconCheck, IconWarning, IconInfo, IconDoc } from '@/components/icons'

interface Props {
  onApplyToCheck?: (partial: Partial<BuildingInput>) => void
}

// ─── 地號查詢結果 → 檢核表單欄位映射 ──────────────────────────

function zoningToPartialInput(r: ZoningQueryResult): Partial<BuildingInput> {
  if (!r.zoning) return {}
  const z = r.zoning
  return {
    district:       r.parcel.district,
    planAreaId:     z.suggested_plan_area_id ?? 'general_taichung',
    zoneType:       z.suggested_zone_type ?? z.zone_short_name,
    specialZoneIds: [],
  }
}

// ─── 子元件 ────────────────────────────────────────────────────

function DataRow({ label, value, accent, mono }: {
  label: string; value: string; accent?: boolean; mono?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span className={`text-sm font-semibold text-right ${
        accent ? 'text-blue-700' : 'text-gray-800'
      } ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  )
}

function RatioBar({ label, value, max = 100, color }: {
  label: string; value: number; max?: number; color: string
}) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-bold text-gray-800">{value}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ─── 資料來源狀態 Badge ──────────────────────────────────────

function DataSourceBadge({ status }: { status: 'MOCK' | 'IMPORTED_GIS' | 'LIVE_API' }) {
  const cfg = DATA_SOURCE_LABELS[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'MOCK' ? 'bg-orange-500' :
        status === 'IMPORTED_GIS' ? 'bg-green-500' : 'bg-blue-500'
      }`} />
      {cfg.label}
    </span>
  )
}

// ─── GeoJSON 匯入面板 ─────────────────────────────────────────

interface ImportPanelProps {
  onImported: () => void
}

function GeoJSONImportPanel({ onImported }: ImportPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<'idle' | 'loading' | 'inspect' | 'importing' | 'done' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  // 探查結果
  const [inspectFileName, setInspectFileName] = useState('')
  const [inspectTotal, setInspectTotal] = useState(0)
  const [rawProps, setRawProps] = useState<Record<string, unknown> | null>(null)
  // 解析後暫存 GeoJSON（等使用者確認再寫入 store）
  const pendingGeoJSON = useRef<{ type: 'FeatureCollection'; features: unknown[] } | null>(null)

  // 匯入日誌
  const [importLog, setImportLog] = useState<string[]>([])
  const [importSummary, setImportSummary] = useState<{
    fileName: string
    featureCount: number
    zoneField: string | null
    coverageField: string | null
    farField: string | null
  } | null>(null)

  /** Step 1：解析檔案，顯示第一筆 properties，等待確認 */
  const handleFile = useCallback(async (file: File) => {
    setStep('loading')
    setError(null)
    setRawProps(null)
    setImportLog([])
    pendingGeoJSON.current = null

    const isZip     = file.name.endsWith('.zip')
    const isGeoJSON = file.name.endsWith('.geojson') || file.name.endsWith('.json')

    try {
      let geojson: { type: 'FeatureCollection'; features: unknown[] }

      if (isZip) {
        const shpjs = (await import('shpjs')).default
        const buf = await file.arrayBuffer()
        const raw = await shpjs(buf)
        const collections = Array.isArray(raw) ? raw : [raw]
        geojson = {
          type: 'FeatureCollection',
          features: collections.flatMap(c => (c as { features?: unknown[] }).features ?? []),
        }
      } else if (isGeoJSON) {
        const text = await file.text()
        geojson = JSON.parse(text)
      } else {
        throw new Error('不支援的格式，請使用 .zip 或 .geojson')
      }

      const features = geojson.features ?? []
      if (features.length === 0) throw new Error('檔案內無任何 Feature')

      const first = features[0] as { properties?: Record<string, unknown> }
      const props = first?.properties ?? {}

      pendingGeoJSON.current = geojson
      setInspectFileName(file.name)
      setInspectTotal(features.length)
      setRawProps(props)
      setStep('inspect')

    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setStep('error')
    }
  }, [])

  /** Step 2：使用者確認欄位後才真正匯入 */
  const handleConfirmImport = useCallback(async () => {
    const geojson = pendingGeoJSON.current
    if (!geojson) return
    setStep('importing')

    try {
      const log: string[] = [`匯入 ${inspectFileName}…`]
      setImportLog(log)

      const { result, features, detectedFields } = importGeoJSON(geojson, inspectFileName)

      if (!result.success) {
        // 沒有任何 Polygon 才視為真正失敗
        throw new Error(
          result.errors.length > 0
            ? result.errors.join(' | ')
            : `0 個 Polygon 被解析到（共 ${result.featuresTotal} 筆，全部略過）。請確認此檔案包含 Polygon/MultiPolygon 幾何。`
        )
      }

      // 儲存至 IndexedDB（大型資料）+ localStorage 元資料（小量文字）
      const saveResult = await saveZoningFeatures(features, result, {
        zone_name:        detectedFields.zone_name,
        coverage_ratio:   detectedFields.coverage_ratio,
        floor_area_ratio: detectedFields.floor_area_ratio,
      })

      if (!saveResult.ok) {
        // IndexedDB 真正失敗才擲錯
        throw new Error(saveResult.error ?? 'IndexedDB 儲存失敗')
      }

      setImportSummary({
        fileName: inspectFileName,
        featureCount: result.featuresImported,
        zoneField: detectedFields.zone_name,
        coverageField: detectedFields.coverage_ratio,
        farField: detectedFields.floor_area_ratio,
      })

      const finalLog = [
        `✓ 共 ${result.featuresImported.toLocaleString()} 個 Polygon 匯入成功`,
        ...(result.featuresSkipped > 0 ? [`  略過 ${result.featuresSkipped} 筆（非 Polygon 幾何）`] : []),
        ...(saveResult.warning         ? [`  ⚠ ${saveResult.warning}`] : []),
        ...(result.errors.length > 0   ? [`  警告：${result.errors.slice(0, 3).join(' | ')}`] : []),
      ]
      setImportLog(finalLog)
      setStep('done')
      onImported()

    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setStep('error')
    }
  }, [inspectFileName, onImported])

  const reset = useCallback(() => {
    setStep('idle')
    setError(null)
    setRawProps(null)
    setImportLog([])
    setImportSummary(null)
    pendingGeoJSON.current = null
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    if (file.name.endsWith('.zip') || file.name.endsWith('.geojson') || file.name.endsWith('.json')) {
      handleFile(file)
    }
  }, [handleFile])

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-gray-800">GIS 資料匯入</div>
          <div className="text-xs text-gray-400 mt-0.5">支援 ZIP（SHP）/ GeoJSON — 台中市都市計畫圖（114年版）</div>
        </div>
        <DataSourceBadge status="IMPORTED_GIS" />
      </div>

      {/* ── Step: idle / loading — 拖曳上傳區 ───────────────────── */}
      {(step === 'idle' || step === 'loading') && (
        <div
          className={`mx-5 my-4 border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
            step === 'loading'
              ? 'border-blue-300 bg-blue-50 cursor-wait'
              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
          }`}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => step === 'idle' && fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".zip,.geojson,.json"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
          />
          {step === 'loading' ? (
            <>
              <div className="w-8 h-8 border-2 border-blue-400 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
              <div className="text-sm font-semibold text-blue-700">解析中…</div>
              <div className="text-xs text-blue-400 mt-1">讀取 SHP / GeoJSON 屬性資料</div>
            </>
          ) : (
            <>
              <div className="text-3xl mb-2">📂</div>
              <div className="text-sm font-semibold text-gray-700">點擊或拖曳檔案至此</div>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded">.zip（SHP）</span>
                <span className="text-xs text-gray-400">或</span>
                <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded">.geojson / .json</span>
              </div>
              <div className="text-xs text-gray-400 mt-2">ZIP 自動轉換 SHP → GeoJSON，無需人工轉檔</div>
            </>
          )}
        </div>
      )}

      {/* ── Step: inspect — 顯示第一筆 properties，等待確認 ────── */}
      {step === 'inspect' && rawProps && (
        <div className="mx-5 my-4 space-y-4">
          {/* 檔案摘要 */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>📄 <strong className="text-gray-700">{inspectFileName}</strong></span>
            <span>{inspectTotal.toLocaleString()} 個 Feature</span>
          </div>

          {/* 第一筆 properties 完整列表 */}
          <div>
            <div className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-2">
              <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">features[0].properties</span>
              <span className="text-gray-400 font-normal">— 請確認欄位名稱後再匯入</span>
            </div>
            <div className="bg-gray-900 rounded-xl overflow-auto max-h-72 p-4 font-mono text-xs">
              <div className="text-gray-400 mb-1">{'{'}</div>
              {Object.entries(rawProps).map(([key, val]) => (
                <div key={key} className="flex gap-2 pl-4">
                  <span className="text-blue-300 shrink-0">"{key}":</span>
                  <span className={
                    typeof val === 'number'   ? 'text-green-300' :
                    val === null              ? 'text-gray-500' :
                    typeof val === 'boolean'  ? 'text-orange-300' :
                                               'text-yellow-200'
                  }>
                    {val === null ? 'null' :
                     typeof val === 'string' ? `"${val}"` :
                     String(val)}
                  </span>
                </div>
              ))}
              <div className="text-gray-400 mt-1">{'}'}</div>
            </div>
          </div>

          {/* 欄位清單（可複製） */}
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-1">全部欄位名稱（共 {Object.keys(rawProps).length} 個）：</div>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(rawProps).map(k => (
                <span key={k} className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200 select-all">
                  {k}
                </span>
              ))}
            </div>
          </div>

          {/* 確認 / 取消 */}
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 h-10 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors"
            >
              重新選擇檔案
            </button>
            <button
              onClick={handleConfirmImport}
              className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
            >
              確認欄位，開始匯入 →
            </button>
          </div>
        </div>
      )}

      {/* ── Step: importing ──────────────────────────────────────── */}
      {step === 'importing' && (
        <div className="mx-5 my-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-blue-700">
            <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin shrink-0" />
            正在寫入 Polygon 資料…
          </div>
          {importLog.map((line, i) => (
            <div key={i} className="font-mono text-xs text-gray-500">{line}</div>
          ))}
        </div>
      )}

      {/* ── Step: done ───────────────────────────────────────────── */}
      {step === 'done' && importSummary && (
        <div className="mx-5 my-4 space-y-3">
          {/* 成功標題 */}
          <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
            <span className="text-lg">✅</span>
            匯入成功
          </div>

          {/* 匯入摘要 */}
          <div className="bg-green-50 border border-green-200 rounded-xl divide-y divide-green-100">
            {[
              { label: '圖層名稱',   value: importSummary.fileName },
              { label: 'Feature 數量', value: `${importSummary.featureCount.toLocaleString()} 個 Polygon` },
              { label: '使用分區欄位', value: importSummary.zoneField     ?? '⚠ 未對應（分區將顯示為「未知分區」）' },
              { label: '建蔽率欄位',   value: importSummary.coverageField  ?? '⚠ 未對應（將顯示為 0%）' },
              { label: '容積率欄位',   value: importSummary.farField       ?? '⚠ 未對應（將顯示為 0%）' },
            ].map(row => (
              <div key={row.label} className="flex items-start justify-between gap-4 px-4 py-2.5 text-xs">
                <span className="text-green-700 font-medium shrink-0">{row.label}</span>
                <span className={`font-mono text-right ${
                  row.value.startsWith('⚠') ? 'text-orange-600' : 'text-gray-700'
                }`}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* 匯入日誌 */}
          {importLog.map((line, i) => (
            <div key={i} className={`text-xs font-mono ${
              line.startsWith('✓') ? 'text-green-600' :
              line.startsWith('  略過') ? 'text-orange-500' :
              line.startsWith('  警告') ? 'text-red-500' : 'text-gray-400'
            }`}>{line}</div>
          ))}

          <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600 underline">
            重新匯入
          </button>
        </div>
      )}

      {/* ── Step: error ──────────────────────────────────────────── */}
      {step === 'error' && (
        <div className="mx-5 my-4 space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700 leading-relaxed">
            {error}
          </div>
          <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600 underline">
            重試
          </button>
        </div>
      )}

      {/* 說明 */}
      <div className="px-5 pb-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 space-y-1.5 leading-relaxed">
          <div className="font-semibold">如何取得資料？</div>
          <div>
            台中市 OpenData →&nbsp;
            <a
              href="https://opendata.taichung.gov.tw/search/13717923-3e4b-4032-9072-3a51ab985883"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-900"
            >
              臺中市都市計畫圖（114年）
            </a>
            &nbsp;下載 ZIP（內含 .shp / .dbf / .prj）
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-green-600 font-bold shrink-0">✓</span>
            <span>直接拖曳下載的 <strong>ZIP 檔</strong>即可，系統自動轉換 SHP → GeoJSON</span>
          </div>
          <div className="text-blue-500">GeoJSON 儲存於 IndexedDB（無大小上限），支援完整 23,558 筆都市計畫圖資料。</div>
        </div>
      </div>
    </div>
  )
}

// ─── 主元件 ────────────────────────────────────────────────────

export default function LandQueryView({ onApplyToCheck }: Props) {
  // GIS 狀態
  const [gisReady, setGisReady] = useState(false)
  const [gisMeta, setGisMeta] = useState<ReturnType<typeof loadZoningMeta>>(null)
  const [showImport, setShowImport] = useState(false)

  // 查詢模式（預設座標查詢，地號查詢需 NLSC IP 白名單）
  const [queryMode, setQueryMode] = useState<'parcel' | 'coordinate'>('coordinate')

  // 座標查詢
  const [lng, setLng] = useState('')
  const [lat, setLat] = useState('')

  // 結果
  const [result, setResult] = useState<ZoningQueryResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [applied, setApplied] = useState(false)

  // 讀取 GIS 狀態
  const refreshGisState = () => {
    const ready = hasImportedData()
    setGisReady(ready)
    setGisMeta(loadZoningMeta())
  }

  useEffect(() => {
    refreshGisState()
    // 預熱 IndexedDB 快取，讓首次查詢不需等待 IDB 讀取
    warmupCache()
  }, [])

  const canQueryCoord = gisReady && !!parseFloat(lng) && !!parseFloat(lat)

  const handleQuery = async () => {
    if (queryMode !== 'coordinate') return
    setLoading(true)
    setApplied(false)
    setResult(null)
    try {
      // 座標查詢 — 直接走 PIP（不需要 NLSC API）
      const coordinate: WGS84Coordinate = [parseFloat(lng), parseFloat(lat)]
      const adapter = new TaichungUrbanPlanAdapter()
      const res = await adapter.queryByCoordinate(coordinate)
      setResult(res)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    if (!result) return
    const partial = zoningToPartialInput(result)
    onApplyToCheck?.(partial)
    setApplied(true)
  }

  const handleClearGIS = async () => {
    if (!confirm('確定清除已匯入的 GeoJSON 資料？')) return
    await clearZoningStore()
    refreshGisState()
    setResult(null)
  }

  return (
    <div className="w-full md:flex-1 md:overflow-y-auto bg-gray-50 pb-24 md:pb-6">
      <div className="w-full max-w-[430px] md:max-w-2xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4">

        {/* ── 標題 ──────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
            <IconMap size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-800">使用分區查詢</h2>
            <p className="text-xs text-gray-500">台中市都市計畫GIS — 依 WGS84 座標查詢建蔽率、容積率</p>
          </div>
          <DataSourceBadge status={gisReady ? 'IMPORTED_GIS' : 'MOCK'} />
        </div>

        {/* ── GIS 資料狀態列 ──────────────────────────────── */}
        {gisReady ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-green-800">✓ GIS 資料已載入</div>
              {gisMeta && (
                <div className="text-xs text-green-600 mt-0.5">
                  {gisMeta.sourceFile} · {gisMeta.featuresCount.toLocaleString()} 個分區 · 匯入於 {gisMeta.importedAt.slice(0, 10)}
                </div>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setShowImport(v => !v)}
                className="text-xs text-green-700 border border-green-300 rounded-lg px-3 py-1.5 hover:bg-green-100 transition-colors"
              >
                重新匯入
              </button>
              <button
                onClick={handleClearGIS}
                className="text-xs text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors"
              >
                清除
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4">
            <div className="flex items-start gap-3">
              <IconWarning size={16} className="text-orange-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-orange-800">尚未匯入 GIS 資料</div>
                <div className="text-xs text-orange-600 mt-0.5 leading-relaxed">
                  查詢功能需先匯入台中市都市計畫 GeoJSON 檔案。<br />
                  系統目前<span className="font-bold">不使用假資料</span>，請下載官方 GeoJSON 後匯入。
                </div>
              </div>
              <button
                onClick={() => setShowImport(v => !v)}
                className="text-xs text-orange-700 border border-orange-300 rounded-lg px-3 py-1.5 hover:bg-orange-100 transition-colors shrink-0"
              >
                {showImport ? '收起' : '立即匯入'}
              </button>
            </div>
          </div>
        )}

        {/* ── GeoJSON 匯入面板 ─────────────────────────────── */}
        {(showImport || !gisReady) && (
          <GeoJSONImportPanel
            onImported={() => {
              refreshGisState()
              setShowImport(false)
            }}
          />
        )}

        {/* ── 查詢模式切換 ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-1.5 flex gap-1">
          {/* 座標查詢（主要功能） */}
          <button
            onClick={() => { setQueryMode('coordinate'); setResult(null) }}
            className={`flex-1 h-9 rounded-xl text-sm font-semibold transition-colors ${
              queryMode === 'coordinate'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ✓ 依座標查詢
          </button>
          {/* 地號查詢（需申請 NLSC 授權） */}
          <button
            onClick={() => { setQueryMode('parcel'); setResult(null) }}
            className={`flex-1 h-9 rounded-xl text-sm font-semibold transition-colors ${
              queryMode === 'parcel'
                ? 'bg-gray-200 text-gray-600 shadow-sm'
                : 'text-gray-400 hover:text-gray-500'
            }`}
          >
            地號查詢 🔒
          </button>
        </div>

        {/* ── 查詢表單 ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">

          {queryMode === 'parcel' ? (
            /* ── 地號查詢：需申請 NLSC 授權，目前不可用 ── */
            <div className="space-y-3">
              {/* 主要說明卡 */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-lg shrink-0">🔒</span>
                  <div>
                    <div className="text-sm font-semibold text-amber-800">地號查詢目前不可用</div>
                    <div className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                      地號查詢需呼叫內政部 NLSC <strong>CAD_004</strong>「地段號查詢坐標」API，
                      此 API 採用 <strong>IP 白名單授權機制</strong>，必須向 NLSC 申請固定伺服器 IP 綁定。
                    </div>
                  </div>
                </div>

                {/* 技術限制說明 */}
                <div className="bg-amber-100/60 rounded-lg px-3 py-2.5 space-y-1.5 text-xs text-amber-700">
                  <div className="font-semibold text-amber-800">為何在 Vercel 上不可行？</div>
                  <div className="flex items-start gap-1.5">
                    <span className="shrink-0 mt-0.5">•</span>
                    <span>NLSC CAD_004 使用 <strong>IP 白名單</strong>（非 Bearer Token），授權與伺服器固定 IP 綁定</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="shrink-0 mt-0.5">•</span>
                    <span>Vercel Serverless 的出口 IP 為<strong>動態浮動</strong>，無法向 NLSC 申請白名單</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="shrink-0 mt-0.5">•</span>
                    <span>若部署於<strong>固定 IP 的自架伺服器</strong>，可向 NLSC 申請 IP 綁定後啟用</span>
                  </div>
                </div>
              </div>

              {/* 申請資訊 */}
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 space-y-2 text-xs">
                <div className="font-semibold text-gray-700">NLSC API 申請資訊</div>
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-gray-600">
                  <span className="text-gray-400">API 代號</span>
                  <span className="font-mono">CAD_004（地段號查詢坐標）</span>
                  <span className="text-gray-400">授權機制</span>
                  <span>IP 白名單綁定（非 Token）</span>
                  <span className="text-gray-400">申請對象</span>
                  <span>政府機關（免費）/ 民營機構（年訂閱制）</span>
                  <span className="text-gray-400">官方文件</span>
                  <a
                    href="https://maps.nlsc.gov.tw/S09SOA/homePage.action?Language=ZH"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800 break-all"
                  >
                    maps.nlsc.gov.tw/S09SOA
                  </a>
                  <span className="text-gray-400">聯絡電話</span>
                  <span>(04) 2252-2966 分機 256</span>
                </div>
              </div>

              {/* 替代方案提示 */}
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-xs text-green-700">
                <span className="font-semibold">✓ 替代方案：</span>使用 Google Maps 或地籍圖資網路便民服務系統查詢地號座標後，
                切換至「<button className="underline font-semibold" onClick={() => setQueryMode('coordinate')}>依座標查詢</button>」直接輸入 WGS84 座標。
              </div>
            </div>
          ) : (
            <>
              {/* 座標輸入（WGS84） */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  WGS84 座標 <span className="text-red-500">*</span>
                </label>
                <div className="mt-1.5 text-xs text-gray-400 mb-2">
                  可使用 Google Maps 右鍵點位取得座標（緯度, 經度）
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">經度（Longitude）</div>
                    <input
                      type="number"
                      value={lng}
                      onChange={e => setLng(e.target.value)}
                      placeholder="120.6736"
                      step="0.000001"
                      className="w-full h-11 px-3 rounded-xl border border-gray-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">緯度（Latitude）</div>
                    <input
                      type="number"
                      value={lat}
                      onChange={e => setLat(e.target.value)}
                      placeholder="24.1477"
                      step="0.000001"
                      className="w-full h-11 px-3 rounded-xl border border-gray-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 leading-relaxed">
                座標查詢直接進行 Point-in-Polygon 比對，不需要 NLSC API。<br />
                資料來源：已匯入的 GeoJSON（IMPORTED_GIS）
              </div>
            </>
          )}

          {/* 查詢按鈕（僅座標模式顯示） */}
          {queryMode === 'coordinate' && (
            <>
              <button
                onClick={handleQuery}
                disabled={!canQueryCoord}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    查詢中…
                  </>
                ) : (
                  <>
                    <IconSearch size={16} />
                    查詢此座標分區
                  </>
                )}
              </button>

              {!gisReady && (
                <p className="text-xs text-orange-500 text-center">
                  ⚠ 請先匯入 GeoJSON 資料才能查詢
                </p>
              )}
            </>
          )}
        </div>

        {/* ── 查詢結果 ─────────────────────────────────────── */}
        {result && (
          <div className="space-y-4">

            {/* 查無資料 */}
            {!result.zoning && (
              <div className="bg-white rounded-2xl border border-orange-200 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <IconWarning size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">查無分區資料</div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {result.error ?? '查無資料，請確認輸入是否正確。'}
                    </p>
                    <div className="text-xs text-gray-400 mt-2">
                      資料來源：{result.source}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 有分區資料 */}
            {result.zoning && (() => {
              const z = result.zoning!
              const sourceStatus = result.confidence === 'high' ? 'IMPORTED_GIS' : 'MOCK'
              return (
                <>
                  {/* 分區主卡 */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    {/* 頭部 */}
                    <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="mb-2">
                            <DataSourceBadge status={sourceStatus} />
                          </div>
                          <h3 className="text-white text-xl font-bold leading-tight">{z.zone_name}</h3>
                          <div className="text-blue-200 text-sm mt-0.5">簡稱：{z.zone_short_name}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-blue-200 text-xs">WGS84</div>
                          <div className="text-white font-mono text-xs">{parseFloat(lat).toFixed(5)}</div>
                          <div className="text-blue-300 font-mono text-xs">{parseFloat(lng).toFixed(5)}</div>
                        </div>
                      </div>
                    </div>

                    {/* 建蔽率 / 容積率 */}
                    <div className="px-5 py-4 border-b border-gray-100">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">法定限制</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-center">
                          <div className="text-2xl font-bold text-red-700">{z.coverage_ratio}%</div>
                          <div className="text-xs text-red-600 font-medium mt-0.5">建蔽率上限</div>
                        </div>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-center">
                          <div className="text-2xl font-bold text-blue-700">{z.floor_area_ratio}%</div>
                          <div className="text-xs text-blue-600 font-medium mt-0.5">容積率上限</div>
                          {z.max_far && (
                            <div className="text-xs text-blue-400 mt-0.5">（含獎勵上限 {z.max_far}%）</div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 space-y-2.5">
                        <RatioBar label="建蔽率" value={z.coverage_ratio} max={80} color="bg-red-500" />
                        <RatioBar label="容積率" value={z.floor_area_ratio} max={900} color="bg-blue-500" />
                      </div>
                    </div>

                    {/* 計畫資訊 */}
                    <div className="px-5 py-4 border-b border-gray-100">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">計畫資訊</div>
                      <DataRow label="都市計畫區" value={z.urban_plan_name} accent />
                      <DataRow label="細部計畫區" value={z.detail_plan_name || '—'} />
                      {z.project_name && <DataRow label="計畫案名" value={z.project_name} />}
                      {z.announcement_no && <DataRow label="公告文號" value={z.announcement_no} mono />}
                    </div>

                    {/* 備註 */}
                    {z.note && (
                      <div className="px-5 py-3 border-b border-gray-100 bg-amber-50">
                        <div className="flex items-start gap-2">
                          <IconInfo size={14} className="text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-700 leading-relaxed">{z.note}</p>
                        </div>
                      </div>
                    )}

                    {/* 資料來源 */}
                    <div className="px-5 py-3 bg-gray-50">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>來源：{result.source}</span>
                        {z.updated_at && <span>更新：{z.updated_at}</span>}
                      </div>
                    </div>
                  </div>

                  {/* 帶入法規檢核 */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="text-sm font-bold text-gray-800 mb-1">帶入法規檢核</div>
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                      系統將自動填入：行政區、都市計畫區、使用分區。<br />
                      請在法規檢核頁面補填建築資料後執行檢核。
                    </p>

                    <div className="space-y-1.5 mb-4">
                      {[
                        { label: '行政區',    value: result.parcel.district || z.district },
                        { label: '都市計畫區', value: z.suggested_plan_area_id ?? 'general_taichung' },
                        { label: '使用分區',   value: z.zone_short_name },
                        { label: '建蔽率',     value: `${z.coverage_ratio}%` },
                        { label: '容積率',     value: `${z.floor_area_ratio}%` },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5">
                          <IconCheck size={12} className="text-blue-500 shrink-0" />
                          <span className="text-xs text-blue-700 font-medium">{item.label}：{item.value}</span>
                        </div>
                      ))}
                    </div>

                    {applied ? (
                      <div className="w-full h-12 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center gap-2 text-green-700 font-semibold text-sm">
                        <IconCheck size={16} />
                        已帶入法規檢核 — 請切換至「法規檢核」頁面
                      </div>
                    ) : (
                      <button
                        onClick={handleApply}
                        className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <IconDoc size={16} />
                        一鍵帶入法規檢核 →
                      </button>
                    )}
                  </div>
                </>
              )
            })()}
          </div>
        )}

        {/* ── Adapter 狀態（Debug） ──────────────────────────── */}
        <details className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <summary className="px-5 py-3 text-xs font-semibold text-gray-400 cursor-pointer hover:text-gray-600">
            Adapter 狀態（開發除錯）
          </summary>
          <div className="px-5 pb-4 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-gray-600">TaichungUrbanPlanAdapter</span>
                <span className="text-gray-400 ml-2">台中市都市計畫GIS PIP 查詢</span>
              </div>
              <span className={`font-semibold px-2 py-0.5 rounded ${
                gisReady ? 'text-green-700 bg-green-50' : 'text-gray-400 bg-gray-100'
              }`}>
                {gisReady ? '✓ 可用' : '— 待匯入'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-gray-600">NLSCParcelAdapter</span>
                <span className="text-gray-400 ml-2">CAD_004 地段號查詢坐標</span>
              </div>
              <span className="font-semibold px-2 py-0.5 rounded text-gray-400 bg-gray-100">
                — 停用
              </span>
            </div>
            <div className="text-gray-400 pt-1 border-t border-gray-100 leading-relaxed">
              NLSCParcelAdapter 停用原因：CAD_004 採 IP 白名單授權，Vercel 動態出口 IP 不支援。
              如需啟用，請部署至固定 IP 伺服器並向 NLSC 申請綁定。
            </div>
          </div>
        </details>

      </div>
    </div>
  )
}
