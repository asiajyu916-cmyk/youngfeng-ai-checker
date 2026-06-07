import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(<YFIcon size={180} />, { width: 180, height: 180 })
}

/**
 * Apple Touch Icon — 180×180
 *
 * iOS 會自動套用圓角遮罩，圖片本身保持方形全出血。
 * 與 192/512 版本相同設計，括弧粗細 180 * 0.08 = 14px。
 */
function YFIcon({ size }: { size: number }) {
  const s    = size
  const gold = '#D6A85A'
  const bg   = '#0F2747'

  const br  = Math.round(s * 0.12)
  const arm = Math.round(s * 0.22)
  const tck = Math.round(s * 0.08)

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
