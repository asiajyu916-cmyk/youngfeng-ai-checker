import { ImageResponse } from 'next/og'
export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(<Icon size={192} />, { width: 192, height: 192 })
}

/** PWA 192×192 — 建築輪廓 + 金色檢核徽章 */
function Icon({ size: s }: { size: number }) {
  const GOLD = '#CFA045'
  const WHITE = '#FFFFFF'
  const DARK = '#040D18'
  const st = Math.max(3, Math.round(s * 0.026)) // stroke width

  // ── 主塔 ──
  const tW = Math.round(s * 0.42)
  const tH = Math.round(s * 0.56)
  const tX = Math.round(s * 0.10)
  const tY = Math.round(s * 0.27)

  // ── 頂部退縮層 (penthouse) ──
  const pW = Math.round(tW * 0.58)
  const pH = Math.round(s * 0.10)
  const pX = tX + Math.round((tW - pW) / 2)
  const pY = tY - pH

  // ── 金色徽章 ──
  const bR = Math.round(s * 0.17)
  const bCX = tX + tW + Math.round(s * 0.04) + bR
  const bCY = tY + tH - bR

  // ── 窗格 2 欄 × 3 列 ──
  const wC = 2, wR = 3
  const wPad = Math.round(s * 0.038)
  const wW = Math.round((tW - st * 2 - wPad * (wC + 1)) / wC)
  const wH = Math.round((tH * 0.66 - st - wPad * (wR + 1)) / wR)

  return (
    <div style={{
      width: s, height: s,
      background: 'linear-gradient(145deg, #0C1C47 0%, #040D18 100%)',
      position: 'relative', display: 'flex',
    }}>
      {/* 地面線 */}
      <div style={{
        position: 'absolute',
        left: tX, top: tY + tH,
        width: bCX + bR - tX,
        height: Math.max(2, Math.round(st * 0.6)),
        background: WHITE, opacity: 0.25, borderRadius: st,
      }} />

      {/* 退縮層輪廓 */}
      <div style={{
        position: 'absolute',
        left: pX, top: pY, width: pW, height: pH,
        border: `${st}px solid ${WHITE}`, boxSizing: 'border-box',
      }} />

      {/* 主塔輪廓 */}
      <div style={{
        position: 'absolute',
        left: tX, top: tY, width: tW, height: tH,
        border: `${st}px solid ${WHITE}`, boxSizing: 'border-box',
      }} />

      {/* 窗格 */}
      {Array.from({ length: wR * wC }).map((_, i) => {
        const r = Math.floor(i / wC), c = i % wC
        return (
          <div key={i} style={{
            position: 'absolute',
            left: tX + st + wPad + c * (wW + wPad),
            top: tY + st + wPad + r * (wH + wPad),
            width: wW, height: wH,
            background: WHITE, opacity: 0.20,
          }} />
        )
      })}

      {/* 金色檢核徽章 */}
      <div style={{
        position: 'absolute',
        left: bCX - bR, top: bCY - bR,
        width: bR * 2, height: bR * 2,
        borderRadius: bR,
        background: GOLD,
        border: `${Math.round(st * 1.8)}px solid ${DARK}`,
        boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          color: WHITE,
          fontSize: Math.round(bR * 0.90),
          fontWeight: '900',
          lineHeight: 1,
        }}>✓</div>
      </div>
    </div>
  )
}
