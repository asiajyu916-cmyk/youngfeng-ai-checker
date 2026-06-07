import { ImageResponse } from 'next/og'
export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(<IconB size={512} />, { width: 512, height: 512 })
}

/**
 * 方案 B — 建築藍圖平面圖 + 金色檢核徽章
 *
 * 設計語言：ArcGIS / Bluebeam / AutoCAD
 * ─ 建築平面圖（top-down view）：外框 + 內部隔間牆線
 * ─ 細線稿風格（薄 stroke），純建築技術圖感
 * ─ 絕對不像住宅：平面圖 = 建築師工具的視覺語言
 * ─ 金色圓形徽章：法規檢核通過印記
 */
function IconB({ size: s }: { size: number }) {
  const BG   = '#0A1F44'
  const W    = '#FFFFFF'
  const GOLD = '#D4AF37'
  const DARK = '#060E1E'

  const stOut = Math.max(3, Math.round(s * 0.020))   // 外牆線
  const stIn  = Math.max(2, Math.round(s * 0.010))   // 內牆線

  // ── 建築平面圖外框 ──
  const fX = Math.round(s * 0.095)
  const fY = Math.round(s * 0.110)
  const fW = Math.round(s * 0.540)
  const fH = Math.round(s * 0.660)

  // ── 內部隔間（模擬真實平面圖房間劃分）──
  // 垂直主廊道：fX + 58% 位置
  const vX = fX + Math.round(fW * 0.580)
  // 水平分隔：fY + 52% 位置（左側大空間 vs 右上右下）
  const hY = fY + Math.round(fH * 0.520)

  // ── 金色徽章（右下，外框右側）──
  const bR  = Math.round(s * 0.125)
  const bCX = fX + fW + Math.round(s * 0.028) + bR
  const bCY = fY + fH - bR

  return (
    <div style={{
      width: s, height: s,
      background: BG,
      position: 'relative', display: 'flex',
    }}>

      {/* ── 平面圖外框 ── */}
      <div style={{
        position: 'absolute',
        left: fX, top: fY, width: fW, height: fH,
        border: `${stOut}px solid ${W}`,
        boxSizing: 'border-box',
      }} />

      {/* ── 垂直主廊道牆（全高，創建左大空間 + 右兩房）── */}
      <div style={{
        position: 'absolute',
        left: vX, top: fY + stOut,
        width: stIn, height: fH - stOut * 2,
        background: W,
      }} />

      {/* ── 水平分隔牆（僅右半部，分右上 / 右下）── */}
      <div style={{
        position: 'absolute',
        left: vX, top: hY,
        width: fX + fW - vX - stOut, height: stIn,
        background: W,
      }} />

      {/* ── 開口缺口（模擬門洞，左側牆）── */}
      {/* 左大空間→廊道 門洞：在 hY 附近 */}
      <div style={{
        position: 'absolute',
        left: vX, top: hY - Math.round(s * 0.055),
        width: stIn, height: Math.round(s * 0.055),
        background: BG,   // 用背景色蓋住牆線 = 製造缺口
      }} />

      {/* ── 量尺標記線（左側，建築圖說感）── */}
      {[0.25, 0.50, 0.75].map((ratio, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: fX - Math.round(s * 0.028),
          top: fY + Math.round(fH * ratio),
          width: Math.round(s * 0.022),
          height: stIn,
          background: W, opacity: 0.45,
        }} />
      ))}

      {/* ── 量尺標記線（上側）── */}
      {[0.30, 0.58].map((ratio, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: fX + Math.round(fW * ratio),
          top: fY - Math.round(s * 0.028),
          width: stIn,
          height: Math.round(s * 0.022),
          background: W, opacity: 0.45,
        }} />
      ))}

      {/* ── 北方標記（N + 方向線）── */}
      <div style={{
        position: 'absolute',
        left: Math.round(s * 0.075),
        top: Math.round(s * 0.800),
        color: W, opacity: 0.55,
        fontSize: Math.round(s * 0.046),
        fontWeight: '700',
        fontFamily: 'Arial, sans-serif',
        lineHeight: 1,
      }}>N↑</div>

      {/* 金色檢核徽章 */}
      <div style={{
        position: 'absolute',
        left: bCX - bR, top: bCY - bR,
        width: bR * 2, height: bR * 2,
        borderRadius: bR,
        background: GOLD,
        border: `${Math.round(stOut * 1.6)}px solid ${DARK}`,
        boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          color: W,
          fontSize: Math.round(bR * 0.90),
          fontWeight: '900',
          lineHeight: 1,
        }}>✓</div>
      </div>

    </div>
  )
}
