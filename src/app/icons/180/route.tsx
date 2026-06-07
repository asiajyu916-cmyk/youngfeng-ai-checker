import { ImageResponse } from 'next/og'
export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(<Icon size={180} />, { width: 180, height: 180 })
}

/** Apple Touch Icon 180×180 — 建築量體線稿 + 法規基準線 + 金色檢核徽章
 *  iOS 自動套用圓角遮罩，圖片保持方形全出血。
 */
function Icon({ size: s }: { size: number }) {
  const GOLD = '#C8911C'
  const WHITE = '#FFFFFF'
  const DARK = '#050E1C'
  const st = Math.max(3, Math.round(s * 0.030))

  const tW = Math.round(s * 0.42)
  const tH = Math.round(s * 0.65)
  const tX = Math.round(s * 0.08)
  const tY = Math.round(s * 0.175)

  const lineY = tY + Math.round(tH * 0.33)
  const lineH = Math.max(2, Math.round(s * 0.014))
  const lineX = tX + st
  const lineW = tW - st * 2

  const bR  = Math.round(s * 0.175)
  const bCX = tX + tW + Math.round(s * 0.045) + bR
  const bCY = tY + tH - bR

  const dot = Math.round(s * 0.088)

  return (
    <div style={{
      width: s, height: s,
      background: 'linear-gradient(150deg, #09183A 0%, #050E1C 100%)',
      position: 'relative', display: 'flex',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px)`,
        backgroundSize: `${dot}px ${dot}px`,
      }} />
      <div style={{
        position: 'absolute',
        left: tX, top: tY + tH,
        width: bCX + bR - tX,
        height: Math.max(2, Math.round(st * 0.40)),
        background: WHITE, opacity: 0.18, borderRadius: st,
      }} />
      <div style={{
        position: 'absolute',
        left: lineX, top: lineY,
        width: lineW, height: lineH,
        background: GOLD, opacity: 0.92,
      }} />
      <div style={{
        position: 'absolute',
        left: tX, top: tY, width: tW, height: tH,
        border: `${st}px solid ${WHITE}`,
        boxSizing: 'border-box',
      }} />
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
