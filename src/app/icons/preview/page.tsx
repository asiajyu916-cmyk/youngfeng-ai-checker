/**
 * /icons/preview — Icon 方案比對頁
 * 不需登入，純靜態預覽。
 * 顯示三個方案在不同尺寸下的視覺效果。
 */
export const metadata = { title: 'Icon 方案預覽' }

const OPTIONS = [
  {
    id: 'A',
    src: '/icons/preview-a',
    label: '方案 A',
    subtitle: '建築輪廓 + Check',
    desc: '三棟建築輪廓 + 綠色打勾徽章\nEnterprise SaaS / Linear 風',
  },
  {
    id: 'B',
    src: '/icons/preview-b',
    label: '方案 B',
    subtitle: '簡約高樓 + AI',
    desc: '單一電藍高樓 + AI 節點光點\nNotion / Minimal SaaS 風',
  },
  {
    id: 'C',
    src: '/icons/preview-c',
    label: '方案 C',
    subtitle: 'YF 精品企業風',
    desc: '深藍漸層底 + 極大 YF 白字\nStripe / Arc Browser 風',
  },
]

export default function IconPreviewPage() {
  return (
    <html lang="zh-TW">
      <body style={{ margin: 0, padding: 0, background: '#111827', fontFamily: 'system-ui, sans-serif', color: '#F9FAFB' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>

          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>永豐 AI — PWA Icon 方案選擇</h1>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 48 }}>
            請選擇偏好方案，告知後將套用至正式圖示（192 / 512 / apple-touch-icon）
          </p>

          {/* 三方案主展示 */}
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 64 }}>
            {OPTIONS.map(opt => (
              <div key={opt.id} style={{ flex: '1 1 240px' }}>
                <div style={{ background: '#1F2937', borderRadius: 16, padding: 24, border: '1px solid #374151' }}>
                  {/* 512 size preview */}
                  <img
                    src={opt.src}
                    alt={opt.label}
                    width={180}
                    height={180}
                    style={{ borderRadius: 24, display: 'block', margin: '0 auto' }}
                  />
                  <div style={{ marginTop: 20, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{opt.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#F9FAFB', marginTop: 4 }}>{opt.subtitle}</div>
                    <div style={{ fontSize: 13, color: '#6B7280', marginTop: 8, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{opt.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 小尺寸模擬（手機桌面效果） */}
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#D1D5DB' }}>手機桌面縮圖模擬（60 × 60 px）</h2>
          <div style={{ background: '#374151', borderRadius: 16, padding: '24px 32px', display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            {OPTIONS.map(opt => (
              <div key={opt.id} style={{ textAlign: 'center' }}>
                <img
                  src={opt.src}
                  alt={opt.label}
                  width={60}
                  height={60}
                  style={{ borderRadius: 13, display: 'block' }}
                />
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>方案 {opt.id}</div>
              </div>
            ))}
          </div>

          {/* 超小尺寸（favicon 效果） */}
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#D1D5DB' }}>Favicon 模擬（32 × 32 px）</h2>
          <div style={{ background: '#374151', borderRadius: 16, padding: '24px 32px', display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
            {OPTIONS.map(opt => (
              <div key={opt.id} style={{ textAlign: 'center' }}>
                <img
                  src={opt.src}
                  alt={opt.label}
                  width={32}
                  height={32}
                  style={{ borderRadius: 6, display: 'block' }}
                />
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>方案 {opt.id}</div>
              </div>
            ))}
          </div>

          <p style={{ marginTop: 48, fontSize: 13, color: '#4B5563' }}>
            確認方案後告知「套用方案 A/B/C」，即可更新正式 PWA icon。
          </p>
        </div>
      </body>
    </html>
  )
}
