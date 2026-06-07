import { ImageResponse } from 'next/og'
export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(<Icon size={192} />, { width: 192, height: 192 })
}

/**
 * PWA 192×192 — 建築量體線稿 + 法規基準線 + 金色檢核徽章
 *
 * 設計語言：Autodesk Forma / TestFit / Bluebeam
 * ─ 白色輪廓量體：抽象建築形體，非具象房屋
 * ─ 金色水平線：法規限制基準（高度管制意象）
 * ─ 金色圓形徽章 ✓：法規檢核通過印記
 * ─ 微細點陣背景：技術圖紙 / ArcGIS 空間感
 * ─ 無窗格、無屋頂、無居住感
 */
function Icon({ size: s }: { size: number }) {
  const GOLD = '#C8911C'   // 深琥珀金：高端工具感，非首飾金
  const WHITE = '#FFFFFF'
  const DARK = '#050E1C'

  const st = Math.max(3, Math.round(s * 0.030))   // 筆畫粗細

  // ── 建築量體（高挑矩形，商辦 / 集合住宅比例）──
  const tW = Math.round(s * 0.42)
  const tH = Math.round(s * 0.65)
  const tX = Math.round(s * 0.08)
  const tY = Math.round(s * 0.175)

  // ── 法規基準線（量體上 1/3 處，暗示高度管制）──
  const lineY  = tY + Math.round(tH * 0.33)
  const lineH  = Math.max(2, Math.round(s * 0.014))
  const lineX  = tX + st
  const lineW  = tW - st * 2

  // ── 金色徽章 ──
  const bR  = Math.round(s * 0.175)
  const bCX = tX + tW + Math.round(s * 0.045) + bR
  const bCY = tY + tH - bR

  // 點陣網格間距
  const dot = Math.round(s * 0.088)

  return (
    <div style={{
      width: s, height: s,
      background: 'linear-gradient(150deg, #09183A 0%, #050E1C 100%)',
      position: 'relative', display: 'flex',
    }}>

      {/* 微細點陣背景（技術圖紙 / ArcGIS 空間感） */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px)`,
        backgroundSize: `${dot}px ${dot}px`,
      }} />

      {/* 地基線（量體與徽章共用基準） */}
      <div style={{
        position: 'absolute',
        left: tX, top: tY + tH,
        width: bCX + bR - tX,
        height: Math.max(2, Math.round(st * 0.40)),
        background: WHITE, opacity: 0.18, borderRadius: st,
      }} />

      {/* 法規基準線（金色水平線，建築量體 1/3 處） */}
      <div style={{
        position: 'absolute',
        left: lineX, top: lineY,
        width: lineW, height: lineH,
        background: GOLD, opacity: 0.92,
      }} />

      {/* 建築量體輪廓（白色，平屋頂，無任何窗格） */}
      <div style={{
        position: 'absolute',
        left: tX, top: tY, width: tW, height: tH,
        border: `${st}px solid ${WHITE}`,
        boxSizing: 'border-box',
      }} />

      {/* 金色檢核徽章 */}
      <div style={{
        position: 'absolute',
        left: bCX - bR, top: bCY - bR,
        width: bR * 2, height: bR * 2,
        borderRadius: bR,
        background: GOLD,
        border: `${Math.round(st * 1.25)}px solid ${DARK}`,
        boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          color: WHITE,
          fontSize: Math.round(bR * 0.88),
          fontWeight: '900',
          lineHeight: 1,
        }}>✓</div>
      </div>

    </div>
  )
}
