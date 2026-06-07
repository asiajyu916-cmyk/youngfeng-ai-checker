import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(<YFIcon size={192} />, { width: 192, height: 192 })
}

/**
 * PWA Icon — 192×192
 *
 * 設計語言：
 *   - 深藍底（#0F2747）全出血，無 borderRadius，讓 Android/iOS 自行遮罩
 *   - 粗角括弧（厚度 8% icon size）替代舊細橫線
 *   - 大寫 YF：Y=金、F=白，字體 52% icon size
 *   - 無細線條，手機桌面辨識度優先
 */
function YFIcon({ size }: { size: number }) {
  const s    = size
  const gold = '#D6A85A'
  const bg   = '#0F2747'

  // 角括弧幾何（全部以 s 比例，避免細線）
  const br  = Math.round(s * 0.12)   // 括弧距邊緣
  const arm = Math.round(s * 0.22)   // 括弧臂長
  const tck = Math.round(s * 0.08)   // 括弧粗細（192px = 15px，夠粗）

  return (
    <div
      style={{
        width: s,
        height: s,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* ── 左上角括弧 ── */}
      <div style={{ position: 'absolute', top: br, left: br, width: arm, height: tck, background: gold }} />
      <div style={{ position: 'absolute', top: br, left: br, width: tck, height: arm, background: gold }} />

      {/* ── 右下角括弧 ── */}
      <div style={{ position: 'absolute', bottom: br, right: br, width: arm, height: tck, background: gold }} />
      <div style={{ position: 'absolute', bottom: br, right: br, width: tck, height: arm, background: gold }} />

      {/* ── YF 文字 ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: s * 0.01 }}>
        <div style={{
          color: gold,
          fontSize: s * 0.52,
          fontWeight: '900',
          fontFamily: 'Georgia, serif',
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}>Y</div>
        <div style={{
          color: '#FFFFFF',
          fontSize: s * 0.52,
          fontWeight: '900',
          fontFamily: 'Georgia, serif',
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}>F</div>
      </div>
    </div>
  )
}
