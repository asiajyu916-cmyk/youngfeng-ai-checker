import { ImageResponse } from 'next/og'
export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(<Icon size={512} />, { width: 512, height: 512 })
}

/** PWA 512×512 — 現代集合住宅 / 商辦輪廓 + 金色檢核徽章 */
function Icon({ size: s }: { size: number }) {
  const GOLD = '#CFA045'
  const WHITE = '#FFFFFF'
  const DARK = '#040D18'
  const st = Math.max(4, Math.round(s * 0.038))

  const tW = Math.round(s * 0.50)
  const tH = Math.round(s * 0.62)
  const tX = Math.round(s * 0.07)
  const tY = Math.round(s * 0.19)

  const bR = Math.round(s * 0.175)
  const bCX = tX + tW + Math.round(s * 0.04) + bR
  const bCY = tY + tH - bR

  const wC = 3, wR = 4
  const wPad = st
  const innerW = tW - st * 2
  const innerH = Math.round(tH * 0.78) - st
  const wW = Math.round((innerW - wPad * (wC + 1)) / wC)
  const wH = Math.round((innerH - wPad * (wR + 1)) / wR)

  return (
    <div style={{
      width: s, height: s,
      background: 'linear-gradient(145deg, #0B1A42 0%, #040D18 100%)',
      position: 'relative', display: 'flex',
    }}>
      <div style={{
        position: 'absolute',
        left: tX, top: tY + tH,
        width: bCX + bR - tX,
        height: Math.max(2, Math.round(st * 0.5)),
        background: WHITE, opacity: 0.20, borderRadius: st,
      }} />
      <div style={{
        position: 'absolute',
        left: tX, top: tY, width: tW, height: tH,
        border: `${st}px solid ${WHITE}`,
        boxSizing: 'border-box',
      }} />
      {Array.from({ length: wR * wC }).map((_, i) => {
        const r = Math.floor(i / wC), c = i % wC
        return (
          <div key={i} style={{
            position: 'absolute',
            left: tX + st + wPad + c * (wW + wPad),
            top: tY + st + wPad + r * (wH + wPad),
            width: wW, height: wH,
            background: WHITE, opacity: 0.22,
          }} />
        )
      })}
      <div style={{
        position: 'absolute',
        left: bCX - bR, top: bCY - bR,
        width: bR * 2, height: bR * 2,
        borderRadius: bR,
        background: GOLD,
        border: `${Math.round(st * 1.2)}px solid ${DARK}`,
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
