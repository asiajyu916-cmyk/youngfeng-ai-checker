import { ImageResponse } from 'next/og'
export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(<Icon size={192} />, { width: 192, height: 192 })
}

/**
 * PWA 192×192 — 現代集合住宅 / 商辦輪廓 + 金色檢核徽章
 * 風格參考：Autodesk, Bluebeam, Procore, TestFit
 * - 平屋頂（無退縮層），避免透天厝感
 * - 較寬的建築比例（50% icon 寬）
 * - 加粗筆畫（32px 仍可辨識）
 * - 3 欄 × 4 列窗格（現代辦公大樓網格）
 */
function Icon({ size: s }: { size: number }) {
  const GOLD = '#CFA045'
  const WHITE = '#FFFFFF'
  const DARK = '#040D18'

  // 筆畫粗細：加粗確保縮小後仍可見
  const st = Math.max(4, Math.round(s * 0.038))

  // ── 主塔（平屋頂，較寬）──
  const tW = Math.round(s * 0.50)
  const tH = Math.round(s * 0.62)
  const tX = Math.round(s * 0.07)
  const tY = Math.round(s * 0.19)

  // ── 金色徽章位置 ──
  const bR = Math.round(s * 0.175)
  const bCX = tX + tW + Math.round(s * 0.04) + bR
  const bCY = tY + tH - bR

  // ── 窗格 3 欄 × 4 列 ──
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

      {/* 地面線（視覺錨點） */}
      <div style={{
        position: 'absolute',
        left: tX, top: tY + tH,
        width: bCX + bR - tX,
        height: Math.max(2, Math.round(st * 0.5)),
        background: WHITE, opacity: 0.20, borderRadius: st,
      }} />

      {/* 建築輪廓：平屋頂矩形，無退縮層 */}
      <div style={{
        position: 'absolute',
        left: tX, top: tY, width: tW, height: tH,
        border: `${st}px solid ${WHITE}`,
        boxSizing: 'border-box',
      }} />

      {/* 窗格網格 */}
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

      {/* 金色檢核徽章 */}
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
