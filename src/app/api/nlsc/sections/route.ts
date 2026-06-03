/**
 * /api/nlsc/sections
 *
 * 代理 NLSC COM_006「代碼服務－地段清單」（開放 API，無需授權）
 * 原始 API：https://api.nlsc.gov.tw/other/ListLandSection/B/{townCode}
 *
 * 使用代理的原因：
 *   - 瀏覽器直接呼叫 api.nlsc.gov.tw 可能遇到 CORS 限制
 *   - 伺服器端呼叫無 CORS 問題
 *   - 回應快取 1 天（地段清單幾乎不變）
 *
 * 查詢參數：
 *   townCode  NLSC 鄉鎮代碼，例如 B05（北區）
 *
 * 回應格式（JSON）：
 *   { ok: true,  sections: { code: string; name: string }[] }
 *   { ok: false, error: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTownCode } from '@/lib/gis/taichungTownCodes'

/** 解析 NLSC 地段清單 XML → 陣列 */
function parseSectionsXml(xml: string): { code: string; name: string }[] {
  const sections: { code: string; name: string }[] = []
  const itemReg = /<sectItem>([\s\S]*?)<\/sectItem>/g
  let match: RegExpExecArray | null
  while ((match = itemReg.exec(xml)) !== null) {
    const block = match[1]
    const code = block.match(/<sectcode>(.*?)<\/sectcode>/)?.[1]?.trim()
    const name = block.match(/<sectstr>(.*?)<\/sectstr>/)?.[1]?.trim()
    if (code && name) sections.push({ code, name })
  }
  return sections
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  // 接受 townCode 直接傳入，或 district 名稱自動查代碼
  let townCode = searchParams.get('townCode') ?? ''
  const district = searchParams.get('district') ?? ''

  if (!townCode && district) {
    townCode = getTownCode(district) ?? ''
  }

  if (!townCode) {
    return NextResponse.json(
      { ok: false, error: '缺少 townCode 或無法識別的 district 名稱' },
      { status: 400 },
    )
  }

  // 只允許台中市代碼（B01~B29）
  if (!/^B\d{2}$/.test(townCode)) {
    return NextResponse.json(
      { ok: false, error: `無效的鄉鎮代碼：${townCode}` },
      { status: 400 },
    )
  }

  try {
    const url = `https://api.nlsc.gov.tw/other/ListLandSection/B/${townCode}`
    const res = await fetch(url, {
      headers: { Accept: 'application/xml, text/xml, */*' },
      next: { revalidate: 86400 },   // 快取 1 天
    })

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `NLSC API 回應失敗（HTTP ${res.status}）` },
        { status: 502 },
      )
    }

    const xml = await res.text()
    const sections = parseSectionsXml(xml)

    return NextResponse.json(
      { ok: true, sections, townCode },
      {
        headers: {
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
        },
      },
    )
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: `NLSC API 網路錯誤：${String(e)}` },
      { status: 502 },
    )
  }
}
