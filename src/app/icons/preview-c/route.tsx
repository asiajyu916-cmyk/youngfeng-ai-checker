import { ImageResponse } from 'next/og'
export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(<IconC size={512} />, { width: 512, height: 512 })
}

/**
 * 方案 C — 極簡建築量體 + 超大金色勾勾
 *
 * 設計語言：Bluebeam / Linear / Arc Browser
 * ─ 單一白色輪廓量體（建築形體），左側
 * ─ 超大金色 ✓ 為主視覺元素，與量體形成對話
 * ─ 最大限度負空間，頂級質感
 * ─ 不需圓形徽章：勾勾本身即印記
 * ─ 縮至 32px 仍可辨：量體 + 金色塊
 */
function IconC({ size: s }: { size: number }) {
  const BG   = '#0A1F44'
  const W    = '#FFFFFF'
  const GOLD = '#D4AF37'

  const st = Math.max(4, Math.round(s * 0.028))

  // ── 建築量體（左側，高挑矩形，商辦比例）──
  const tW = Math.round(s * 0.340)
  const tH = Math.round(s * 0.660)
  const tX = Math.round(s * 0.075)
  const tY = Math.round(s * 0.170)

  // ── 超大金色 ✓（右側，從量體右半延伸至邊界）──
  // 字體大小 = 50% of s，使其成為主視覺
  const checkSize = Math.round(s * 0.520)
  // 水平位置：量體右邊的 40% 寬度起算（略微疊入量體）
  const checkX = Math.round(tX + tW * 0.52)
  // 垂直位置：居中偏下
  const checkY = Math.round(s * 0.280)

  return (
    <div style={{
      width: s, height: s,
      background: BG,
      position: 'relative', display: 'flex',
    }}>

      {/* 地基線 */}
      <div style={{
        position: 'absolute',
        left: tX, top: tY + tH,
        width: s - tX - Math.round(s * 0.05),
        height: Math.max(2, Math.round(st * 0.40)),
        background: W, opacity: 0.15,
      }} />

      {/* 建築量體輪廓（無窗格，純線稿）*/}
      <div style={{
        position: 'absolute',
        left: tX, top: tY, width: tW, height: tH,
        border: `${st}px solid ${W}`,
        boxSizing: 'border-box',
      }} />

      {/* 超大金色勾勾（主視覺印記）*/}
      <div style={{
        position: 'absolute',
        left: checkX, top: checkY,
        color: GOLD,
        fontSize: checkSize,
        fontWeight: '900',
        fontFamily: '"Arial Black", Arial, sans-serif',
        lineHeight: 1,
      }}>✓</div>

    </div>
  )
}
