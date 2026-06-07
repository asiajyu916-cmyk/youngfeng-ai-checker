import { ImageResponse } from 'next/og'
export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(<IconA size={512} />, { width: 512, height: 512 })
}

/**
 * 方案 A — 主塔 + 基座量體 + 金色檢核徽章
 *
 * 設計語言：Autodesk Forma / Procore
 * ─ 高層主塔（tower）+ 寬基座（podium）＝ 現代商辦 / 集合住宅量體
 * ─ 白色輪廓線稿，無窗格，無屋頂，無居住感
 * ─ 金色圓形徽章：法規檢核通過印記
 * ─ 禁止：YF 文字、房屋圖、卡通感
 */
function IconA({ size: s }: { size: number }) {
  const BG   = '#0A1F44'
  const W    = '#FFFFFF'
  const GOLD = '#D4AF37'
  const DARK = '#060E1E'

  const st = Math.max(4, Math.round(s * 0.027))   // 線稿粗細

  // ── 主塔（垂直長矩形，左偏中，商辦塔樓比例）──
  const tW = Math.round(s * 0.240)   // 窄塔
  const tH = Math.round(s * 0.600)   // 高（60%）
  const tX = Math.round(s * 0.300)   // 水平置中左側
  const tY = Math.round(s * 0.080)   // 頂部留空

  // ── 基座（寬矮矩形，接主塔底部）──
  const pW = Math.round(s * 0.480)   // 比塔寬
  const pH = Math.round(s * 0.160)   // 矮
  const pX = Math.round(s * 0.150)   // 水平居中於塔
  const pY = tY + tH                  // 緊接主塔底部

  // ── 金色徽章（右側，底部對齊基座）──
  const bR  = Math.round(s * 0.130)
  const bCX = pX + pW + Math.round(s * 0.030) + bR
  const bCY = pY + pH - bR

  return (
    <div style={{
      width: s, height: s,
      background: BG,
      position: 'relative', display: 'flex',
    }}>

      {/* 地基線 */}
      <div style={{
        position: 'absolute',
        left: pX, top: pY + pH,
        width: bCX + bR - pX,
        height: Math.max(2, Math.round(st * 0.35)),
        background: W, opacity: 0.18,
      }} />

      {/* 基座輪廓 */}
      <div style={{
        position: 'absolute',
        left: pX, top: pY, width: pW, height: pH,
        border: `${st}px solid ${W}`,
        boxSizing: 'border-box',
      }} />

      {/* 主塔輪廓（平屋頂，無細節）*/}
      <div style={{
        position: 'absolute',
        left: tX, top: tY, width: tW, height: tH,
        border: `${st}px solid ${W}`,
        boxSizing: 'border-box',
      }} />

      {/* 金色檢核徽章 */}
      <div style={{
        position: 'absolute',
        left: bCX - bR, top: bCY - bR,
        width: bR * 2, height: bR * 2,
        borderRadius: bR,
        background: GOLD,
        border: `${Math.round(st * 1.4)}px solid ${DARK}`,
        boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          color: W,
          fontSize: Math.round(bR * 0.92),
          fontWeight: '900',
          lineHeight: 1,
        }}>✓</div>
      </div>

    </div>
  )
}
