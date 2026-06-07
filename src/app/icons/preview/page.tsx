export const metadata = { title: 'PWA Icon 方案選擇' }

const OPTIONS = [
  {
    id: 'A',
    src: '/icons/preview-a',
    label: '方案 A',
    subtitle: '主塔 + 基座量體',
    desc: '高層主塔 + 寬基座\n現代商辦 / 集合住宅形體\nAutodesk Forma 風格',
  },
  {
    id: 'B',
    src: '/icons/preview-b',
    label: '方案 B',
    subtitle: '建築藍圖平面圖',
    desc: '建築師平面圖視角\n隔間牆 + 量尺標記\nArcGIS / Bluebeam 風格',
  },
  {
    id: 'C',
    src: '/icons/preview-c',
    label: '方案 C',
    subtitle: '極簡量體 + 大勾勾',
    desc: '單一量體輪廓\n超大金色 ✓ 為主視覺\nBluebeam / Linear 風格',
  },
]

export default function IconPreviewPage() {
  return (
    <html lang="zh-TW">
      <body style={{
        margin: 0, padding: 0,
        background: '#080F1E',
        fontFamily: '-apple-system, "Segoe UI", sans-serif',
        color: '#F1F5F9',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '56px 24px' }}>

          <div style={{ marginBottom: 48 }}>
            <div style={{
              display: 'inline-block',
              background: '#D4AF37',
              color: '#060E1E',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.12em',
              padding: '4px 10px',
              borderRadius: 4,
              marginBottom: 16,
            }}>PWA ICON PREVIEW</div>
            <h1 style={{
              fontSize: 28, fontWeight: 700, margin: 0, marginBottom: 8,
              color: '#F8FAFC',
            }}>永豐 AI 法規檢核 — Icon 方案選擇</h1>
            <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
              選擇偏好方案後，告知「套用方案 A / B / C」，立即更新所有正式圖示。
            </p>
          </div>

          {/* 三方案主展示 */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 64 }}>
            {OPTIONS.map(opt => (
              <div key={opt.id} style={{ flex: '1 1 260px' }}>
                <div style={{
                  background: '#0F1B2D',
                  borderRadius: 16,
                  padding: 28,
                  border: '1px solid #1E2D45',
                }}>
                  {/* 主預覽 */}
                  <img
                    src={opt.src}
                    alt={opt.label}
                    width={200}
                    height={200}
                    style={{
                      borderRadius: 20,
                      display: 'block',
                      margin: '0 auto',
                      border: '1px solid #1E2D45',
                    }}
                  />
                  <div style={{ marginTop: 20, textAlign: 'center' }}>
                    <div style={{
                      fontSize: 11, fontWeight: 700,
                      color: '#D4AF37',
                      letterSpacing: '0.10em',
                      textTransform: 'uppercase',
                    }}>{opt.label}</div>
                    <div style={{
                      fontSize: 17, fontWeight: 600,
                      color: '#F1F5F9', marginTop: 6,
                    }}>{opt.subtitle}</div>
                    <div style={{
                      fontSize: 13, color: '#64748B',
                      marginTop: 10, lineHeight: 1.7,
                      whiteSpace: 'pre-line',
                    }}>{opt.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 手機桌面縮圖模擬 */}
          <h2 style={{
            fontSize: 14, fontWeight: 600,
            color: '#94A3B8',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>手機桌面縮圖（60 × 60 px）</h2>
          <div style={{
            background: '#0F1B2D',
            borderRadius: 12,
            padding: '24px 32px',
            display: 'flex', gap: 40, alignItems: 'center',
            flexWrap: 'wrap', marginBottom: 40,
            border: '1px solid #1E2D45',
          }}>
            {OPTIONS.map(opt => (
              <div key={opt.id} style={{ textAlign: 'center' }}>
                <img
                  src={opt.src}
                  alt={opt.label}
                  width={60}
                  height={60}
                  style={{ borderRadius: 14, display: 'block' }}
                />
                <div style={{
                  fontSize: 11, color: '#64748B',
                  marginTop: 8, fontWeight: 600,
                }}>方案 {opt.id}</div>
              </div>
            ))}
          </div>

          {/* Favicon 縮圖模擬 */}
          <h2 style={{
            fontSize: 14, fontWeight: 600,
            color: '#94A3B8',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>Favicon（32 × 32 px）</h2>
          <div style={{
            background: '#0F1B2D',
            borderRadius: 12,
            padding: '20px 32px',
            display: 'flex', gap: 40, alignItems: 'center',
            flexWrap: 'wrap',
            border: '1px solid #1E2D45',
          }}>
            {OPTIONS.map(opt => (
              <div key={opt.id} style={{ textAlign: 'center' }}>
                <img
                  src={opt.src}
                  alt={opt.label}
                  width={32}
                  height={32}
                  style={{ borderRadius: 7, display: 'block' }}
                />
                <div style={{
                  fontSize: 11, color: '#64748B',
                  marginTop: 8, fontWeight: 600,
                }}>方案 {opt.id}</div>
              </div>
            ))}
          </div>

          <p style={{ marginTop: 48, fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
            確認方案後回覆「套用方案 A」、「套用方案 B」或「套用方案 C」。
          </p>
        </div>
      </body>
    </html>
  )
}
