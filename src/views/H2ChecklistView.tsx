'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import type { AppView } from '@/types'

// ─── 型別 ──────────────────────────────────────────────────────────────────

interface H2Card {
  id: string
  no: number
  title: string
  starred?: boolean          // ⭐ 重要項目
  checkItems: string[]       // 【檢討項目】checkbox
  keyPoints: string[]        // 【必要檢討事項】
  legalBasis: string[]       // 【法規依據】
  keywords: string[]
}

// ─── 20 張卡片資料 ─────────────────────────────────────────────────────────

const H2_CARDS: H2Card[] = [
  {
    id: 'c01', no: 1, title: '建築面積',
    checkItems: [
      '外牆中心線以內水平投影面積計算確認',
      '陽台深度超過 2 公尺部分是否計入建築面積',
      '雨遮、遮陽板計入面積確認',
      '花台設計是否超出免計範圍',
      '騎樓、開放空間免計面積確認',
      '複合使用各部分建築面積分算確認',
    ],
    keyPoints: [
      '建築面積依外牆中心線以內水平投影面積計算',
      '陽台深度超過一定限制者，超出部分計入建築面積',
      '騎樓及開放空間依規定得免計入建築面積',
      '地下層建築面積依各縣市規定計算',
      '花台設計若超出規定範圍，超出部分應計入面積',
    ],
    legalBasis: ['建築技術規則建築設計施工編第 1 條', '建築面積及各層樓地板面積計算規則'],
    keywords: ['建築面積', '陽台', '花台', '騎樓', '雨遮', '面積計算'],
  },
  {
    id: 'c02', no: 2, title: '建蔽率',
    checkItems: [
      '查驗使用分區建蔽率上限',
      '建築面積計算總量確認',
      '基地面積認定（扣除計畫道路用地）',
      '開放空間獎勵增加建蔽率申請條件確認',
      '套繪圖範圍及現況核對',
      '相鄰地合併計算方式確認',
    ],
    keyPoints: [
      '建蔽率 = 建築面積 ÷ 基地面積 × 100%',
      '依各都市計畫使用分區管制要點規定上限',
      '開放空間設置可依規定增加建蔽率',
      '基地面積不含計畫道路用地',
      '套繪圖需事先確認，影響可建面積計算',
    ],
    legalBasis: ['都市計畫法第 32 條', '臺中市各都市計畫區使用分區管制要點'],
    keywords: ['建蔽率', '基地面積', '套繪', '開放空間', '使用分區'],
  },
  {
    id: 'c03', no: 3, title: '容積率',
    checkItems: [
      '查驗使用分區容積率上限',
      '各層樓地板面積計算合計',
      '免計容積項目確認（停車、機房等）',
      '各類容積獎勵種類與個別上限確認',
      '容積獎勵加總不超過法定上限（通常 30%）',
      '容積移轉計算方式確認',
    ],
    keyPoints: [
      '容積率 = 各層樓地板面積總和 ÷ 基地面積 × 100%',
      '免計容積項目包括機械停車、緊急發電機室等',
      '各類獎勵容積合計不得超過法定容積 30%（一般情形）',
      '危老、都更等另有特別規定，需分別計算',
      '免計容積項目有各自的面積上限，需逐項核對',
    ],
    legalBasis: ['都市計畫法第 32 條', '建築技術規則', '臺中市各種容積獎勵辦法'],
    keywords: ['容積率', '容積獎勵', '免計容積', '容積移轉', '樓地板面積'],
  },
  {
    id: 'c04', no: 4, title: '樓梯',
    checkItems: [
      '樓梯淨寬度符合用途規定',
      '梯級高度（踢面）≤ 18 cm',
      '踏面寬度（踏板）≥ 26 cm',
      '每 16 個梯級以下設置休息平台',
      '休息平台深度 ≥ 樓梯淨寬',
      '扶手設置高度 75～85 cm',
      '樓梯淨高 ≥ 190 cm',
    ],
    keyPoints: [
      '集合住宅公共樓梯淨寬 ≥ 120 cm',
      '辦公或商業公共樓梯依用途另有規定',
      '15 個梯級以內不超過 16 級需設休息平台',
      '扶手超過一定寬度時需兩側設置',
      '轉角梯下方淨高容易不足，需特別注意',
    ],
    legalBasis: ['建築技術規則建築設計施工編第 33 條', '第 34～35 條'],
    keywords: ['樓梯', '梯級', '踏板', '踢面', '扶手', '平台', '淨寬'],
  },
  {
    id: 'c05', no: 5, title: '安全梯',
    checkItems: [
      '安全梯設置義務確認（5 層以上）',
      '特別安全梯適用條件（11 層以上）',
      '安全梯淨寬 ≥ 120 cm',
      '排煙設備設置確認（排煙窗面積及位置）',
      '防火門設置（1 小時防火時效）',
      '防火門開啟方向朝逃生方向',
      '安全梯內不得設置可燃物',
    ],
    keyPoints: [
      '5 層以上建築物需設安全梯',
      '11 層以上或高度 36 m 以上需設特別安全梯',
      '特別安全梯需設前室或附室（面積 ≥ 5 ㎡）',
      '安全梯為防火區劃之一部分，需嚴格管制',
      '緊急進口設置義務需同步確認（11 層以上，每 3 層）',
    ],
    legalBasis: ['建築技術規則建築設計施工編第 95～97 條', '第 90～93 條（避難）', '第 108 條（緊急進口）'],
    keywords: ['安全梯', '特別安全梯', '排煙', '防火門', '逃生', '前室', '緊急進口'],
  },
  {
    id: 'c06', no: 6, title: '昇降機',
    checkItems: [
      '昇降機設置義務確認（6 層以上）',
      '機廂淨尺寸（寬 × 深 × 高）',
      '無障礙昇降機規格 ≥ 140 × 135 cm',
      '緊急昇降機適用條件（15 層或 50 m 以上）',
      '機道防火構造確認',
      '廳門防火等級確認（B 種以上）',
      '機房或免機房設備配置確認',
    ],
    keyPoints: [
      '6 層以上建築物需設昇降機',
      '15 層以上或 50 m 以上需設緊急昇降機（直達地面層）',
      '無障礙昇降機機廂深度 ≥ 135 cm、寬度 ≥ 140 cm',
      '昇降機數量依樓地板面積計算，需確認是否足夠',
      '昇降機道開口部防火等級需符合規定',
    ],
    legalBasis: ['建築技術規則建築設計施工編第 55～57 條', '第 107 條（緊急昇降機）', '第 167 條（無障礙）'],
    keywords: ['昇降機', '電梯', '緊急昇降機', '無障礙電梯', '機廂', '機道'],
  },
  {
    id: 'c07', no: 7, title: '停車空間',
    checkItems: [
      '停車位數量依用途及樓地板面積計算',
      '標準停車位尺寸 ≥ 2.5 m × 6 m',
      '車道淨寬確認（單向 ≥ 350 cm）',
      '車道坡度 ≤ 1/6',
      '無障礙停車格 ≥ 3.5 m × 6 m（上方淨高 ≥ 250 cm）',
      '車道出入口視距三角形確認',
      '機械停車設備規格確認',
      '自行車、機車停車空間設置',
    ],
    keyPoints: [
      '停車位依用途別、樓地板面積比例計算',
      '標準車位 2.5 m × 6 m，機械停車另有規定',
      '車道坡度 ≤ 1/6（約 16.7%），頂底端需設緩和段',
      '5 個停車位以上需設無障礙停車格',
      '出入口兩側視距三角形內不得有遮蔽物',
    ],
    legalBasis: ['建築技術規則建築設計施工編第 59 條', '臺中市停車空間設置管理辦法'],
    keywords: ['停車', '停車位', '車道', '無障礙停車', '機械停車', '坡道', '視距'],
  },
  {
    id: 'c08', no: 8, title: '防火區劃',
    checkItems: [
      '防火區劃最大面積確認（1,500 ㎡ 以下）',
      '防火牆構造等級確認（1 小時以上耐火時效）',
      '防火門規格確認（防火時效、自動閉門器）',
      '電氣及管線貫穿孔防火填塞確認',
      '豎穿部位（電梯道、管道間）防護方式',
      '高層建築物各層防火區劃確認',
      '不同用途防火分區隔離確認',
    ],
    keyPoints: [
      '防火區劃每層面積不超過 1,500 ㎡',
      '高層建築物每層均需獨立防火區劃',
      '防火牆需為 1 小時以上防火時效構造',
      '管線穿越防火牆需用防火填塞材料，不得留縫',
      '豎穿部位（管道間）需設防火閘門防止垂直蔓延',
    ],
    legalBasis: ['建築技術規則建築設計施工編第 79 條', '第 79-2 條（垂直區劃）', '第 85～88 條'],
    keywords: ['防火區劃', '防火牆', '防火門', '貫穿孔', '管道間', '豎穿', '垂直區劃'],
  },
  {
    id: 'c09', no: 9, title: '無障礙',
    checkItems: [
      '無障礙通路連續性（室外出入口至目的地）',
      '無障礙通路淨寬 ≥ 90 cm',
      '坡道坡度 ≤ 1/12（特殊 ≤ 1/8）',
      '無障礙停車格 3.5 m × 6 m',
      '無障礙廁所面積 ≥ 4.9 ㎡（出入口淨寬 ≥ 80 cm）',
      '無障礙昇降機規格確認',
      '扶手高度（75～85 cm）及材質確認',
      '引導標誌及點字設施確認',
    ],
    keyPoints: [
      '無障礙通路淨寬 ≥ 90 cm，地面需防滑',
      '坡道坡度 ≤ 1/12，長度超過 6 m 需設休息平台',
      '無障礙廁所面積 ≥ 4.9 ㎡',
      '公共建築物需設無障礙設施（集合住宅依規模規定）',
      '通路有高差（包括門檻）需設坡道克服',
    ],
    legalBasis: ['建築技術規則建築設計施工編第 167～173 條', '臺中市建築物無障礙相關審查作業參考手冊'],
    keywords: ['無障礙', '坡道', '通路', '無障礙廁所', '輪椅', '扶手', '點字'],
  },
  {
    id: 'c10', no: 10, title: '採光通風',
    checkItems: [
      '居室採光開口面積 ≥ 樓地板面積 1/8',
      '居室通風開口面積 ≥ 樓地板面積 1/20',
      '採光計算扣除遮蔽面積（屋簷、陽台板）',
      '天井或採光井採光計算確認',
      '通風開口位置及可開啟確認（非固定玻璃）',
      '地下層或特殊空間採光補充措施確認',
    ],
    keyPoints: [
      '居室採光面積 ≥ 該居室樓地板面積 1/8',
      '通風開口 ≥ 樓地板面積 1/20，且需可開啟',
      '採光面積需扣除屋簷、陽台等遮蔽物影響',
      '人工採光或機械通風可作為補充（需符合規定）',
      '天井尺寸需符合最小寬度及深高比規定',
    ],
    legalBasis: ['建築技術規則建築設計施工編第 40～43 條'],
    keywords: ['採光', '通風', '居室', '採光開口', '遮蔽', '天井'],
  },
  {
    id: 'c11', no: 11, title: '高度比',
    checkItems: [
      '前院高度比確認（面向道路面）',
      '側院高度比確認',
      '後院高度比確認',
      '道路斜線管制計算',
      '鄰接公共設施用地加算確認',
      '各方位分別計算並取最嚴值',
    ],
    keyPoints: [
      '建築物各部分高度不得超過至鄰地線距離乘以規定倍數',
      '前院依（道路寬度 + 退縮距離）× 倍數計算',
      '鄰接公共設施用地可加算寬度',
      '台中市依各都市計畫區規定，部分地區有特殊規定',
      '複合使用分區不同方位需分別計算',
    ],
    legalBasis: ['建築技術規則建築設計施工編第 9 條', '臺中市都市計畫使用分區管制要點'],
    keywords: ['高度比', '道路斜線', '前院', '側院', '後院', '退縮', '建築高度'],
  },
  {
    id: 'c12', no: 12, title: '北向日照',
    checkItems: [
      '北向日照適用範圍確認（集合住宅）',
      '基地朝向與真北方向確認（非磁北）',
      '冬至日照時數計算基準（12/22）',
      '相鄰建築遮蔽距離計算',
      '各戶至少一間居室符合日照規定',
      '平台或中庭遮蔽影響評估',
    ],
    keyPoints: [
      '集合住宅各戶至少一間居室需符合日照規定',
      '計算以冬至日（12/22）有效日照為基準',
      '日照計算須考慮周邊建築物遮蔽',
      '台中市依不同都市計畫區有不同規定',
      '計算須以真北為基準，非磁北',
    ],
    legalBasis: ['建築技術規則建築設計施工編第 19 條之 1', '臺中市集合住宅日照相關規定'],
    keywords: ['日照', '北向', '冬至', '集合住宅', '遮蔽', '日照時數', '真北'],
  },
  {
    id: 'c13', no: 13, title: '都市設計審議',
    checkItems: [
      '都審觸發條件確認（面積、高度、特定分區）',
      '適用審議規範版本確認（最新版）',
      '各向退縮距離符合規範',
      '立面材質、色彩規定確認',
      '景觀綠化量體符合規定',
      '基地透水率達標',
      '量體配置及天際線檢討',
      '屋脊裝飾物及外牆裝飾板花台規定（2.0 版）',
    ],
    keyPoints: [
      '台中市依各都市計畫區設有不同都市設計審議規範',
      '觸發條件依基地面積、建築高度或特定使用分區',
      '需提送都審圖說、說明書及相關計算書',
      '水湳智慧城區另有獨立審議規範（需特別注意）',
      '裝飾板花台規範已更新至 2.0 版，需套用最新版本',
    ],
    legalBasis: ['臺中市各都市計畫區都市設計審議規範', '臺中市水湳機場原址整體開發區都市設計審議規範', '台中市都審裝飾板花台 2.0'],
    keywords: ['都審', '都市設計', '審議', '退縮', '立面', '綠化', '透水', '量體', '裝飾板', '花台'],
  },
  {
    id: 'c14', no: 14, title: '宜居建築', starred: true,
    checkItems: [
      '宜居建築適用範圍確認',
      '設施種類選擇（托嬰、長照、公益等）',
      '各設施面積及規格符合規定',
      '容積獎勵比例計算（上限 10%）',
      '多種設施合計不超過獎勵上限',
      '宜居陽台深度 ≥ 150 cm 確認',
      '永久公益設施設置義務確認',
      '回饋金計算及繳納時程確認',
    ],
    keyPoints: [
      '依臺中市鼓勵宜居建築設施設置及回饋辦法',
      '設施種類包括托嬰中心、老人日照、社區菜園等',
      '容積獎勵上限為法定容積 10%',
      '需作為永久公益設施，不得轉售變更',
      '宜居陽台深度 ≥ 150 cm 可申請獎勵，需在圖說中標示',
      '部分項目需繳交回饋金至市府基金',
    ],
    legalBasis: ['臺中市鼓勵宜居建築設施設置及回饋辦法'],
    keywords: ['宜居', '宜居建築', '托嬰', '長照', '容積獎勵', '公益設施', '回饋', '宜居陽台'],
  },
  {
    id: 'c15', no: 15, title: '開放空間獎勵', starred: true,
    checkItems: [
      '開放空間設置面積及位置確認',
      '開放空間透空率達標（通常 ≥ 60%）',
      '開放時間規定確認（不得設門禁）',
      '告示牌設置規定確認（位置、內容）',
      '維護管理計畫書準備',
      '開放空間連接公共通道確認',
      '設施種類及規格符合規定',
      '容積獎勵計算確認（加總上限）',
    ],
    keyPoints: [
      '開放空間依面積及位置給予容積獎勵',
      '透空率需達規定比例，遮蔽設施（棚架、雨遮）受限制',
      '需設置告示牌並確保全天對公眾開放',
      '竣工後需提送維護管理計畫',
      '開放空間獎勵與其他獎勵加總需確認上限',
    ],
    legalBasis: ['臺中市各都市計畫區開放空間設計規定', '都市計畫法相關規定'],
    keywords: ['開放空間', '透空率', '告示牌', '維管計畫', '容積獎勵', '門禁'],
  },
  {
    id: 'c16', no: 16, title: '容積移轉', starred: true,
    checkItems: [
      '送出基地資格確認（公共設施保留地）',
      '容積移轉計算方式確認',
      '受體基地移入容積上限計算',
      '容積移轉登記辦理確認（申請建照前完成）',
      '移轉容積計算書審核',
      '不同都市計畫區間移轉規定確認',
      '容積移轉與其他獎勵加總上限確認',
    ],
    keyPoints: [
      '送出基地需為公共設施保留地（符合資格）',
      '移入容積計算依受體基地與送出基地公告地價比計算',
      '移入容積上限通常為法定容積 30%',
      '容積移轉登記需在申請建造執照前完成',
      '移轉容積與其他容積獎勵合計不得超過法定上限',
    ],
    legalBasis: ['都市計畫容積移轉實施辦法', '臺中市容積移轉申請相關規定'],
    keywords: ['容積移轉', '送出基地', '受體基地', '公共設施保留地', '移轉登記'],
  },
  {
    id: 'c17', no: 17, title: '危老重建',
    checkItems: [
      '危老條件確認（屋齡 ≥ 30 年或結構耐震不足）',
      '取得全體土地及建物所有人同意書（100%）',
      '重建計畫申請文件準備',
      '容積獎勵計算（基本 + 時程 + 設計獎勵）',
      '時程獎勵年限確認（從申請核准日起算）',
      '稅務減免申請（地價稅、房屋稅）',
      '完工時程規劃（4 年內完工）',
    ],
    keyPoints: [
      '屋齡達 30 年或結構耐震評估不足可申請',
      '需取得 100% 所有權人同意（或依程序處理）',
      '容積獎勵分基本獎勵（10%）、時程獎勵（最高 10%）及設計獎勵',
      '時程獎勵年限依申請年度遞減（每年遞減 1%）',
      '危老條件鑑定報告需由具資格機構出具',
    ],
    legalBasis: ['都市危險及老舊建築物加速重建條例', '加速都市危險及老舊建築物重建（行政院推動平台）'],
    keywords: ['危老', '危老重建', '重建', '容積獎勵', '時程獎勵', '同意書', '屋齡'],
  },
  {
    id: 'c18', no: 18, title: '水湳經貿園區', starred: true,
    checkItems: [
      '基地位於水湳機場原址開發範圍確認',
      '適用獨立都審規範確認（水湳機場原址整體開發區）',
      '量體高度及天際線管制規定確認',
      '綠建築評估申請確認',
      '智慧建築設施規劃確認',
      '開放空間及退縮規定確認（水湳版本）',
      '特定設施及用途管制查驗',
      '地下停車場及地下空間特別規定確認',
    ],
    keyPoints: [
      '水湳智慧城區有獨立的都市設計審議規範，不適用一般台中市都審規定',
      '需特別注意建築高度、天際線管制',
      '鼓勵設置智慧建築及綠建築設施',
      '開放空間設計有特別規定，不同於一般台中市規範',
      '地下空間及共同管溝有特殊規定',
    ],
    legalBasis: ['臺中市水湳機場原址整體開發區都市設計審議規範', '水湳智慧城開發計畫相關規定'],
    keywords: ['水湳', '水湳經貿', '智慧城', '水湳機場', '都審', '智慧建築', '綠建築'],
  },
  {
    id: 'c19', no: 19, title: '都市更新',
    checkItems: [
      '都市更新地區範圍確認',
      '更新單元劃定及面積計算',
      '土地及建物所有權人同意比例達標',
      '都更計畫書（事業計畫 + 權利變換）擬定',
      '容積獎勵計算及各項上限確認',
      '公共設施留設確認',
      '地主分配比例協商及確認',
    ],
    keyPoints: [
      '需達法定土地及建物所有權人同意比例（自行劃定通常需 2/3 以上）',
      '都更計畫書需含事業計畫及權利變換計畫',
      '容積獎勵依更新規模及設計品質給予',
      '實施者需有都更相關資格或委託具資格者辦理',
      '都市更新容積獎勵上限高於危老，但程序較為複雜',
    ],
    legalBasis: ['都市更新條例', '都市更新事業計畫審核辦法', '臺中市都市更新相關規定'],
    keywords: ['都更', '都市更新', '容積獎勵', '事業計畫', '權利變換', '同意比例'],
  },
  {
    id: 'c20', no: 20, title: '其他特殊法規',
    checkItems: [
      '綠建築標章申請確認（適用建築物）',
      '智慧建築標章申請確認',
      '特定建築物耐震設計規定確認',
      '消防設備設置與建築規劃整合確認',
      '廢污水處理設施確認',
      '招牌廣告及裝飾物申請確認',
      '高層或地下建築物額外規定查驗',
    ],
    keyPoints: [
      '依建築物用途及規模，可能需申請綠建築或智慧建築標章',
      '高層建築物需進行耐震性能評估',
      '消防設備與建築規劃需提早協調整合',
      '招牌廣告需依廣告物管理相關法規另行申請',
      '地下建築物、高層建築物有獨立章節規定，需另外查核',
    ],
    legalBasis: ['建築技術規則', '綠建築評估手冊', '智慧建築評估手冊', '消防法', '廣告物管理相關規定'],
    keywords: ['綠建築', '智慧建築', '耐震', '消防', '廣告物', '高層建築', '地下建築'],
  },
]

// ─── 搜尋邏輯 ──────────────────────────────────────────────────────────────

function matchCard(card: H2Card, q: string): boolean {
  if (!q) return true
  const lower = q.toLowerCase()
  return (
    card.title.toLowerCase().includes(lower) ||
    card.keywords.some(k => k.toLowerCase().includes(lower)) ||
    card.checkItems.some(i => i.toLowerCase().includes(lower)) ||
    card.keyPoints.some(p => p.toLowerCase().includes(lower)) ||
    card.legalBasis.some(l => l.toLowerCase().includes(lower))
  )
}

// ─── 元件：單一知識卡 ──────────────────────────────────────────────────────

interface CardProps {
  card: H2Card
  isExpanded: boolean
  isBookmarked: boolean
  onToggle: () => void
  onBookmark: () => void
}

function H2CardItem({ card, isExpanded, isBookmarked, onToggle, onBookmark }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 print-card overflow-hidden
        ${isExpanded ? 'border-blue-200 shadow-lg' : 'border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'}`}
    >
      {/* ── 卡片標題列（深藍色區域）───────────────────────── */}
      <button
        onClick={onToggle}
        className={`w-full text-left flex items-center gap-3 px-5 py-4 transition-colors group
          ${isExpanded ? 'bg-slate-800' : 'bg-slate-800 hover:bg-slate-700'}`}
      >
        {/* 序號 */}
        <span className="w-8 h-8 rounded-lg bg-white/15 text-white text-sm font-bold flex items-center justify-center shrink-0">
          {String(card.no).padStart(2, '0')}
        </span>

        {/* 標題 + 星號 */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-base font-bold text-white leading-tight truncate">{card.title}</span>
          {card.starred && (
            <span className="shrink-0 text-amber-400 text-base leading-none" title="重要項目">⭐</span>
          )}
        </div>

        {/* 操作區 */}
        <div className="flex items-center gap-2 shrink-0 print:hidden">
          {/* 收藏 */}
          <div
            role="button"
            onClick={e => { e.stopPropagation(); onBookmark() }}
            className={`p-1.5 rounded-lg transition-colors
              ${isBookmarked ? 'text-amber-400 bg-white/15' : 'text-white/40 hover:text-amber-300 hover:bg-white/10'}`}
            title={isBookmarked ? '取消收藏' : '加入收藏'}
          >
            <svg className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>

          {/* 展開/收合箭頭 */}
          <div className={`text-white/60 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* ── 展開內容 ──────────────────────────────────────── */}
      {isExpanded && (
        <div className="divide-y divide-gray-100">

          {/* 【檢討項目】 */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-4 w-1 bg-slate-700 rounded-full shrink-0" />
              <span className="text-xs font-bold text-slate-700 tracking-wide">檢討項目</span>
            </div>
            <ul className="space-y-2">
              {card.checkItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed">
                  <span className="mt-0.5 shrink-0 w-4 h-4 border-2 border-gray-300 rounded" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* 【必要檢討事項】 */}
          <div className="px-5 py-4 bg-slate-50">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-4 w-1 bg-blue-600 rounded-full shrink-0" />
              <span className="text-xs font-bold text-blue-700 tracking-wide">必要檢討事項</span>
            </div>
            <ul className="space-y-2">
              {card.keyPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  {pt}
                </li>
              ))}
            </ul>
          </div>

          {/* 【法規依據】 */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-4 w-1 bg-green-600 rounded-full shrink-0" />
              <span className="text-xs font-bold text-green-700 tracking-wide">法規依據</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {card.legalBasis.map((law, i) => (
                <span key={i}
                  className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full border border-gray-200 leading-tight">
                  {law}
                </span>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

// ─── 主元件 ────────────────────────────────────────────────────────────────

interface Props {
  onNavigate?: (view: AppView) => void
}

export default function H2ChecklistView({ onNavigate }: Props) {
  const [query, setQuery]         = useState('')
  const [expanded, setExpanded]   = useState<Set<string>>(new Set())
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false)

  // 從 localStorage 讀收藏
  useEffect(() => {
    try {
      const saved = localStorage.getItem('h2-bookmarks')
      if (saved) setBookmarks(new Set(JSON.parse(saved) as string[]))
    } catch {}
  }, [])

  const saveBookmarks = useCallback((next: Set<string>) => {
    setBookmarks(next)
    try { localStorage.setItem('h2-bookmarks', JSON.stringify([...next])) } catch {}
  }, [])

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      saveBookmarks(next)
      return next
    })
  }, [saveBookmarks])

  const toggleExpand = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const expandAll   = () => setExpanded(new Set(H2_CARDS.map(c => c.id)))
  const collapseAll = () => setExpanded(new Set())

  const handlePrint = () => {
    expandAll()
    setTimeout(() => window.print(), 300)
  }

  // 篩選
  const filtered = useMemo(() => {
    let list = H2_CARDS.filter(c => matchCard(c, query.trim()))
    if (showOnlyBookmarked) list = list.filter(c => bookmarks.has(c.id))
    return list
  }, [query, showOnlyBookmarked, bookmarks])

  const bookmarkCount = bookmarks.size
  const starredCards  = H2_CARDS.filter(c => c.starred)

  return (
    <>
      {/* ── 列印樣式 ─────────────────────────────────────── */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area { position: absolute; top: 0; left: 0; width: 100%; }
          .print-card { break-inside: avoid; margin-bottom: 1.2rem; }
          .print\\:hidden { display: none !important; }
          @page { margin: 1.5cm; size: A4; }
        }
      `}</style>

      <div className="w-full md:flex-1 md:overflow-y-auto bg-gray-50">
        <div className="print-area max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8 pb-24 md:pb-12">

          {/* ── 頁首 ───────────────────────────────────────── */}
          <div className="mb-6">
            {onNavigate && (
              <button
                onClick={() => onNavigate('resource_center')}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors mb-3 print:hidden"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                建築資源中心
              </button>
            )}

            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="text-2xl">📋</span>
                  <h1 className="text-xl font-bold text-gray-800">H2 法規自主檢討項目表</h1>
                </div>
                <p className="text-sm text-gray-500">
                  H2 階段自主法規檢核工具｜共 <span className="font-bold text-gray-700">{H2_CARDS.length}</span> 項主題
                  <span className="ml-2 text-amber-600 font-semibold">⭐ {starredCards.length} 項重要</span>
                </p>
              </div>

              {/* 操作按鈕組 */}
              <div className="flex items-center gap-2 print:hidden">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                  title="列印 / 存成 PDF"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  列印
                </button>
                <button onClick={expandAll}
                  className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                  全部展開
                </button>
                <button onClick={collapseAll}
                  className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                  全部收合
                </button>
              </div>
            </div>
          </div>

          {/* ── ⭐ 重要主題快速導覽 ──────────────────────────── */}
          {!query && !showOnlyBookmarked && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 print:hidden">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">⭐</span>
                <span className="text-sm font-bold text-amber-800">台中市特殊法規重要主題</span>
                <span className="text-xs text-amber-600 font-medium">點擊展開查看</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {starredCards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => {
                      setExpanded(prev => new Set([...prev, card.id]))
                      setTimeout(() => document.getElementById(`card-${card.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-amber-200 text-xs font-semibold text-amber-800 hover:bg-amber-100 hover:border-amber-300 transition-colors shadow-sm"
                  >
                    <span>{String(card.no).padStart(2, '0')}</span>
                    <span>{card.title}</span>
                    <span>⭐</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── 搜尋 + 篩選列 ─────────────────────────────── */}
          <div className="flex gap-2 mb-5 print:hidden">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
                </svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="搜尋，例如：停車、無障礙、採光、日照、危老、宜居、水湳"
                className="w-full pl-10 pr-9 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
              {query && (
                <button onClick={() => setQuery('')}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={() => setShowOnlyBookmarked(v => !v)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-colors shadow-sm shrink-0
                ${showOnlyBookmarked
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-600'}`}
            >
              <svg className="w-3.5 h-3.5" fill={showOnlyBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              收藏 {bookmarkCount > 0 && <span>({bookmarkCount})</span>}
            </button>
          </div>

          {(query || showOnlyBookmarked) && (
            <div className="text-xs text-gray-500 mb-3 print:hidden">
              {filtered.length > 0
                ? <>顯示 <span className="font-bold text-gray-700">{filtered.length}</span> 項{query ? `符合「${query}」的` : ''}主題</>
                : <span className="text-red-500">找不到符合的主題</span>
              }
            </div>
          )}

          {/* ── 卡片列表 ───────────────────────────────────── */}
          <div className="space-y-3">
            {filtered.map(card => (
              <div key={card.id} id={`card-${card.id}`}>
                <H2CardItem
                  card={card}
                  isExpanded={expanded.has(card.id)}
                  isBookmarked={bookmarks.has(card.id)}
                  onToggle={() => toggleExpand(card.id)}
                  onBookmark={() => toggleBookmark(card.id)}
                />
              </div>
            ))}
          </div>

          {/* 無結果 */}
          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <div className="text-4xl mb-3">{showOnlyBookmarked ? '⭐' : '🔍'}</div>
              <div className="text-sm font-semibold">
                {showOnlyBookmarked ? '尚未收藏任何主題' : `找不到「${query}」的相關主題`}
              </div>
              <button
                onClick={() => { setQuery(''); setShowOnlyBookmarked(false) }}
                className="mt-3 text-xs text-blue-500 hover:underline"
              >
                顯示全部
              </button>
            </div>
          )}

          {/* ── 頁尾提醒 ───────────────────────────────────── */}
          <div className="mt-10 flex items-start gap-2.5 p-4 bg-blue-50 border border-blue-100 rounded-xl print:hidden">
            <svg className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-blue-700 leading-relaxed">
              本表為 H2 階段法規自主檢討參考工具，適用建築師事務所內部教育訓練及案件自主檢核。法規數值以主管機關最新公告版本為準，正式申請前請與主辦建築師確認。
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
