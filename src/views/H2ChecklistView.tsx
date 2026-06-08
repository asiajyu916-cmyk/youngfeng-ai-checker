'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import type { AppView } from '@/types'

// ─── 型別 ──────────────────────────────────────────────────────────────────

interface H2Card {
  id: string
  no: number
  title: string
  desc: string
  checkItems: string[]
  keyPoints: string[]
  commonErrors: string[]
  legalBasis: string[]
  keywords: string[]
}

// ─── 15 張卡片資料 ─────────────────────────────────────────────────────────

const H2_CARDS: H2Card[] = [
  {
    id: 'c01', no: 1, title: '建築面積', desc: '計算範圍、陽台、花台、騎樓免計確認',
    checkItems: [
      '建築面積計算範圍確認（外牆中心線以內水平投影）',
      '陽台深度超過 2 公尺部分是否計入',
      '雨遮、遮陽板計入面積確認',
      '花台設計是否超出免計範圍',
      '騎樓、開放空間免計面積確認',
      '複合使用各部分建築面積分算',
    ],
    keyPoints: [
      '建築面積依外牆中心線以內水平投影面積計算',
      '陽台深度超過一定限制者，超出部分計入建築面積',
      '騎樓及開放空間依規定得免計入建築面積',
      '地下層建築面積依各縣市規定計算',
    ],
    commonErrors: [
      '陽台超出免計深度未計入建築面積',
      '花台設計超出規範未認列面積',
      '複合使用建築面積分算比例錯誤',
      '地下室建築面積計算基準混淆',
    ],
    legalBasis: ['建築技術規則建築設計施工編第 1 條', '建築面積及各層樓地板面積計算規則'],
    keywords: ['建築面積', '陽台', '花台', '騎樓', '雨遮', '面積計算'],
  },
  {
    id: 'c02', no: 2, title: '建蔽率', desc: '法定上限、基地面積認定、套繪確認',
    checkItems: [
      '查驗使用分區建蔽率上限',
      '建築面積計算總量確認',
      '基地面積認定（扣除道路用地）',
      '開放空間獎勵增加建蔽率申請',
      '套繪圖範圍及現況確認',
      '相鄰地合併計算方式確認',
    ],
    keyPoints: [
      '建蔽率 = 建築面積 ÷ 基地面積 × 100%',
      '依各都市計畫使用分區管制要點規定上限',
      '開放空間設置可依規定增加建蔽率',
      '基地面積不含計畫道路用地',
    ],
    commonErrors: [
      '基地面積未扣除道路用地或既成巷道',
      '套繪圖範圍未事先確認，影響可建面積',
      '多筆地號合併計算時邊界認定錯誤',
      '開放空間獎勵計算超出上限',
    ],
    legalBasis: ['都市計畫法第 32 條', '臺中市各都市計畫區使用分區管制要點'],
    keywords: ['建蔽率', '基地面積', '套繪', '開放空間', '使用分區'],
  },
  {
    id: 'c03', no: 3, title: '容積率', desc: '法定容積、免計項目、獎勵加總上限',
    checkItems: [
      '查驗使用分區容積率上限',
      '各層樓地板面積計算合計',
      '免計容積項目確認（停車、機房等）',
      '各類容積獎勵種類與個別上限',
      '容積獎勵加總不超過法定上限',
      '容積移轉計算方式確認',
    ],
    keyPoints: [
      '容積率 = 各層樓地板面積總和 ÷ 基地面積 × 100%',
      '免計容積項目包括機械停車、緊急發電機室等',
      '各類獎勵容積合計不得超過法定容積 30%（一般情形）',
      '危老、都更等另有特別規定',
    ],
    commonErrors: [
      '免計容積超出規定上限仍全額計算',
      '多種獎勵加總未設上限管控',
      '容積移轉受體基地容積計算錯誤',
      '樓地板面積含應扣除部分未扣除',
    ],
    legalBasis: ['都市計畫法第 32 條', '建築技術規則', '臺中市各種容積獎勵辦法'],
    keywords: ['容積率', '容積獎勵', '免計容積', '容積移轉', '樓地板面積'],
  },
  {
    id: 'c04', no: 4, title: '樓梯', desc: '淨寬、踢面踏板尺寸、平台、扶手',
    checkItems: [
      '樓梯淨寬度符合用途規定',
      '梯級高度（踢面）≤ 18 cm',
      '踏面寬度（踏板）≥ 26 cm',
      '每 16 個梯級以下設置休息平台',
      '休息平台深度 ≥ 樓梯淨寬',
      '扶手設置高度 75–85 cm',
      '樓梯淨高 ≥ 190 cm',
    ],
    keyPoints: [
      '集合住宅公共樓梯淨寬 ≥ 120 cm',
      '辦公或商業公共樓梯依用途另有規定',
      '15 個梯級以內不超過 16 級需設平台',
      '扶手兩側均需設置（超過特定寬度）',
    ],
    commonErrors: [
      '休息平台深度不足樓梯淨寬',
      '樓梯淨高不足 190 cm（尤其轉角梯下方）',
      '梯級高度超限 18 cm',
      '扶手高度不足或僅單側設置',
    ],
    legalBasis: ['建築技術規則建築設計施工編第 33 條', '建築設計施工編第 34–35 條'],
    keywords: ['樓梯', '梯級', '踏板', '踢面', '扶手', '平台', '淨寬'],
  },
  {
    id: 'c05', no: 5, title: '安全梯', desc: '設置義務、特別安全梯、排煙、防火門',
    checkItems: [
      '安全梯設置義務確認（5 層以上）',
      '特別安全梯適用條件（11 層以上）',
      '安全梯淨寬 ≥ 120 cm',
      '排煙設備設置確認',
      '防火門設置（1 小時防火時效）',
      '防火門開啟方向朝逃生方向',
      '安全梯內不得設置可燃物',
    ],
    keyPoints: [
      '5 層以上建築物需設安全梯',
      '11 層以上或高度 36 m 以上需設特別安全梯',
      '特別安全梯需設前室或附室',
      '安全梯為防火區劃之一部分，需嚴格管制',
    ],
    commonErrors: [
      '安全梯寬度不足 120 cm',
      '防火門開啟方向錯誤（應朝逃生方向開啟）',
      '排煙窗面積或位置不符規定',
      '前室面積不足或前室開窗不符',
    ],
    legalBasis: ['建築技術規則建築設計施工編第 95–97 條', '建築設計施工編第 90–93 條'],
    keywords: ['安全梯', '特別安全梯', '排煙', '防火門', '逃生', '前室'],
  },
  {
    id: 'c06', no: 6, title: '昇降機', desc: '設置義務、尺寸、無障礙、緊急昇降機',
    checkItems: [
      '昇降機設置義務確認（6 層以上）',
      '機廂淨尺寸（寬×深×高）',
      '無障礙昇降機規格 ≥ 140×135 cm',
      '緊急昇降機適用條件（15 層或 50 m 以上）',
      '機道防火構造確認',
      '廳門防火等級確認',
      '機房或免機房設備配置',
    ],
    keyPoints: [
      '6 層以上建築物需設昇降機',
      '15 層以上或 50 m 以上需設緊急昇降機',
      '無障礙昇降機機廂深度 ≥ 135 cm、寬度 ≥ 140 cm',
      '緊急昇降機需直達地面層',
    ],
    commonErrors: [
      '無障礙昇降機深度不足 135 cm',
      '緊急昇降機設置樓層判斷錯誤',
      '機廳門防火等級不符（需 B 類防火門）',
      '昇降機數量不足（未依樓地板面積計算）',
    ],
    legalBasis: ['建築技術規則建築設計施工編第 55–57 條', '建築設計施工編第 167 條（無障礙）'],
    keywords: ['昇降機', '電梯', '緊急昇降機', '無障礙電梯', '機廂', '機道'],
  },
  {
    id: 'c07', no: 7, title: '停車空間', desc: '位數計算、車位尺寸、車道、無障礙停車',
    checkItems: [
      '停車位數量依用途及樓地板面積計算',
      '標準停車位尺寸 ≥ 2.5 m × 6 m',
      '車道淨寬確認（單向 ≥ 350 cm）',
      '車道坡度 ≤ 1/6',
      '無障礙停車格 ≥ 3.5 m × 6 m',
      '機械停車設備規格確認',
      '自行車停車空間設置',
    ],
    keyPoints: [
      '停車位依用途別、樓地板面積比例計算',
      '標準車位 2.5 m × 6 m，機械停車另有規定',
      '車道坡度 ≤ 1/6（約 16.7%）',
      '5 個停車位以上需設無障礙停車格',
    ],
    commonErrors: [
      '停車位數量計算基準（每幾平方公尺一位）用錯版本',
      '無障礙停車格尺寸 3.5 m × 6 m 未符合',
      '車道轉彎內徑半徑不足',
      '坡道坡度超限 1/6',
    ],
    legalBasis: ['建築技術規則建築設計施工編第 59 條', '臺中市停車空間設置管理辦法'],
    keywords: ['停車', '停車位', '車道', '無障礙停車', '機械停車', '坡道'],
  },
  {
    id: 'c08', no: 8, title: '防火區劃', desc: '面積上限、防火牆構造、貫穿孔、豎穿部位',
    checkItems: [
      '防火區劃最大面積確認（1,500 ㎡ 以下）',
      '防火牆構造等級確認',
      '防火門規格確認（防火時效）',
      '電氣及管線貫穿孔防火填塞',
      '豎穿部位（電梯、管道間）防護方式',
      '高層建築物各層防火區劃',
      '不同用途防火分區隔離',
    ],
    keyPoints: [
      '防火區劃每層面積不超過 1,500 ㎡',
      '高層建築物每層均需獨立防火區劃',
      '防火牆需為一小時以上防火時效構造',
      '管線穿越防火牆需用防火填塞材料',
    ],
    commonErrors: [
      '防火區劃面積超出 1,500 ㎡ 上限',
      '防火門防火時效等級不符要求',
      '電氣管線穿越防火牆未填塞',
      '豎穿部位（管道間）未設防火閘門',
    ],
    legalBasis: ['建築技術規則建築設計施工編第 79 條', '建築設計施工編第 85–88 條'],
    keywords: ['防火區劃', '防火牆', '防火門', '貫穿孔', '管道間', '豎穿'],
  },
  {
    id: 'c09', no: 9, title: '無障礙', desc: '通路、坡道、廁所、昇降機、標誌',
    checkItems: [
      '無障礙通路連續性（室外至目的地）',
      '無障礙通路淨寬 ≥ 90 cm',
      '坡道坡度 ≤ 1/12（特殊 ≤ 1/8）',
      '無障礙停車格 3.5 m × 6 m',
      '無障礙廁所面積及規格',
      '無障礙昇降機規格確認',
      '扶手高度及材質',
      '引導標誌及點字設施',
    ],
    keyPoints: [
      '無障礙通路淨寬 ≥ 90 cm',
      '坡道坡度 ≤ 1/12，坡道長度超過 6 m 需設平台',
      '無障礙廁所面積 ≥ 4.9 ㎡',
      '公共建築物需設無障礙設施',
    ],
    commonErrors: [
      '坡道坡度超過 1/12',
      '通路有高差未設坡道（門檻）',
      '無障礙廁所出入口淨寬不足 80 cm',
      '扶手高度不符（需 75–85 cm）',
    ],
    legalBasis: ['建築技術規則建築設計施工編第 167–173 條', '臺中市建築物無障礙相關審查作業參考手冊'],
    keywords: ['無障礙', '坡道', '通路', '無障礙廁所', '輪椅', '扶手', '點字'],
  },
  {
    id: 'c10', no: 10, title: '採光通風', desc: '居室採光 1/8、通風 1/20、遮蔽計算',
    checkItems: [
      '居室採光開口面積 ≥ 樓地板面積 1/8',
      '居室通風開口面積 ≥ 樓地板面積 1/20',
      '採光計算扣除遮蔽面積',
      '天井或採光井採光計算',
      '通風開口位置及可開啟確認',
      '地下層或特殊空間採光補充措施',
    ],
    keyPoints: [
      '居室採光面積 ≥ 該居室樓地板面積 1/8',
      '通風開口 ≥ 樓地板面積 1/20，且需可開啟',
      '採光面積需扣除屋簷、陽台等遮蔽物影響',
      '人工採光或機械通風可作為補充',
    ],
    commonErrors: [
      '採光計算未扣除雨遮或陽台板遮蔽',
      '陽台空間計為居室採光（需穿透）',
      '通風開口為固定玻璃窗（不可開啟）',
      '天井尺寸不足導致採光比不符',
    ],
    legalBasis: ['建築技術規則建築設計施工編第 40–43 條'],
    keywords: ['採光', '通風', '居室', '採光開口', '遮蔽', '天井'],
  },
  {
    id: 'c11', no: 11, title: '高度比', desc: '前後側院高度比、道路斜線、鄰地退縮',
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
      '台中市依各都市計畫區規定，部分地區另有特殊規定',
    ],
    commonErrors: [
      '高度比計算基準點取錯（應從地面層計算）',
      '複合使用分區不同方位分別計算遺漏',
      '鄰接公共設施用地加算遺漏，浪費可建高度',
      '退縮後可用高度計算方式錯誤',
    ],
    legalBasis: ['建築技術規則建築設計施工編第 9 條', '臺中市都市計畫使用分區管制要點'],
    keywords: ['高度比', '道路斜線', '前院', '側院', '後院', '退縮', '建築高度'],
  },
  {
    id: 'c12', no: 12, title: '北向日照', desc: '集合住宅日照需求、冬至計算、遮蔽距離',
    checkItems: [
      '北向日照適用範圍確認（集合住宅）',
      '基地朝向與真北方向確認',
      '冬至日照時數計算基準',
      '相鄰建築遮蔽距離計算',
      '各戶至少一間居室符合日照',
      '平台或中庭遮蔽影響評估',
    ],
    keyPoints: [
      '集合住宅各戶至少一間居室需符合日照規定',
      '計算以冬至日（12/22）有效日照為基準',
      '日照計算須考慮周邊建築物遮蔽',
      '台中市依不同都市計畫區有不同規定',
    ],
    commonErrors: [
      '誤判北向方位（應為真北而非磁北）',
      '日照計算程式版本或參數設定錯誤',
      '相鄰遮蔽建築高度或距離計算基準混淆',
      '平台或設備層遮蔽效果未納入計算',
    ],
    legalBasis: ['建築技術規則建築設計施工編第 19 條之 1', '臺中市集合住宅日照相關規定'],
    keywords: ['日照', '北向', '冬至', '集合住宅', '遮蔽', '日照時數'],
  },
  {
    id: 'c13', no: 13, title: '都市設計審議', desc: '觸發條件、退縮、立面、景觀、透水',
    checkItems: [
      '都審觸發條件確認（面積、高度、特定分區）',
      '適用審議規範版本確認（最新版）',
      '各向退縮距離符合規範',
      '立面材質、色彩規定確認',
      '景觀綠化量體符合規定',
      '基地透水率達標',
      '量體配置及天際線檢討',
      '鄰棟距離及日照確認',
    ],
    keyPoints: [
      '台中市依各都市計畫區設有不同都市設計審議規範',
      '觸發條件依基地面積、建築高度或特定使用分區',
      '需提送都審圖說、說明書及相關計算書',
      '水湳智慧城區另有獨立審議規範',
    ],
    commonErrors: [
      '誤判不需都審（觸發條件複雜，容易遺漏）',
      '適用舊版審議規範（需確認最新版本）',
      '退縮尺寸不符最新版規範要求',
      '景觀綠化率計算面積基準錯誤',
    ],
    legalBasis: ['臺中市各都市計畫區都市設計審議規範', '臺中市水湳機場原址整體開發區都市設計審議規範'],
    keywords: ['都審', '都市設計', '審議', '退縮', '立面', '綠化', '透水', '量體'],
  },
  {
    id: 'c14', no: 14, title: '宜居建築', desc: '設施種類、容積獎勵 10%、回饋義務',
    checkItems: [
      '宜居建築適用範圍確認',
      '設施種類選擇（托嬰、長照、公益等）',
      '各設施面積及規格符合規定',
      '容積獎勵比例計算（上限 10%）',
      '多種設施合計不超過獎勵上限',
      '永久公益設施設置義務確認',
      '竣工後移交或管理義務',
    ],
    keyPoints: [
      '依臺中市鼓勵宜居建築設施設置及回饋辦法',
      '設施種類包括托嬰中心、老人日照、社區菜園等',
      '容積獎勵上限為法定容積 10%',
      '需作為永久公益設施，不得轉售變更',
    ],
    commonErrors: [
      '設施面積未達規定最小值',
      '多種設施獎勵加總超出 10% 上限',
      '永久公益設施設置在地下層（部分設施不允許）',
      '設施規格不符（如托嬰中心面積不足）',
    ],
    legalBasis: ['臺中市鼓勵宜居建築設施設置及回饋辦法'],
    keywords: ['宜居', '宜居建築', '托嬰', '長照', '容積獎勵', '公益設施', '回饋'],
  },
  {
    id: 'c15', no: 15, title: '危老重建', desc: '資格確認、同意書、容積獎勵、時程',
    checkItems: [
      '危老條件確認（屋齡 ≥ 30 年或結構耐震不足）',
      '取得全體土地及建物所有人同意書（100%）',
      '重建計畫申請文件準備',
      '容積獎勵計算（基本 + 時程 + 設計獎勵）',
      '時程獎勵年限確認（從申請日起算）',
      '稅務減免申請（地價稅、房屋稅）',
      '完工時程規劃（4 年內完工）',
    ],
    keyPoints: [
      '屋齡達 30 年或結構耐震評估不足可申請',
      '需取得 100% 所有權人同意（或依程序處理）',
      '容積獎勵分基本獎勵（10%）、時程獎勵（最高 10%）及設計獎勵',
      '時程獎勵年限依申請年度遞減',
    ],
    commonErrors: [
      '同意比例未達 100% 即提送申請',
      '時程獎勵年限計算錯誤（從申請核准日起算）',
      '危老條件鑑定報告格式或機構不符規定',
      '容積獎勵加總計算錯誤，超出法定上限',
    ],
    legalBasis: ['都市危險及老舊建築物加速重建條例', '加速都市危險及老舊建築物重建（行政院推動平台）'],
    keywords: ['危老', '危老重建', '重建', '容積獎勵', '時程獎勵', '同意書', '屋齡'],
  },
]

// ─── 搜尋邏輯 ──────────────────────────────────────────────────────────────

function matchCard(card: H2Card, q: string): boolean {
  if (!q) return true
  const lower = q.toLowerCase()
  return (
    card.title.toLowerCase().includes(lower) ||
    card.desc.toLowerCase().includes(lower) ||
    card.keywords.some(k => k.includes(lower)) ||
    card.checkItems.some(i => i.includes(lower)) ||
    card.legalBasis.some(l => l.includes(lower))
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
      className={`bg-white rounded-2xl border transition-all duration-200 print-card
        ${isExpanded ? 'border-blue-200 shadow-md' : 'border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'}`}
    >
      {/* ── 卡片標題列 ────────────────────────────────── */}
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-center gap-3 group"
      >
        {/* 序號 */}
        <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
          {card.no}
        </span>

        {/* 標題 + 說明 */}
        <div className="flex-1 min-w-0">
          <div className="text-base font-bold text-gray-800 leading-tight">{card.title}</div>
          <div className="text-xs text-gray-400 mt-0.5">{card.desc}</div>
        </div>

        {/* 操作按鈕 */}
        <div className="flex items-center gap-1.5 shrink-0 print:hidden">
          {/* 收藏 */}
          <button
            onClick={e => { e.stopPropagation(); onBookmark() }}
            className={`p-1.5 rounded-lg transition-colors
              ${isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-gray-300 hover:text-amber-400 hover:bg-amber-50'}`}
            title={isBookmarked ? '取消收藏' : '加入收藏'}
          >
            <svg className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>

          {/* 展開/收合箭頭 */}
          <div className={`text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* ── 展開內容 ──────────────────────────────────── */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">

          {/* 檢討項目 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">📋 檢討項目</span>
            </div>
            <ul className="space-y-1.5">
              {card.checkItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <span className="mt-0.5 shrink-0 w-4 h-4 border-2 border-gray-300 rounded inline-block" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* 法規重點 */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="text-xs font-bold text-slate-600 mb-2">📌 法規重點</div>
            <ul className="space-y-1.5">
              {card.keyPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  {pt}
                </li>
              ))}
            </ul>
          </div>

          {/* 常見錯誤 */}
          <div className="bg-red-50 rounded-xl p-4">
            <div className="text-xs font-bold text-red-600 mb-2">⚠️ 常見錯誤</div>
            <ul className="space-y-1.5">
              {card.commonErrors.map((err, i) => (
                <li key={i} className="flex items-start gap-1.5 text-sm text-red-700 leading-relaxed">
                  <span className="shrink-0">❌</span>
                  {err}
                </li>
              ))}
            </ul>
          </div>

          {/* 法源依據 */}
          <div>
            <div className="text-xs font-bold text-gray-500 mb-2">📖 法源依據</div>
            <div className="flex flex-wrap gap-2">
              {card.legalBasis.map((law, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full border border-gray-200">
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

  const expandAll  = () => setExpanded(new Set(H2_CARDS.map(c => c.id)))
  const collapseAll = () => setExpanded(new Set())

  const handlePrint = () => {
    expandAll()
    setTimeout(() => window.print(), 200)
  }

  // 篩選
  const filtered = useMemo(() => {
    let list = H2_CARDS.filter(c => matchCard(c, query.trim()))
    if (showOnlyBookmarked) list = list.filter(c => bookmarks.has(c.id))
    return list
  }, [query, showOnlyBookmarked, bookmarks])

  const bookmarkCount = bookmarks.size

  return (
    <>
      {/* ── 列印用全域樣式 ───────────────────────────── */}
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
        <div className="print-area max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8 pb-24 md:pb-12">

          {/* ── 頁首 ───────────────────────────────────── */}
          <div className="mb-6">
            {/* 麵包屑 back */}
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
                  H2 階段常用法規自主檢核項目｜共 <span className="font-bold text-gray-700">{H2_CARDS.length}</span> 項主題
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
                <button
                  onClick={expandAll}
                  className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  全部展開
                </button>
                <button
                  onClick={collapseAll}
                  className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  全部收合
                </button>
              </div>
            </div>
          </div>

          {/* ── 搜尋 + 篩選列 ─────────────────────────── */}
          <div className="flex gap-2 mb-5 print:hidden">
            {/* 搜尋框 */}
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
                placeholder="搜尋主題，例如：樓梯、停車、無障礙、採光、日照、危老"
                className="w-full pl-10 pr-9 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
              {query && (
                <button onClick={() => setQuery('')}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* 收藏篩選按鈕 */}
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
              收藏 {bookmarkCount > 0 && <span className="ml-0.5">({bookmarkCount})</span>}
            </button>
          </div>

          {/* 搜尋結果提示 */}
          {(query || showOnlyBookmarked) && (
            <div className="text-xs text-gray-500 mb-3 print:hidden">
              {filtered.length > 0
                ? <>顯示 <span className="font-bold text-gray-700">{filtered.length}</span> 項{query ? `符合「${query}」的` : ''}主題</>
                : <span className="text-red-500">找不到符合的主題</span>
              }
            </div>
          )}

          {/* ── 卡片列表 ───────────────────────────────── */}
          <div className="space-y-3">
            {filtered.map(card => (
              <H2CardItem
                key={card.id}
                card={card}
                isExpanded={expanded.has(card.id)}
                isBookmarked={bookmarks.has(card.id)}
                onToggle={() => toggleExpand(card.id)}
                onBookmark={() => toggleBookmark(card.id)}
              />
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

          {/* ── 頁尾提醒 ───────────────────────────────── */}
          <div className="mt-10 flex items-start gap-2.5 p-4 bg-blue-50 border border-blue-100 rounded-xl print:hidden">
            <svg className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-blue-700 leading-relaxed">
              本表為 H2 階段常用法規自主檢討參考，法規數值以主管機關最新公告版本為準。正式申請前請與主辦建築師及送照人員確認。
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
