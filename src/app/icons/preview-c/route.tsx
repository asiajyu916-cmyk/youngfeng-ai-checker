import { ImageResponse } from 'next/og'
export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(<IconC size={512} />, { width: 512, height: 512 })
}

/**
 * 方案 C — YF 精品企業風
 *
 * 風格：Stripe / Arc Browser / Linear
 * 色調：深藍漸層底，極大 YF 白字，金色底線
 * 重點：品牌辨識度最高，手機縮圖 50px 也能看清楚
 * 無裝飾、無圖示、純字型力量
 */
function IconC({ size: s }: { size: number }) {
  const GOLD  = '#D6A85A'
  const WHITE = '#FFFFFF'

  // 底線規格
  const barH = s * 0.06   // 底線厚（6%，夠粗）
  const barW = s * 0.48   // 底線寬
  const barX = (s - barW) / 2
  const barY = s * 0.72   // 底線 top

  return (
    <div style={{
      width: s, height: s,
      // Arc Browser 風深藍漸層
      background: 'linear-gradient(145deg, #1B3A8A 0%, #0E2259 55%, #070F2B 100%)',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>

      {/* ── YF 大字 ── */}
      <div style={{
        display: 'flex', alignItems: 'baseline',
        gap: s * 0.02,
        marginTop: -(s * 0.06),   // 微調垂直居中（補償底線）
      }}>
        <div style={{
          color: WHITE,
          fontSize: s * 0.58,
          fontWeight: '900',
          fontFamily: 'Georgia, "Times New Roman", serif',
          lineHeight: 1,
          letterSpacing: '-0.04em',
        }}>Y</div>
        <div style={{
          color: WHITE,
          fontSize: s * 0.58,
          fontWeight: '900',
          fontFamily: 'Georgia, "Times New Roman", serif',
          lineHeight: 1,
          letterSpacing: '-0.04em',
          opacity: 0.88,   // F 略暗，製造層次
        }}>F</div>
      </div>

      {/* ── 金色底線（建築基線感）── */}
      <div style={{
        position: 'absolute',
        top: barY, left: barX,
        width: barW, height: barH,
        background: `linear-gradient(90deg, transparent 0%, ${GOLD} 20%, ${GOLD} 80%, transparent 100%)`,
        borderRadius: barH,
      }} />

    </div>
  )
}
