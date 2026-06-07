import { ImageResponse } from 'next/og'
export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(<IconC size={512} />, { width: 512, height: 512 })
}

/** PWA Icon 512×512 — 方案 C YF 精品企業風 */
function IconC({ size: s }: { size: number }) {
  const GOLD = '#D6A85A'
  const barH = s * 0.06
  const barW = s * 0.48
  const barX = (s - barW) / 2
  const barY = s * 0.72

  return (
    <div style={{
      width: s, height: s,
      background: 'linear-gradient(145deg, #1B3A8A 0%, #0E2259 55%, #070F2B 100%)',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        display: 'flex', alignItems: 'baseline',
        gap: s * 0.02,
        marginTop: -(s * 0.06),
      }}>
        <div style={{
          color: '#FFFFFF',
          fontSize: s * 0.58,
          fontWeight: '900',
          fontFamily: 'Georgia, "Times New Roman", serif',
          lineHeight: 1,
          letterSpacing: '-0.04em',
        }}>Y</div>
        <div style={{
          color: '#FFFFFF',
          fontSize: s * 0.58,
          fontWeight: '900',
          fontFamily: 'Georgia, "Times New Roman", serif',
          lineHeight: 1,
          letterSpacing: '-0.04em',
          opacity: 0.88,
        }}>F</div>
      </div>
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
