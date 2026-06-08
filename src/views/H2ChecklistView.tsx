'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import type { AppView } from '@/types'

// ─── 型別 ──────────────────────────────────────────────────────────────────

interface H2Item {
  id: string
  title: string
  legalBasis: string    // 法源
  summary: string       // 條文摘要
  trigger: string       // 觸發條件
  commonErrors: string[]
  top20?: number        // TOP20 排名
}

interface H2Category {
  id: string
  headerBg: string      // tailwind bg class for colored header
  headerText: string    // text color on header
  badgeBg: string       // light badge bg
  badgeText: string     // badge text color
  borderColor: string
  lightBg: string
  emoji: string
  title: string
  legalRef: string
  items: H2Item[]
}

// ─── 資料：8 大分類 ────────────────────────────────────────────────────────

const H2_CATEGORIES: H2Category[] = [
  {
    id: 'fire_escape',
    headerBg: 'bg-red-600', headerText: 'text-white',
    badgeBg: 'bg-red-100', badgeText: 'text-red-700',
    borderColor: 'border-red-200', lightBg: 'bg-red-50',
    emoji: '🟥', title: '消防避難',
    legalRef: '建築技術規則第 90～108 條',
    items: [
      {
        id: 'fe-01', title: '安全梯', legalBasis: '建技§95～96',
        summary: '5層以上建築物需設安全梯，淨寬≥120cm，防火門朝逃生方向開啟，安全梯內不得設置可燃物',
        trigger: '建築物5層以上，或避難層以外之樓層供逃生使用之樓梯',
        commonErrors: ['安全梯淨寬不足120cm', '防火門開啟方向錯誤（應朝逃生方向）', '排煙窗面積或位置不符', '安全梯內設置雜物間或儲藏室'],
        top20: 4,
      },
      {
        id: 'fe-02', title: '全棟安全梯', legalBasis: '建技§95',
        summary: '11層以上建築物，所有供逃生使用之樓梯均需升級為安全梯，不得保留一般樓梯',
        trigger: '建築物樓層≥11層',
        commonErrors: ['部分樓梯未升級為安全梯', '安全梯數量不足（未依收容人數計算）', '服務梯誤計為安全梯'],
      },
      {
        id: 'fe-03', title: '戶外安全梯', legalBasis: '建技§96',
        summary: '設置於建築物外側之安全梯，需符合防風雨、採光及防火規定',
        trigger: '需設安全梯但室內空間不足，改設戶外安全梯時',
        commonErrors: ['戶外安全梯未設防風雨設施', '通往戶外安全梯走廊防火等級不足', '戶外樓梯踏面未防滑'],
      },
      {
        id: 'fe-04', title: '特別安全梯', legalBasis: '建技§96',
        summary: '11層以上或高度36m以上建築物需設特別安全梯，設前室（附室）面積≥5㎡，需有排煙設備',
        trigger: '建築物樓層≥11層，或高度≥36公尺',
        commonErrors: ['前室面積不足5㎡', '前室排煙窗位置或面積不符', '特別安全梯適用樓層判斷錯誤', '前室開口數量超限'],
        top20: 3,
      },
      {
        id: 'fe-05', title: '緊急昇降機', legalBasis: '建技§107',
        summary: '15層以上或高度50m以上需設緊急昇降機，載重≥1,150kg，機廂寬≥140cm×深≥135cm，直達地面層',
        trigger: '建築物樓層≥15層，或高度≥50公尺',
        commonErrors: ['機廂尺寸不足（寬140cm×深135cm）', '緊急昇降機未直達地面層', '機廳門防火等級不符（B種）', '昇降機數量不足'],
        top20: 2,
      },
      {
        id: 'fe-06', title: '緊急進口', legalBasis: '建技§108',
        summary: '11層以上建築物每3層需設緊急進口，間距≤40m，窗格淨尺寸≥75cm×120cm，設紅色標識燈',
        trigger: '建築物樓層≥11層',
        commonErrors: ['緊急進口間距超過40m', '標識燈未設置或位置錯誤（應設於外牆）', '進口窗格淨尺寸不足', '進口外側有固定障礙物'],
        top20: 1,
      },
      {
        id: 'fe-07', title: '步行距離', legalBasis: '建技§93',
        summary: '各居室至安全梯（或直通樓梯）之步行距離，集合住宅≤50m，辦公≤70m（依用途別）',
        trigger: '所有樓層之每個居室或使用空間',
        commonErrors: ['步行距離計算走道迂迴路徑錯誤', '走廊未連通造成路徑中斷', '混用分區距離規定適用錯誤', '廊道寬度不足導致路徑變長'],
        top20: 5,
      },
      {
        id: 'fe-08', title: '避難出口', legalBasis: '建技§90～92',
        summary: '每層收容人數超過一定規模需設2處以上避難出口，出口總淨寬依收容人數計算',
        trigger: '各樓層收容人數超過法定上限，或樓地板面積超過規定',
        commonErrors: ['避難出口淨寬不足', '兩出口位置太近（未保持直線距離≥1/2對角線）', '出口被捲門或鐵門限制開啟'],
      },
      {
        id: 'fe-09', title: '消防活動空間', legalBasis: '建技§108之1',
        summary: '高度≥7層或21m以上建築物，外牆需預留消防車迴轉空間及雲梯車作業區域',
        trigger: '建築物樓層≥7層，或高度≥21公尺',
        commonErrors: ['消防活動空間被景觀設施或停車格佔用', '消防道路淨寬不足4m', '地下構造物承重不足消防車', '作業面與建築外牆距離超出規定'],
        top20: 15,
      },
    ],
  },
  {
    id: 'fire_structure',
    headerBg: 'bg-blue-700', headerText: 'text-white',
    badgeBg: 'bg-blue-100', badgeText: 'text-blue-700',
    borderColor: 'border-blue-200', lightBg: 'bg-blue-50',
    emoji: '🟦', title: '防火構造',
    legalRef: '建築技術規則第 69～79-2 條',
    items: [
      {
        id: 'fs-01', title: '防火構造', legalBasis: '建技§69～70',
        summary: '依建築物用途、樓層數、高度決定防火構造等級（防火、耐火一小時或二小時）',
        trigger: '所有新建建築物',
        commonErrors: ['防火構造等級判斷錯誤（1小時vs2小時耐火時效）', '外牆耐火時效不足', '屋頂或樓板耐火等級未確認'],
      },
      {
        id: 'fs-02', title: '防火區劃', legalBasis: '建技§79',
        summary: '各層樓地板面積超過1,500㎡需設防火區劃，防火牆需有1小時以上耐火時效',
        trigger: '各層樓地板面積≥1,500㎡，或高層建築物各層',
        commonErrors: ['防火區劃面積超出1,500㎡上限', '防火門耐火時效等級不符', '電氣管線穿越防火牆未填塞', '防火閘門未設熔斷器'],
        top20: 6,
      },
      {
        id: 'fs-03', title: '垂直區劃', legalBasis: '建技§79-2',
        summary: '電梯道、管道間、樓梯間等豎穿部位需設防火區劃，防止火災垂直蔓延',
        trigger: '有豎穿部位（管道間、昇降機道、配線間）之建築物',
        commonErrors: ['管道間未設防火閘門', '豎穿部位開口未作防火處理', '廚房排煙管穿越樓板未防火填塞', '豎穿部位牆體耐火時效不足'],
        top20: 7,
      },
      {
        id: 'fs-04', title: '防火門', legalBasis: '建技§76',
        summary: '防火門依耐火時效分甲（1小時）、乙（30分）、丙種，需設自動閉門器，開啟方向朝逃生方向',
        trigger: '防火區劃開口部、安全梯入口、電梯廳、防火牆開口',
        commonErrors: ['防火門種類選用錯誤（甲/乙/丙）', '防火門未設自動閉門器', '防火門下方留縫超過規定（≤3mm）', '防火門門框未確實固定'],
      },
      {
        id: 'fs-05', title: '帷幕牆防火', legalBasis: '建技§79-1',
        summary: '帷幕牆建築物各樓層交接處需設防火填充材料，防止火焰由玻璃幕牆外側蔓延',
        trigger: '採帷幕牆外牆設計之建築物',
        commonErrors: ['各層交接處防火填充材料遺漏', '填充材料規格不符耐火要求', '玻璃接縫矽利康無防火效果卻誤用'],
      },
    ],
  },
  {
    id: 'lighting',
    headerBg: 'bg-orange-500', headerText: 'text-white',
    badgeBg: 'bg-orange-100', badgeText: 'text-orange-700',
    borderColor: 'border-orange-200', lightBg: 'bg-orange-50',
    emoji: '🟧', title: '採光日照',
    legalRef: '建築技術規則第 39-1～43 條',
    items: [
      {
        id: 'li-01', title: '北向日照', legalBasis: '建技§39-1',
        summary: '集合住宅各戶至少一間居室，冬至日（12/22）有效日照時數≥1小時（以真北為基準）',
        trigger: '新建集合住宅',
        commonErrors: ['誤用磁北代替真北計算', '日照計算軟體版本或參數設定錯誤', '平台或設備層遮蔽效果未納入', '計算基準點選錯（應為窗台高度）'],
        top20: 8,
      },
      {
        id: 'li-02', title: '日照檢討', legalBasis: '建技§39-1',
        summary: '日照計算須考慮基地及周邊建築遮蔽，以冬至日為計算基準，需附計算書',
        trigger: '集合住宅，或法規規定需日照檢討之建築物',
        commonErrors: ['相鄰建築高度或距離輸入錯誤', '遮蔽物範圍界定不清', '計算結果未附簽章之計算書', '以夏至日代替冬至日計算'],
        top20: 9,
      },
      {
        id: 'li-03', title: 'H/D高度比', legalBasis: '建技§42',
        summary: '建築物各部分高度H與至前院、側院或後院邊界距離D之比值，各方向有不同限制倍數',
        trigger: '所有新建建築物，各面向分別計算取最嚴值',
        commonErrors: ['基準點取錯（應從地面層計算）', '鄰接公共設施用地加算寬度遺漏', '複合使用各方位未分別計算', '退縮後可用高度計算方式錯誤'],
        top20: 10,
      },
      {
        id: 'li-04', title: '採光面積', legalBasis: '建技§40',
        summary: '居室採光開口面積≥樓地板面積1/8，採光開口需面向天空',
        trigger: '所有居室空間',
        commonErrors: ['採光計算未扣除屋簷或陽台遮蔽', '陽台空間計為居室直接採光（需穿透計算）', '地下室採光窗有效面積計算錯誤'],
      },
      {
        id: 'li-05', title: '有效採光', legalBasis: '建技§40',
        summary: '採光開口前方有遮蔽物時，有效採光面積依遮蔽角度折算，外廊深度有限制',
        trigger: '採光開口前方有陽台、廊道或雨遮等遮蔽物時',
        commonErrors: ['採光深度過深導致有效採光不足', '外廊深度超限未折算採光', '採光井尺寸不符規定'],
      },
      {
        id: 'li-06', title: '通風面積', legalBasis: '建技§43',
        summary: '居室通風開口面積≥樓地板面積1/20，且開口需為可開啟式（非固定玻璃）',
        trigger: '所有居室空間',
        commonErrors: ['通風開口為固定玻璃（不可開啟）', '通風開口面積不足1/20', '計算含不可開啟之氣窗或百葉'],
      },
      {
        id: 'li-07', title: '天井採光', legalBasis: '建技§40',
        summary: '面向天井（內院）之居室採光，天井最小寬度及深高比需符合規定',
        trigger: '居室採光面向天井（內院）時',
        commonErrors: ['天井尺寸不足最小寬度規定', '天井深高比超限', '天井內設置障礙物影響採光'],
      },
    ],
  },
  {
    id: 'living',
    headerBg: 'bg-green-600', headerText: 'text-white',
    badgeBg: 'bg-green-100', badgeText: 'text-green-700',
    borderColor: 'border-green-200', lightBg: 'bg-green-50',
    emoji: '🟩', title: '居住性能',
    legalRef: '建築技術規則第 46-2 條',
    items: [
      {
        id: 'lv-01', title: '樓板隔音', legalBasis: '建技§46-2',
        summary: '集合住宅分戶樓板需符合輕質衝擊音（Ln,w）≤58dB、重質衝擊音規定，需附隔音報告',
        trigger: '新建集合住宅之分戶樓板',
        commonErrors: ['隔音毯規格不符（厚度不足）', '浮式地板施工有橋接（側傳）', '管線穿孔隔音填塞遺漏', '系統板規格未送審即施工'],
        top20: 11,
      },
      {
        id: 'lv-02', title: '分戶牆隔音', legalBasis: '建技§46-2',
        summary: '集合住宅分戶牆空氣音隔音量（Rw）≥45dB，需附隔音性能證明',
        trigger: '新建集合住宅之分戶牆（含RC牆及輕隔間）',
        commonErrors: ['分戶牆厚度不足', '分戶牆有縫隙或管線孔洞未封堵', '輕隔間材料隔音性能未達標', '牆體未到頂留縫'],
        top20: 12,
      },
      {
        id: 'lv-03', title: '分間牆隔音', legalBasis: '建技§46-2',
        summary: '住宅各房間分間牆需符合一定隔音性能，建議Rw≥40dB',
        trigger: '集合住宅室內各分間牆（臥室、浴室等）',
        commonErrors: ['輕隔間施工未到頂（留縫）', '插座背對背設置導致隔音失效', '未選用具隔音等級認證之材料'],
      },
      {
        id: 'lv-04', title: '管線穿牆隔音', legalBasis: '建技§46-2',
        summary: '給排水管、電氣管線穿越分戶牆或分戶樓板，需以防火隔音材料確實填塞',
        trigger: '管線穿越分戶牆或分戶樓板之每個貫穿孔',
        commonErrors: ['穿牆孔未填塞或填塞不完整', '使用一般矽利康替代防火隔音填塞材', '施工後未進行品質確認'],
      },
    ],
  },
  {
    id: 'parking',
    headerBg: 'bg-yellow-500', headerText: 'text-white',
    badgeBg: 'bg-yellow-100', badgeText: 'text-yellow-700',
    borderColor: 'border-yellow-200', lightBg: 'bg-yellow-50',
    emoji: '🟨', title: '停車交通',
    legalRef: '建築技術規則第 59 條、臺中市停車空間設置管理辦法',
    items: [
      {
        id: 'pk-01', title: '汽車位', legalBasis: '建技§59、台中市停管辦法',
        summary: '依建築用途及樓地板面積計算法定停車位數，標準車位≥2.5m×6m，機械停車另有規定',
        trigger: '所有新建建築物',
        commonErrors: ['停車位數量計算基準版本用錯', '標準車位尺寸不足2.5m×6m', '機械停車設備規格未送審確認'],
      },
      {
        id: 'pk-02', title: '機車位', legalBasis: '台中市停管辦法',
        summary: '集合住宅每戶至少設1個機車位，商辦依樓地板面積比例設置，機車位尺寸≥0.9m×2.2m',
        trigger: '所有新建集合住宅及商辦建築',
        commonErrors: ['機車位數量不足', '機車位尺寸不符（0.9m×2.2m以上）', '機車停車場通道寬度不足'],
      },
      {
        id: 'pk-03', title: '自行車位', legalBasis: '台中市停管辦法',
        summary: '達一定規模之建築物需設自行車停車空間，需設雨遮及固定設施',
        trigger: '達規定規模之集合住宅及商辦（依台中市辦法）',
        commonErrors: ['未設雨遮遮蔽', '缺少車架固定設施（u型架）', '設置於地下室但無出入坡道動線'],
      },
      {
        id: 'pk-04', title: '車道寬度', legalBasis: '建技§59-1',
        summary: '單向車道淨寬≥350cm，雙向≥550cm，轉彎處依迴轉半徑規定加寬',
        trigger: '所有地下停車場及立體停車場車道',
        commonErrors: ['直道淨寬不足350cm', '轉彎內緣至牆或柱距不足', '車道兩側柱位侵入有效淨寬'],
      },
      {
        id: 'pk-05', title: '車道坡度', legalBasis: '建技§59-1',
        summary: '車道縱向坡度≤1/6（約16.7%），坡道頂底端需設緩和段（水平長度≥3.6m）',
        trigger: '地下停車場斜坡車道',
        commonErrors: ['坡度超出1/6限制', '坡道頂底端未設緩和段', '坡道路面未做防滑處理（抓地紋）'],
      },
      {
        id: 'pk-06', title: '車道淨高', legalBasis: '建技§59-1',
        summary: '停車位及車道淨高≥200cm，無障礙停車位上方淨高≥250cm',
        trigger: '所有停車場空間',
        commonErrors: ['結構樑下淨高不足200cm', '無障礙車位上方淨高不足250cm', '消防管線或空調管道影響有效淨高'],
      },
      {
        id: 'pk-07', title: '車道出入口視距', legalBasis: '建技§59-1',
        summary: '車道出入口兩側需保留視距三角形，三角形內不得設置遮蔽物，確保行車安全',
        trigger: '所有車道出入口（地面層及地下停車場入口）',
        commonErrors: ['視距三角形內設置圍牆或植栽', '出入口鄰近轉角未留足視距', '坡道頂端視線被樑或雨遮遮擋'],
        top20: 16,
      },
      {
        id: 'pk-08', title: '迴轉半徑', legalBasis: '建技§59-1',
        summary: '地下停車場車道轉彎內緣半徑≥3m、外緣≥6m，消防車迴轉半徑另有規定',
        trigger: '停車場彎道及轉角處',
        commonErrors: ['轉彎內緣半徑不足3m', '柱位設計未考量轉彎車輛軌跡', '消防車迴轉空間不足（≥12m迴轉直徑）'],
      },
      {
        id: 'pk-09', title: '垃圾車動線', legalBasis: '臺中市環保法規',
        summary: '垃圾集中場需有垃圾車可抵達之路線，地下垃圾房需設置垃圾升降設備',
        trigger: '集合住宅及達規模之商辦建築',
        commonErrors: ['垃圾集中場無法讓垃圾車直達（有高差或轉彎太緊）', '地下垃圾房未設升降設備', '垃圾房位置影響法定停車位計算'],
      },
    ],
  },
  {
    id: 'accessibility',
    headerBg: 'bg-purple-600', headerText: 'text-white',
    badgeBg: 'bg-purple-100', badgeText: 'text-purple-700',
    borderColor: 'border-purple-200', lightBg: 'bg-purple-50',
    emoji: '🟪', title: '無障礙',
    legalRef: '建築技術規則第 167～170 條',
    items: [
      {
        id: 'ac-01', title: '無障礙車位', legalBasis: '建技§170',
        summary: '停車位≥5個需設無障礙停車位，尺寸≥3.5m×6m，上方淨高≥250cm，鄰接無障礙通路',
        trigger: '法定停車位數量≥5個',
        commonErrors: ['無障礙車位尺寸不足（3.5m×6m）', '上方淨高不足250cm', '與無障礙通路未連接或有高差'],
        top20: 14,
      },
      {
        id: 'ac-02', title: '無障礙通路', legalBasis: '建技§167',
        summary: '從基地出入口至建築物主要出入口需設連續無障礙通路，淨寬≥90cm，地面防滑',
        trigger: '公共建築物及規定規模以上之集合住宅',
        commonErrors: ['通路淨寬不足90cm', '通路有高差未設坡道（如排水溝蓋）', '通路材質不防滑（光滑磁磚）'],
      },
      {
        id: 'ac-03', title: '無障礙坡道', legalBasis: '建技§168',
        summary: '坡道坡度≤1/12，淨寬≥90cm，超過6m需設平台（≥150cm），兩側設扶手（高75～85cm）',
        trigger: '基地或建築物內有高差需克服時',
        commonErrors: ['坡道坡度超過1/12（特殊≤1/8需先申請）', '坡道淨寬不足90cm', '超過6m未設休息平台', '扶手高度不符（75～85cm）'],
      },
      {
        id: 'ac-04', title: '無障礙昇降機', legalBasis: '建技§169',
        summary: '機廂寬≥140cm×深≥135cm，設點字按鈕、語音報層、光電感應門，廳門淨寬≥80cm',
        trigger: '6層以上建築物（需設無障礙昇降機）',
        commonErrors: ['機廂深度不足135cm', '廳門淨寬不足80cm', '點字按鈕位置不符（高85～90cm）', '語音報層裝置遺漏'],
      },
      {
        id: 'ac-05', title: '無障礙廁所', legalBasis: '建技§170',
        summary: '廁所面積≥4.9㎡，出入口淨寬≥80cm，設L型扶手、緊急呼叫鈕、馬桶高40～45cm',
        trigger: '公共廁所及規定規模以上集合住宅公共衛生設備',
        commonErrors: ['廁所面積不足4.9㎡', '出入口淨寬不足80cm', '扶手高度或型式不符', '緊急呼叫鈕遺漏'],
      },
    ],
  },
  {
    id: 'height_mass',
    headerBg: 'bg-stone-600', headerText: 'text-white',
    badgeBg: 'bg-stone-100', badgeText: 'text-stone-700',
    borderColor: 'border-stone-200', lightBg: 'bg-stone-50',
    emoji: '🟫', title: '高度量體',
    legalRef: '建築技術規則、都市計畫法、臺中市使用分區管制要點',
    items: [
      {
        id: 'hm-01', title: '建築高度', legalBasis: '建技§9、都計法§32、台中市管制要點',
        summary: '依使用分區及特定地區（航空噪音、文化景觀）規定之最大建築高度限制',
        trigger: '所有新建建築物',
        commonErrors: ['屋突層高度未計入總高度', '設備（水塔、機電室）高度超出屋突規定', '特定地區高度限制（航道）遺漏查核'],
      },
      {
        id: 'hm-02', title: '建蔽率', legalBasis: '都計法§32、台中市管制要點',
        summary: '建築面積÷基地面積×100%，不得超過使用分區規定上限',
        trigger: '所有新建建築物',
        commonErrors: ['基地面積未扣除計畫道路用地', '開放空間獎勵計算超出上限', '套繪圖範圍未預先確認影響可建面積'],
      },
      {
        id: 'hm-03', title: '容積率', legalBasis: '都計法§32、台中市管制要點',
        summary: '各層樓地板面積總和÷基地面積×100%，含各類獎勵加總上限管控',
        trigger: '所有新建建築物',
        commonErrors: ['免計容積超出規定上限仍全額計算', '多種獎勵加總未設上限管控', '容積移轉受體基地容積計算錯誤'],
      },
      {
        id: 'hm-04', title: '前院退縮', legalBasis: '台中市管制要點、都審規範',
        summary: '建築物面向道路側需退縮之最小距離，依使用分區及道路寬度規定',
        trigger: '面向道路之建築立面',
        commonErrors: ['退縮深度不足', '退縮地設置不符規定之構造物（圍牆、花台）', '陽台或雨遮侵入退縮範圍'],
      },
      {
        id: 'hm-05', title: '側院退縮', legalBasis: '台中市管制要點',
        summary: '建築物側面向鄰地境界線需退縮之最小距離',
        trigger: '建築物側面鄰接鄰地境界線',
        commonErrors: ['側院深度不足', '側院被車道或設備佔用', '角地兩向側院規定混淆'],
      },
      {
        id: 'hm-06', title: '後院退縮', legalBasis: '台中市管制要點',
        summary: '建築物後側向鄰地境界線需退縮之最小距離，部分地區後院不得設置構造物',
        trigger: '建築物後側鄰接鄰地境界線',
        commonErrors: ['後院深度不足', '後院被儲藏室或機房佔用', '不規則基地後院判斷錯誤'],
      },
      {
        id: 'hm-07', title: '建築線', legalBasis: '建築法§48',
        summary: '建築物不得超越依法指定之建築線，建築線申請與現況核對是早期必做作業',
        trigger: '所有臨路新建建築物（申照前需申請建築線）',
        commonErrors: ['建築線申請圖與現況不符', '地界線混淆建築線', '鄰地寬度影響建築線重新指定'],
      },
      {
        id: 'hm-08', title: '防空避難室', legalBasis: '建技§141',
        summary: '總樓地板面積≥1,000㎡或特定用途建築物需設防空避難室，淨高≥220cm，出口數量規定',
        trigger: '建築物總樓地板面積≥1,000㎡',
        commonErrors: ['防空避難室面積計算錯誤', '出入口數量不足或寬度不符', '淨高不足220cm（被樑或管線佔用）'],
        top20: 13,
      },
    ],
  },
  {
    id: 'taichung_special',
    headerBg: 'bg-slate-700', headerText: 'text-white',
    badgeBg: 'bg-slate-100', badgeText: 'text-slate-700',
    borderColor: 'border-slate-200', lightBg: 'bg-slate-50',
    emoji: '🏢', title: '台中特殊法規',
    legalRef: '臺中市宜居建築辦法、都審規範、容積獎勵相關辦法',
    items: [
      {
        id: 'tc-01', title: '宜居陽台', legalBasis: '台中市宜居建築辦法',
        summary: '宜居陽台深度≥150cm，每戶至少1處符合規定，可申請容積獎勵（上限10%）',
        trigger: '申請宜居建築容積獎勵（陽台項目）時',
        commonErrors: ['陽台深度不足150cm', '宜居陽台與一般法定陽台混淆未標示', '未在送照圖說中標示「宜居陽台」'],
        top20: 18,
      },
      {
        id: 'tc-02', title: '宜居平台', legalBasis: '台中市宜居建築辦法',
        summary: '設置供住戶使用之公共露台或平台，面積及設施種類依辦法規定，需確保公共可使用性',
        trigger: '申請宜居建築容積獎勵（平台設施項目）時',
        commonErrors: ['平台面積未達規定最小值', '平台設施種類不符辦法規定', '平台設有門禁影響公共性'],
      },
      {
        id: 'tc-03', title: '宜居回饋金', legalBasis: '台中市宜居建築辦法',
        summary: '部分宜居獎勵項目需按容積獎勵量繳交回饋金至市府基金，回饋金計算依辦法規定',
        trigger: '申請特定宜居容積獎勵項目時',
        commonErrors: ['回饋金計算基準錯誤（以公告地價計算）', '遺漏回饋金申報手續', '未配合申請流程確認繳納時程'],
      },
      {
        id: 'tc-04', title: '開放空間透空率', legalBasis: '台中市開放空間設計規定',
        summary: '開放空間上方透空率需達一定比例（通常≥60%），遮蔽設施受嚴格限制',
        trigger: '設置法定開放空間或申請開放空間容積獎勵時',
        commonErrors: ['透空率計算面積基準錯誤', '棚架或雨遮侵入透空範圍計算', '植栽樹冠計入遮蔽面積'],
        top20: 17,
      },
      {
        id: 'tc-05', title: '開放空間告示牌', legalBasis: '台中市開放空間管理辦法',
        summary: '開放空間需設置告示牌，標示開放時間（不得設門禁）、面積、管理單位及緊急聯絡資訊',
        trigger: '設置法定開放空間或申請開放空間容積獎勵時',
        commonErrors: ['告示牌尺寸或標示內容不符規定', '告示牌設置位置不明顯（應設於主要出入口）', '開放時間限制（不得全天關閉）'],
      },
      {
        id: 'tc-06', title: '維管計畫', legalBasis: '台中市開放空間管理辦法',
        summary: '設有開放空間之建築物需提送維護管理計畫，包含日常清潔、設施維護及管理責任歸屬',
        trigger: '有設置法定開放空間之建築物（使照申請時）',
        commonErrors: ['維管計畫內容過於簡略被退件', '未指定管理單位或負責人', '維管費用來源未說明'],
      },
      {
        id: 'tc-07', title: '容積移轉', legalBasis: '都市計畫容積移轉實施辦法',
        summary: '公共設施保留地（送出基地）之容積移入受體基地，需完成容積移轉登記，上限為法定容積30%',
        trigger: '申請容積移轉獎勵時',
        commonErrors: ['送出基地資格不符（非公共設施保留地）', '移入容積計算超出上限', '容積移轉登記程序未完成即申報'],
      },
      {
        id: 'tc-08', title: '危老獎勵', legalBasis: '都市危老條例',
        summary: '危老重建容積獎勵含基本獎勵（10%）、時程獎勵（每年遞減，最高10%）及設計評分獎勵',
        trigger: '屋齡≥30年或結構耐震評估不足之危老重建案',
        commonErrors: ['時程獎勵年限計算錯誤（從核准日起算）', '容積獎勵加總超出法定上限', '危老條件鑑定報告格式不符規定'],
      },
      {
        id: 'tc-09', title: '都更獎勵', legalBasis: '都市更新條例',
        summary: '都市更新容積獎勵依更新單元面積、土地所有權人同意比例及設計品質給予獎勵',
        trigger: '劃定都市更新地區或自行劃定更新單元',
        commonErrors: ['同意比例計算錯誤（需達法定比例）', '獎勵項目與都更計畫書不一致', '更新後容積超出法定上限'],
      },
      {
        id: 'tc-10', title: '屋脊裝飾物', legalBasis: '台中市都審規範',
        summary: '屋頂裝飾物、屋脊造型高度及比例需符合都市設計審議規範，不得影響天際線',
        trigger: '適用台中市都市設計審議之建築物',
        commonErrors: ['屋脊裝飾物高度超出規定', '裝飾物材質或顏色不符規範', '未送都審即進行設計並施工'],
        top20: 19,
      },
      {
        id: 'tc-11', title: '外牆裝飾物', legalBasis: '台中市都審規範（裝飾板花台2.0版）',
        summary: '外牆花台、裝飾板等構造物尺寸、深度及間距需符合最新版都審規範（2.0版）',
        trigger: '適用台中市都市設計審議之建築物',
        commonErrors: ['裝飾板深度超出規定上限', '花台尺寸不符2.0版新規定', '套用舊版規範未更新至最新2.0版'],
        top20: 20,
      },
      {
        id: 'tc-12', title: '景觀照明', legalBasis: '台中市都審規範',
        summary: '建築物景觀照明需符合都審規範，避免光害並考量節能及夜間景觀協調',
        trigger: '適用台中市都市設計審議之建築物',
        commonErrors: ['照明設計未納入都審送件圖說', '廣告燈箱未申請（需另申請廣告物許可）', '照明亮度超出規範上限'],
      },
      {
        id: 'tc-13', title: '街道家具', legalBasis: '台中市都審規範',
        summary: '建築退縮範圍內設置之街道家具（座椅、腳踏車架、花台等）需符合都審規範及無障礙規定',
        trigger: '適用台中市都市設計審議且有退縮空間之建築物',
        commonErrors: ['街道家具影響無障礙通路淨寬', '未經都審核准擅自設置', '家具尺寸侵入行人通行空間'],
      },
    ],
  },
]

// ─── TOP20 清單 ────────────────────────────────────────────────────────────

interface Top20Item {
  rank: number
  id: string
  title: string
  catTitle: string
  catId: string
  catHeaderBg: string
  catHeaderText: string
  legalBasis: string
}

const TOP20_LIST: Top20Item[] = H2_CATEGORIES
  .flatMap(cat =>
    cat.items
      .filter(item => item.top20 !== undefined)
      .map(item => ({
        rank: item.top20!,
        id: item.id,
        title: item.title,
        catTitle: cat.title,
        catId: cat.id,
        catHeaderBg: cat.headerBg,
        catHeaderText: cat.headerText,
        legalBasis: item.legalBasis,
      }))
  )
  .sort((a, b) => a.rank - b.rank)

// 全部 item 攤平（搜尋用）
const ALL_ITEMS: (H2Item & { cat: H2Category })[] = H2_CATEGORIES.flatMap(cat =>
  cat.items.map(item => ({ ...item, cat }))
)

// ─── 搜尋邏輯 ──────────────────────────────────────────────────────────────

function matchItem(item: H2Item, q: string): boolean {
  if (!q) return true
  const lower = q.toLowerCase()
  return (
    item.title.toLowerCase().includes(lower) ||
    item.summary.toLowerCase().includes(lower) ||
    item.legalBasis.toLowerCase().includes(lower) ||
    item.trigger.toLowerCase().includes(lower) ||
    item.commonErrors.some(e => e.toLowerCase().includes(lower))
  )
}

// ─── 元件：單一 Accordion 項目 ────────────────────────────────────────────

interface ItemProps {
  item: H2Item
  cat: H2Category
  isExpanded: boolean
  isBookmarked: boolean
  isChecked: boolean
  onToggle: () => void
  onBookmark: () => void
  onCheck: () => void
}

function H2ItemRow({ item, cat, isExpanded, isBookmarked, isChecked, onToggle, onBookmark, onCheck }: ItemProps) {
  return (
    <div
      id={`item-${item.id}`}
      className={`rounded-xl border transition-all duration-200 print-card
        ${isExpanded ? `${cat.borderColor} shadow-sm` : 'border-gray-200 hover:border-gray-300'}`}
    >
      {/* 標題列 */}
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-3 flex items-center gap-3 group"
      >
        {/* 已檢討 checkbox */}
        <div
          role="checkbox"
          aria-checked={isChecked}
          onClick={e => { e.stopPropagation(); onCheck() }}
          className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer
            ${isChecked ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400 bg-white'}`}
          title={isChecked ? '取消已檢討' : '標記已檢討'}
        >
          {isChecked && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        {/* TOP20 標記 */}
        {item.top20 && (
          <span className="shrink-0 text-[10px] font-bold bg-red-100 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full">
            TOP{item.top20}
          </span>
        )}

        {/* 標題 */}
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-bold leading-tight ${isChecked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {item.title}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">{item.legalBasis}</div>
        </div>

        {/* 收藏 */}
        <button
          onClick={e => { e.stopPropagation(); onBookmark() }}
          className={`shrink-0 p-1.5 rounded-lg transition-colors print:hidden
            ${isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-gray-300 hover:text-amber-400'}`}
          title={isBookmarked ? '取消收藏' : '加入收藏'}
        >
          <svg className="w-3.5 h-3.5" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>

        {/* 展開箭頭 */}
        <div className={`shrink-0 text-gray-400 transition-transform duration-200 print:hidden ${isExpanded ? 'rotate-180' : ''}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* 展開內容 */}
      {isExpanded && (
        <div className={`px-4 pb-4 pt-3 border-t ${cat.borderColor} space-y-3`}>

          {/* 法源 */}
          <div className="flex items-start gap-2">
            <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.badgeBg} ${cat.badgeText}`}>
              📖 法源
            </span>
            <span className="text-xs text-gray-700 leading-relaxed pt-0.5">{item.legalBasis}</span>
          </div>

          {/* 條文摘要 */}
          <div className={`rounded-lg p-3 ${cat.lightBg}`}>
            <div className="text-[10px] font-bold text-gray-500 mb-1">📋 條文摘要</div>
            <p className="text-xs text-gray-700 leading-relaxed">{item.summary}</p>
          </div>

          {/* 觸發條件 */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-[10px] font-bold text-blue-600 mb-1">⚡ 觸發條件</div>
            <p className="text-xs text-blue-800 leading-relaxed">{item.trigger}</p>
          </div>

          {/* 常見錯誤 */}
          <div className="bg-red-50 rounded-lg p-3">
            <div className="text-[10px] font-bold text-red-600 mb-1.5">⚠️ 常見錯誤</div>
            <ul className="space-y-1">
              {item.commonErrors.map((err, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-red-700 leading-relaxed">
                  <span className="shrink-0 mt-0.5">❌</span>
                  {err}
                </li>
              ))}
            </ul>
          </div>

          {/* 是否已檢討 */}
          <div
            onClick={onCheck}
            className={`flex items-center gap-2.5 rounded-lg p-3 border cursor-pointer transition-all
              ${isChecked
                ? 'bg-green-50 border-green-200'
                : 'bg-white border-gray-200 hover:border-green-300 hover:bg-green-50/50'}`}
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0
              ${isChecked ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
              {isChecked && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className={`text-xs font-semibold ${isChecked ? 'text-green-700' : 'text-gray-500'}`}>
              {isChecked ? '✅ 已完成自主檢討' : '點擊標記「已檢討」'}
            </span>
          </div>

        </div>
      )}
    </div>
  )
}

// ─── 元件：分類區塊 ────────────────────────────────────────────────────────

interface CategoryProps {
  cat: H2Category
  filteredItems: H2Item[]
  expanded: Set<string>
  bookmarks: Set<string>
  checked: Set<string>
  onToggle: (id: string) => void
  onBookmark: (id: string) => void
  onCheck: (id: string) => void
}

function CategoryBlock({ cat, filteredItems, expanded, bookmarks, checked, onToggle, onBookmark, onCheck }: CategoryProps) {
  if (filteredItems.length === 0) return null
  const checkedCount = filteredItems.filter(i => checked.has(i.id)).length

  return (
    <section id={`cat-${cat.id}`} className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* 彩色分類標頭 */}
      <div className={`${cat.headerBg} px-5 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">{cat.emoji}</span>
          <h2 className={`font-bold text-sm ${cat.headerText}`}>{cat.title}</h2>
          <span className="text-xs text-white/70 font-medium">{filteredItems.length} 項</span>
        </div>
        <div className="flex items-center gap-3">
          {/* 進度 */}
          <span className="text-[11px] text-white/80 font-medium">
            {checkedCount}/{filteredItems.length} 已檢討
          </span>
          {checkedCount === filteredItems.length && filteredItems.length > 0 && (
            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">✓ 完成</span>
          )}
        </div>
      </div>

      {/* 法源參考 */}
      <div className="px-5 py-2 bg-white border-b border-gray-100">
        <span className="text-[10px] text-gray-400">法源：{cat.legalRef}</span>
      </div>

      {/* 進度條 */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-green-500 transition-all duration-500"
          style={{ width: filteredItems.length > 0 ? `${(checkedCount / filteredItems.length) * 100}%` : '0%' }}
        />
      </div>

      {/* 項目列表 */}
      <div className="bg-white px-4 py-3 space-y-2">
        {filteredItems.map(item => (
          <H2ItemRow
            key={item.id}
            item={item}
            cat={cat}
            isExpanded={expanded.has(item.id)}
            isBookmarked={bookmarks.has(item.id)}
            isChecked={checked.has(item.id)}
            onToggle={() => onToggle(item.id)}
            onBookmark={() => onBookmark(item.id)}
            onCheck={() => onCheck(item.id)}
          />
        ))}
      </div>
    </section>
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
  const [checked, setChecked]     = useState<Set<string>>(new Set())
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false)
  const [showTop20, setShowTop20] = useState(true)

  // localStorage
  useEffect(() => {
    try {
      const bk = localStorage.getItem('h2-bookmarks')
      if (bk) setBookmarks(new Set(JSON.parse(bk) as string[]))
      const ck = localStorage.getItem('h2-checked')
      if (ck) setChecked(new Set(JSON.parse(ck) as string[]))
    } catch {}
  }, [])

  const saveBookmarks = useCallback((next: Set<string>) => {
    setBookmarks(next)
    try { localStorage.setItem('h2-bookmarks', JSON.stringify([...next])) } catch {}
  }, [])

  const saveChecked = useCallback((next: Set<string>) => {
    setChecked(next)
    try { localStorage.setItem('h2-checked', JSON.stringify([...next])) } catch {}
  }, [])

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      saveBookmarks(next)
      return next
    })
  }, [saveBookmarks])

  const toggleChecked = useCallback((id: string) => {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      saveChecked(next)
      return next
    })
  }, [saveChecked])

  const toggleExpand = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const allIds = useMemo(() => ALL_ITEMS.map(i => i.id), [])
  const expandAll   = () => setExpanded(new Set(allIds))
  const collapseAll = () => setExpanded(new Set())

  const handlePrint = () => {
    expandAll()
    setTimeout(() => window.print(), 300)
  }

  const scrollToItem = (id: string) => {
    setExpanded(prev => new Set([...prev, id]))
    setTimeout(() => {
      document.getElementById(`item-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  // 篩選
  const q = query.trim()
  const filteredByCategory = useMemo(() =>
    H2_CATEGORIES.map(cat => ({
      cat,
      items: cat.items.filter(item => {
        if (!matchItem(item, q)) return false
        if (showOnlyBookmarked && !bookmarks.has(item.id)) return false
        return true
      }),
    })).filter(({ items }) => items.length > 0),
    [q, showOnlyBookmarked, bookmarks]
  )

  const totalFiltered = filteredByCategory.reduce((acc, { items }) => acc + items.length, 0)
  const totalItems    = ALL_ITEMS.length
  const totalChecked  = [...checked].filter(id => allIds.includes(id)).length

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area { position: absolute; top: 0; left: 0; width: 100%; }
          .print-card { break-inside: avoid; margin-bottom: 1rem; }
          .print\\:hidden { display: none !important; }
          @page { margin: 1.5cm; size: A4; }
        }
      `}</style>

      <div className="w-full md:flex-1 md:overflow-y-auto bg-gray-50">
        <div className="print-area max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-12">

          {/* ── 頁首 ───────────────────────────────────────── */}
          <div className="mb-5">
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
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="text-2xl">📋</span>
                  <h1 className="text-xl font-bold text-gray-800">H2 法規自主檢討項目表</h1>
                </div>
                <p className="text-sm text-gray-500">
                  共 <span className="font-bold text-gray-700">{totalItems}</span> 項｜{8} 大分類｜
                  已檢討 <span className="font-bold text-green-600">{totalChecked}</span>/{totalItems}
                </p>
              </div>

              <div className="flex items-center gap-2 print:hidden">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  列印
                </button>
                <button onClick={expandAll}
                  className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                  全展開
                </button>
                <button onClick={collapseAll}
                  className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                  全收合
                </button>
              </div>
            </div>

            {/* 整體進度條 */}
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: totalItems > 0 ? `${(totalChecked / totalItems) * 100}%` : '0%' }}
              />
            </div>
          </div>

          {/* ── 搜尋 + 篩選 ────────────────────────────────── */}
          <div className="flex gap-2 mb-5 print:hidden">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
                </svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="搜尋，例如：緊急進口、步行距離、無障礙、隔音、日照、宜居"
                className="w-full pl-10 pr-9 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
              {query && (
                <button onClick={() => setQuery('')}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={() => setShowOnlyBookmarked(v => !v)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-colors shadow-sm shrink-0
                ${showOnlyBookmarked ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-gray-200 text-gray-500 hover:border-amber-300'}`}
            >
              <svg className="w-3.5 h-3.5" fill={showOnlyBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              收藏 {bookmarks.size > 0 && `(${bookmarks.size})`}
            </button>
          </div>

          {(q || showOnlyBookmarked) && (
            <div className="text-xs text-gray-500 mb-3 print:hidden">
              {totalFiltered > 0
                ? <>顯示 <span className="font-bold text-gray-700">{totalFiltered}</span> 項{q ? `符合「${q}」的` : ''}主題</>
                : <span className="text-red-500">找不到符合的主題</span>
              }
            </div>
          )}

          {/* ── TOP20 最常漏檢討警示區塊 ─────────────────── */}
          {!q && !showOnlyBookmarked && (
            <div className="mb-6 print:hidden">
              <button
                onClick={() => setShowTop20(v => !v)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚨</span>
                  <span className="font-bold text-sm">H2 最常漏檢討 TOP 20</span>
                  <span className="text-xs text-red-200 font-medium">★★★★★ 最重要</span>
                </div>
                <svg
                  className={`w-4 h-4 text-red-200 transition-transform duration-200 ${showTop20 ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showTop20 && (
                <div className="border border-red-200 rounded-b-xl bg-white overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-red-100">
                    {TOP20_LIST.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToItem(item.id)}
                        className={`flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left
                          ${idx % 2 === 0 && idx < TOP20_LIST.length - 1 ? 'border-b border-red-100' : ''}
                          ${Math.floor(idx / 2) % 2 === 0 ? '' : 'bg-gray-50/50'}`}
                      >
                        <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold
                          ${item.rank <= 5 ? 'bg-red-600 text-white' : item.rank <= 10 ? 'bg-red-400 text-white' : 'bg-red-100 text-red-600'}`}>
                          {item.rank}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-gray-800 truncate">{item.title}</div>
                          <div className="text-[10px] text-gray-400">{item.legalBasis}</div>
                        </div>
                        <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white ${item.catHeaderBg}`}>
                          {item.catTitle}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="px-4 py-2 bg-red-50 border-t border-red-100">
                    <p className="text-[10px] text-red-500">點擊任一項目可快速跳轉至詳細說明</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── 分類區塊列表 ───────────────────────────────── */}
          <div className="space-y-4">
            {filteredByCategory.map(({ cat, items }) => (
              <CategoryBlock
                key={cat.id}
                cat={cat}
                filteredItems={items}
                expanded={expanded}
                bookmarks={bookmarks}
                checked={checked}
                onToggle={toggleExpand}
                onBookmark={toggleBookmark}
                onCheck={toggleChecked}
              />
            ))}
          </div>

          {/* 無結果 */}
          {filteredByCategory.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <div className="text-4xl mb-3">{showOnlyBookmarked ? '⭐' : '🔍'}</div>
              <div className="text-sm font-semibold">
                {showOnlyBookmarked ? '尚未收藏任何項目' : `找不到「${query}」的相關項目`}
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
              本表為 H2 階段常用法規自主檢討參考，法規數值以主管機關最新公告版本為準。「已檢討」狀態儲存於本機裝置，正式申請前請與主辦建築師及送照人員確認。
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
