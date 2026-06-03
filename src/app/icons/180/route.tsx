import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(<YFIcon size={180} />, { width: 180, height: 180 })
}

function YFIcon({ size }: { size: number }) {
  const s = size
  const pad = s * 0.18
  const w = s - pad * 2

  return (
    <div
      style={{
        width: s,
        height: s,
        background: '#0F2747',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Gold horizontal rule top */}
      <div style={{
        position: 'absolute',
        top: s * 0.13,
        left: pad,
        width: w,
        height: s * 0.028,
        background: 'linear-gradient(90deg, #D6A85A, #F0C97A, #D6A85A)',
        borderRadius: 99,
      }} />

      {/* YF letterform */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: s * 0.018,
        marginTop: s * 0.04,
      }}>
        <div style={{
          color: '#D6A85A',
          fontSize: s * 0.46,
          fontWeight: '900',
          fontFamily: 'Georgia, serif',
          lineHeight: 1,
        }}>Y</div>
        <div style={{
          color: 'white',
          fontSize: s * 0.46,
          fontWeight: '900',
          fontFamily: 'Georgia, serif',
          lineHeight: 1,
        }}>F</div>
      </div>

      {/* Gold horizontal rule bottom */}
      <div style={{
        position: 'absolute',
        bottom: s * 0.13,
        left: pad,
        width: w,
        height: s * 0.028,
        background: 'linear-gradient(90deg, #D6A85A, #F0C97A, #D6A85A)',
        borderRadius: 99,
      }} />
    </div>
  )
}
