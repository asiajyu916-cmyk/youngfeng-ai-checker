# 台中市 158 WebGIS 技術分析備忘錄

> **狀態：暫緩開發 — 列為未來可研究項目**
>
> 本文件記錄對台中市 158 WebGIS（lohas.taichung.gov.tw/webgis/#）及其後端
> ArcGIS REST API 的完整技術分析，供未來評估是否正式串接使用。

---

## 一、系統架構確認

| 項目 | 內容 |
|------|------|
| 前端入口 | https://lohas.taichung.gov.tw/webgis/# |
| 後端 GIS 伺服器 | https://dig.taichung.gov.tw/arcgis/rest/services/ |
| 伺服器類型 | Esri ArcGIS Enterprise |
| 主要服務 | Underlay1050622/MapServer |
| 伺服器 IP | 210.69.115.155 |

---

## 二、核心問題分析

| # | 問題 | 結論 | 補充說明 |
|---|------|------|---------|
| 1 | 是否有公開 API？ | ⚠️ 有，但非官方文件化 | 符合 ArcGIS REST 標準規格，無官方開發者文件或 API Key 申請管道 |
| 2 | 是否能直接依地號查詢？ | ✅ 技術上可行 | Layer 16（地籍層）Display Field = AA49（地號），支援精確查詢，`supportsAdvancedQueries: true` |
| 3 | 是否能取得使用分區？ | ✅ 可取得 | 使用分區圖層含欄位：`使用分區`、`分區簡稱`、`都計名稱`、`都市計畫區`、`細部計畫區` |
| 4 | 是否能取得建蔽率／容積率？ | ✅ 可取得 | 使用分區圖層直接含 `建蔽率`、`容積率`、`上限容積` 欄位 |
| 5 | 是否有 CORS 限制？ | ❌ 無法確認 | ArcGIS Server 預設允許所有 Origin，但實測（含台灣本機）均 Connection Reset |
| 6 | 是否適合 Vercel Server API Proxy？ | ❌ 暫不建議 | WAF 攔截所有 curl/非瀏覽器請求，需完整瀏覽器 TLS fingerprint 才能連線 |
| 7 | 是否有法律或授權限制？ | ✅ 合法，需標註來源 | 政府資料開放授權條款第1版：商業使用 ✓、第三方整合 ✓、需標示「臺中市政府都市發展局」 |
| 8 | 哪些功能適合正式串接？ | 地號→座標、地號→使用分區、地號→建蔽容積 | 前提：需突破 WAF 或獲白名單授權 |
| 9 | 哪些功能只能輔助查詢？ | 地籍圖套疊、危險地質、淹水潛勢、現況航照 | 適合 iframe 嵌入或人工查證，不宜後端串接 |

---

## 三、連線測試記錄

測試時間：2026-06-04，測試機器：台灣本機（192.168.1.102）

```bash
# 測試 1：基本連線
curl -v --max-time 10 "https://dig.taichung.gov.tw/arcgis/rest/services/Underlay1050622/MapServer?f=json"
# 結果：TCP 建立成功，HTTP 層 Connection Reset (schannel error 56)

# 測試 2：加瀏覽器 UA + Referer
curl -v --max-time 10 "https://..." -H "Referer: https://lohas.taichung.gov.tw/" -H "User-Agent: Mozilla/5.0..."
# 結果：同樣 Connection Reset

# 測試 3：HTTP（非 HTTPS）
curl -v --max-time 10 "http://dig.taichung.gov.tw/arcgis/..."
# 結果：同樣 Connection Reset

# 測試 4：根域名
curl -v --max-time 10 "https://dig.taichung.gov.tw/"
# 結果：同樣 Connection Reset
```

**結論：WAF（Web Application Firewall）在 HTTP 層攔截所有非瀏覽器請求。**
TCP 連線可建立（DNS 正常），但 HTTP 請求被重置。原因可能為：
- TLS fingerprint 檢查（curl schannel ≠ 瀏覽器 TLS）
- 需要特定 cookie / session（瀏覽器先訪問前端才能取得）
- F5 / FortiGate / Cloudflare 等 WAF bot 偵測機制

---

## 四、已確認的圖層資訊

### Layer 16 — 地籍層
| 屬性 | 值 |
|------|---|
| Geometry Type | esriGeometryPolygon |
| Display Field | AA49（地號） |
| supportsAdvancedQueries | true |
| Max Record Count | 10,000 |
| 支援格式 | JSON, GeoJSON |

### 使用分區圖層（Layer ID 待確認）
| 欄位名稱 | 說明 |
|---------|------|
| 使用分區 | 完整分區名稱 |
| 分區簡稱 | 簡稱（如住2） |
| 都計名稱 | 都市計畫名稱 |
| 都市計畫區 | 主要計畫區域 |
| 細部計畫區 | 細部計畫名稱 |
| 建蔽率 | 數值（%） |
| 容積率 | 數值（%） |
| 上限容積 | 上限值（%） |
| 備註 | 附加說明 |

---

## 五、技術可行架構（供未來參考）

```
使用者輸入地號
    │
    ▼
[Server API Route: /api/gis/query]   ← Next.js Route Handler
    │
    ├─ Step 1: 查地籍層 (Layer 16)
    │  GET dig.taichung.gov.tw/arcgis/rest/.../query
    │  where=AA49='大里段0000459'&f=json&returnGeometry=true
    │  → 取得 polygon centroid (x, y)
    │
    └─ Step 2: 查使用分區層
       geometry={x,y}&geometryType=esriGeometryPoint
       &spatialRel=esriSpatialRelIntersects
       &outFields=使用分區,建蔽率,容積率,都計名稱,...&f=json
       → 回傳建蔽率 / 容積率
```

---

## 六、風險與阻礙

| 風險 | 等級 | 說明 |
|------|------|------|
| WAF 封鎖非瀏覽器請求 | 🔴 高 | 本機測試已確認，無法繞過（除 Playwright/Puppeteer） |
| 需台中市政府正式授權 | 🔴 高 | 無官方 API 申請管道，需公文聯繫都市發展局資訊組 |
| 圖層 ID 可能變動 | 🟡 中 | ArcGIS 服務更新時 Layer ID 可能改變 |
| 無官方 SLA | 🟡 中 | 服務可用性無保證，需設計 fallback |
| 使用分區 Layer ID 未確認 | 🟡 中 | 僅知字段結構，實際 Layer ID 需瀏覽器 DevTools 確認 |

---

## 七、現行替代方案（已上線）

| 需求 | 方案 | 狀態 |
|------|------|------|
| 地號 → 座標 PIP | `lohas.taichung.gov.tw` GIS API（另一端點） | ✅ 已上線 |
| 建蔽率 / 容積率 | `data/zoning_rules.db` 本地 SQLite | ✅ 已上線 |
| 都市計畫 / 使用分區 | `zoning_rules.db` + regionRules 映射 | ✅ 已上線 |
| 158 WebGIS 人工查證 | 提供連結供使用者開啟瀏覽器查看 | ✅ 適合 |

---

## 八、後續行動項目（若決定推進）

1. **驗證 WAF 繞過方案**：使用 Playwright headless browser 模擬完整瀏覽器連線
2. **確認使用分區 Layer ID**：在瀏覽器 DevTools Network 中查詢一筆地號，觀察哪個圖層回傳含建蔽率的資料
3. **聯繫台中市政府**：透過資料開放平台或公文向都市發展局資訊組申請 API 白名單
4. **評估 VPS Proxy**：在台灣 VPS（如 Linode Tokyo）架設 proxy server，測試是否解決 IP 問題

---

*最後更新：2026-06-04*
*分析執行：永豐 AI 法規檢核系統開發團隊*
