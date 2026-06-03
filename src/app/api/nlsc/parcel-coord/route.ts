/**
 * /api/nlsc/parcel-coord
 *
 * Server-side proxy：地號 → WGS84 座標
 *
 * 流程：
 *   1. 行政區名稱 → NLSC 鄉鎮代碼（靜態表）
 *   2. 地段名稱   → 地段代碼（ListLandSection API）
 *   3. 地號       → TWD97 座標（GetLandPositionLongitudeLatitude API）
 *   4. TWD97 TM2  → WGS84（twd97.ts 逆投影）
 *
 * 查詢參數（GET）：
 *   county    臺中市（可省略，目前只支援台中）
 *   district  行政區，例如「北區」
 *   section   地段名稱，例如「錦村段」
 *   parcelNo  地號，例如「0001-0000」或「1」或「1-0」
 *
 * 環境變數：
 *   NLSC_API_TOKEN  — 內政部 NLSC API 授權 token（CAD_004）
 *                     申請：https://api.nlsc.gov.tw/
 *
 * 回應格式（JSON）：
 *   成功：{ ok: true, lng: number, lat: number, townCode: string, sectCode: string }
 *   失敗：{ ok: false, error: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTownCode } from '@/lib/gis/taichungTownCodes'
import { twd97ToWgs84 } from '@/lib/gis/twd97'

const NLSC_BASE = 'https://api.nlsc.gov.tw/other'

/** 地號格式化：支援 "1", "1-0", "0001", "0001-0000" → "00010000" */
function formatParcelNo(raw: string): string {
  const cleaned = raw.trim().replace(/[^0-9-]/g, '')
  // 若含 '-' 分割為主號/附號
  const parts = cleaned.split('-')
  const main = parseInt(parts[0] || '0', 10)
  const sub  = parseInt(parts[1] || '0', 10)
  // NLSC 格式：主號 4 位 + 附號 4 位
  return String(main).padStart(4, '0') + String(sub).padStart(4, '0')
}

/** 從 NLSC ListLandSection XML 回應中找出對應地段代碼 */
function findSectCode(xml: string, sectionName: string): string | null {
  // XML 格式：<sectItems><sectItem><sectcode>1002</sectcode><sectstr>錦村段</sectstr></sectItem>...
  const itemReg = /<sectItem>([\s\S]*?)<\/sectItem>/g
  let match: RegExpExecArray | null
  while ((match = itemReg.exec(xml)) !== null) {
    const block = match[1]
    const nameMatch = block.match(/<sectstr>(.*?)<\/sectstr>/)
    const codeMatch = block.match(/<sectcode>(.*?)<\/sectcode>/)
    if (nameMatch && codeMatch) {
      const name = nameMatch[1].trim()
      // 支援有無「段」字
      if (name === sectionName || name === sectionName + '段' || name + '段' === sectionName) {
        return codeMatch[1].trim()
      }
    }
  }
  return null
}

/** 從 NLSC GetLandPositionLongitudeLatitude XML 回應中取出 TWD97 座標 */
function parseCoordFromXml(xml: string): { x: number; y: number } | null {
  // XML 格式：<coordinate><x>...</x><y>...</y></coordinate>  或
  //           <coordinateInfo><longitude>...</longitude><latitude>...</latitude>...
  // 實測格式（CAD_004）：
  //   <landPositionInfo><x>...</x><y>...</y></landPositionInfo>
  const xMatch = xml.match(/<x>([\d.+-]+)<\/x>/)
  const yMatch = xml.match(/<y>([\d.+-]+)<\/y>/)
  if (xMatch && yMatch) {
    return { x: parseFloat(xMatch[1]), y: parseFloat(yMatch[1]) }
  }
  // 備用：longitude/latitude（若 API 直接回 WGS84）
  const lngMatch = xml.match(/<longitude>([\d.+-]+)<\/longitude>/)
  const latMatch = xml.match(/<latitude>([\d.+-]+)<\/latitude>/)
  if (lngMatch && latMatch) {
    // API 直接給 WGS84 — 不需轉換，用特殊標記
    return { x: parseFloat(lngMatch[1]) + 1e9, y: parseFloat(latMatch[1]) }
  }
  return null
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const district = searchParams.get('district') ?? ''
  const section  = searchParams.get('section')  ?? ''
  const parcelNo = searchParams.get('parcelNo') ?? ''

  // ── 參數驗證 ──────────────────────────────────────────────────
  if (!district || !section || !parcelNo) {
    return NextResponse.json(
      { ok: false, error: '缺少必要參數：district, section, parcelNo' },
      { status: 400 },
    )
  }

  const token = process.env.NLSC_API_TOKEN
  if (!token) {
    return NextResponse.json(
      { ok: false, error: 'NLSC_API_TOKEN 環境變數未設定。請至 https://api.nlsc.gov.tw/ 申請授權 token。' },
      { status: 503 },
    )
  }

  // ── Step 1：行政區 → 鄉鎮代碼 ─────────────────────────────────
  const townCode = getTownCode(district)
  if (!townCode) {
    return NextResponse.json(
      { ok: false, error: `找不到「${district}」對應的 NLSC 鄉鎮代碼。目前僅支援臺中市各區。` },
      { status: 400 },
    )
  }

  // ── Step 2：地段名稱 → 地段代碼 ───────────────────────────────
  let sectCode: string | null = null
  try {
    const sectUrl = `${NLSC_BASE}/ListLandSection/B/${townCode}`
    const sectRes = await fetch(sectUrl, {
      headers: { Accept: 'application/xml, text/xml, */*' },
      next: { revalidate: 86400 },  // 快取 1 天
    })
    if (!sectRes.ok) {
      return NextResponse.json(
        { ok: false, error: `NLSC ListLandSection 請求失敗（HTTP ${sectRes.status}）` },
        { status: 502 },
      )
    }
    const sectXml = await sectRes.text()
    sectCode = findSectCode(sectXml, section)
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: `NLSC ListLandSection 網路錯誤：${String(e)}` },
      { status: 502 },
    )
  }

  if (!sectCode) {
    return NextResponse.json(
      { ok: false, error: `找不到地段「${section}」（行政區：${district}，鄉鎮代碼：${townCode}）。請確認地段名稱是否正確。` },
      { status: 404 },
    )
  }

  // ── Step 3：地號 → TWD97 座標 ──────────────────────────────────
  const formattedNo = formatParcelNo(parcelNo)
  let rawX: number
  let rawY: number
  let directWgs84 = false

  try {
    const coordUrl = `${NLSC_BASE}/GetLandPositionLongitudeLatitude/B/${townCode}/${sectCode}/${formattedNo}`
    const coordRes = await fetch(coordUrl, {
      headers: {
        Accept: 'application/xml, text/xml, */*',
        Authorization: `Bearer ${token}`,
      },
    })

    if (coordRes.status === 401 || coordRes.status === 403) {
      return NextResponse.json(
        { ok: false, error: `NLSC API 授權失敗（HTTP ${coordRes.status}）。請確認 NLSC_API_TOKEN 是否有效，且已申請 CAD_004 服務。` },
        { status: 401 },
      )
    }
    if (!coordRes.ok) {
      const body = await coordRes.text().catch(() => '')
      return NextResponse.json(
        { ok: false, error: `NLSC GetLandPosition 請求失敗（HTTP ${coordRes.status}）：${body.slice(0, 200)}` },
        { status: 502 },
      )
    }

    const coordXml = await coordRes.text()
    const parsed = parseCoordFromXml(coordXml)
    if (!parsed) {
      return NextResponse.json(
        { ok: false, error: `無法解析 NLSC 座標回應。原始 XML：${coordXml.slice(0, 500)}` },
        { status: 502 },
      )
    }

    // 特殊標記：API 直接給 WGS84（longitude/latitude 欄位，x 加了 1e9）
    if (parsed.x > 1e8) {
      rawX = parsed.x - 1e9
      rawY = parsed.y
      directWgs84 = true
    } else {
      rawX = parsed.x
      rawY = parsed.y
    }
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: `NLSC GetLandPosition 網路錯誤：${String(e)}` },
      { status: 502 },
    )
  }

  // ── Step 4：TWD97 → WGS84（或直接使用 WGS84） ─────────────────
  let lng: number
  let lat: number

  if (directWgs84) {
    lng = rawX
    lat = rawY
  } else {
    ;[lng, lat] = twd97ToWgs84(rawX, rawY)
  }

  // 座標合理性檢查（台中市範圍）
  if (lng < 120.0 || lng > 121.5 || lat < 23.5 || lat > 25.0) {
    return NextResponse.json(
      {
        ok: false,
        error: `轉換結果座標 [${lng.toFixed(6)}, ${lat.toFixed(6)}] 超出台中市合理範圍，可能為轉換錯誤或地號資料異常。`,
      },
      { status: 422 },
    )
  }

  return NextResponse.json({
    ok: true,
    lng,
    lat,
    townCode,
    sectCode,
    formattedNo,
    source: directWgs84 ? 'NLSC_WGS84' : 'NLSC_TWD97_CONVERTED',
  })
}
