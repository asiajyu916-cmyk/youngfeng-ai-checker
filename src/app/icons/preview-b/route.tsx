import { ImageResponse } from 'next/og'
export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(<IconB size={512} />, { width: 512, height: 512 })
}

/**
 * 方案 B — 簡約高樓 + AI
 *
 * 風格：Notion / Minimal SaaS
 * 色調：極深夜藍底，單一電藍高樓，頂部三個 AI 節點光點
 * 重點：科技感 × 建築感，乾淨俐落
 */
function IconB({ size: s }: { size: number }) {
  const BG       = '#060C18'   // 幾乎全黑的深夜藍
  const TOWER    = '#2563EB'   // 電藍高樓
  const TOWER_HI = '#60A5FA'   // 高樓頂部略亮
  const DOT      = '#93C5FD'   // AI 節點（明亮藍）
  const GROUND   = '#1E3A5F'   // 地面

  const tW = s * 0.32    // 高樓寬
  const tH = s * 0.60    // 高樓高
  const gH = s * 0.04    // 地面高
  const tX = (s - tW) / 2  // 高樓水平居中

  // 高樓：下半 TOWER，頂部 20% 用略亮色分層感
  const splitH = tH * 0.25   // 頂部分層高度
  const bodyH  = tH - splitH

  // AI 節點：三個圓，在高樓上方
  const dotD   = s * 0.065   // 節點直徑
  const dotGap = s * 0.08    // 節點間距
  const dotY   = s * 0.09    // 節點 top 距離
  const dotCenterX = s / 2
  const dotPositions = [
    dotCenterX - dotGap - dotD / 2,
    dotCenterX - dotD / 2,
    dotCenterX + dotGap - dotD / 2,
  ]

  // 節點連線（用細長矩形代替 — 寬=間距，高=2%）
  // 避免「細線條」：連線改用較寬的矩形（4%厚）
  const lineH  = s * 0.025
  const lineY  = dotY + dotD / 2 - lineH / 2

  return (
    <div style={{ width: s, height: s, background: BG, position: 'relative', display: 'flex' }}>

      {/* ── 地面 ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: s * 0.08, right: s * 0.08,
        height: gH, background: GROUND,
      }} />

      {/* ── 高樓主體 ── */}
      <div style={{
        position: 'absolute', left: tX, bottom: gH,
        width: tW, height: bodyH, background: TOWER,
      }} />

      {/* ── 高樓頂部（略亮層）── */}
      <div style={{
        position: 'absolute', left: tX, bottom: gH + bodyH,
        width: tW, height: splitH, background: TOWER_HI,
      }} />

      {/* ── AI 節點連線 ── */}
      <div style={{
        position: 'absolute',
        top: lineY,
        left: dotPositions[0] + dotD / 2,
        width: dotPositions[2] - dotPositions[0],
        height: lineH,
        background: DOT,
        opacity: 0.35,
      }} />

      {/* ── 三個 AI 節點 ── */}
      {dotPositions.map((x, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: dotY,
          left: x,
          width: dotD,
          height: dotD,
          background: i === 1 ? '#FFFFFF' : DOT,   // 中間節點最亮
          borderRadius: '50%',
        }} />
      ))}

    </div>
  )
}
