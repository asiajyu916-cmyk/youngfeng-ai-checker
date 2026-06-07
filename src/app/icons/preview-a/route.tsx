import { ImageResponse } from 'next/og'
export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(<IconA size={512} />, { width: 512, height: 512 })
}

/**
 * 方案 A — 建築輪廓 + Check
 *
 * 風格：Enterprise SaaS / Linear dark
 * 色調：深石板藍底，三棟白色建築輪廓，綠色打勾徽章
 * 重點：建築感 × 檢核感，手機桌面一眼辨識
 */
function IconA({ size: s }: { size: number }) {
  const BG    = '#0F172A'   // slate-900 深藍黑
  const WHITE = '#F1F5F9'   // 主建築色
  const DIM   = '#2D3F5A'   // 側棟暗色
  const GREEN = '#10B981'   // check 徽章綠

  const pad  = s * 0.13    // 左右 padding
  const bW   = s * 0.17    // 每棟建築寬度
  const gH   = s * 0.05    // 地面 bar 高度
  const gap  = (s - pad * 2 - bW * 3) / 2  // 棟間距

  // 各棟高度
  const h1 = s * 0.30   // 左棟
  const h2 = s * 0.54   // 中棟（最高）
  const h3 = s * 0.40   // 右棟

  // 建築 x 座標
  const x1 = pad
  const x2 = pad + bW + gap
  const x3 = pad + bW * 2 + gap * 2

  // Check 徽章
  const bd  = s * 0.28    // 徽章直徑
  const bmg = s * 0.07    // 徽章 margin

  return (
    <div style={{ width: s, height: s, background: BG, position: 'relative', display: 'flex' }}>

      {/* ── 地面 bar ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: pad * 0.5, right: pad * 0.5,
        height: gH, background: DIM,
      }} />

      {/* ── 左棟 ── */}
      <div style={{
        position: 'absolute', left: x1, bottom: gH,
        width: bW, height: h1, background: DIM,
      }} />

      {/* ── 中棟（主建築，白色）── */}
      <div style={{
        position: 'absolute', left: x2, bottom: gH,
        width: bW, height: h2, background: WHITE,
      }} />

      {/* ── 右棟 ── */}
      <div style={{
        position: 'absolute', left: x3, bottom: gH,
        width: bW, height: h3, background: DIM,
      }} />

      {/* ── Check 徽章（右上角）── */}
      <div style={{
        position: 'absolute', top: bmg, right: bmg,
        width: bd, height: bd,
        background: GREEN, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width={bd * 0.56} height={bd * 0.56} viewBox="0 0 24 24" fill="none">
          <path d="M4 13l5 5L20 7"
            stroke="white" strokeWidth="3.8"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

    </div>
  )
}
