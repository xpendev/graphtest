export const boxPlotData = [
  { category: 'A', min: 2, q1: 4, median: 6, q3: 8, max: 10 },
  { category: 'B', min: 1, q1: 3, median: 5, q3: 7, max: 12 },
  { category: 'C', min: 3, q1: 5, median: 7, q3: 9, max: 11 },
  { category: 'D', min: 0, q1: 2, median: 4, q3: 6, max: 9 },
]

export const ohlcData = [
  { date: 'Mon', open: 100, high: 115, low: 95, close: 110 },
  { date: 'Tue', open: 110, high: 120, low: 105, close: 108 },
  { date: 'Wed', open: 108, high: 112, low: 98, close: 100 },
  { date: 'Thu', open: 100, high: 130, low: 99, close: 125 },
  { date: 'Fri', open: 125, high: 128, low: 118, close: 122 },
]

export const heatmapData = [
  { x: '月', y: '午前', value: 12 },
  { x: '月', y: '午後', value: 18 },
  { x: '火', y: '午前', value: 9 },
  { x: '火', y: '午後', value: 22 },
  { x: '水', y: '午前', value: 15 },
  { x: '水', y: '午後', value: 20 },
  { x: '木', y: '午前', value: 11 },
  { x: '木', y: '午後', value: 17 },
  { x: '金', y: '午前', value: 14 },
  { x: '金', y: '午後', value: 25 },
]

export const histogramData = [
  { value: 12 },
  { value: 18 },
  { value: 22 },
  { value: 15 },
  { value: 30 },
  { value: 28 },
  { value: 19 },
  { value: 24 },
  { value: 33 },
  { value: 21 },
  { value: 17 },
  { value: 26 },
  { value: 14 },
  { value: 29 },
  { value: 31 },
]

export const polarData = [
  { metric: '速度', score: 80 },
  { metric: '品質', score: 90 },
  { metric: '価格', score: 70 },
  { metric: 'サポート', score: 85 },
  { metric: '機能', score: 75 },
]

export const rangeData = [
  { month: '1月', low: 10, high: 30 },
  { month: '2月', low: 12, high: 28 },
  { month: '3月', low: 15, high: 35 },
  { month: '4月', low: 18, high: 40 },
  { month: '5月', low: 20, high: 38 },
  { month: '6月', low: 22, high: 42 },
]

export const waterfallData = [
  { step: '期首', amount: 100 },
  { step: '売上', amount: 80 },
  { step: 'コスト', amount: -40 },
  { step: '販管費', amount: -20 },
  { step: 'その他', amount: 10 },
]

export const hierarchyData = [
  {
    name: '全体',
    children: [
      {
        name: 'ハードウェア',
        children: [
          { name: 'ノートPC', size: 120 },
          { name: 'モニター', size: 85 },
          { name: 'タブレット', size: 70 },
        ],
      },
      {
        name: '周辺機器',
        children: [
          { name: 'キーボード', size: 200 },
          { name: 'マウス', size: 175 },
          { name: 'ヘッドセット', size: 95 },
        ],
      },
      {
        name: 'その他',
        children: [
          { name: 'USBハブ', size: 140 },
          { name: '外付けSSD', size: 110 },
        ],
      },
    ],
  },
]

export type FlowDatum = {
  from: string
  to: string
  size: number
}

export const flowData: FlowDatum[] = [
  { from: '訪問', to: 'カート', size: 100 },
  { from: 'カート', to: '購入', size: 40 },
  { from: 'カート', to: '離脱', size: 60 },
  { from: '購入', to: 'リピート', size: 15 },
]

export const flowDataB: FlowDatum[] = [
  { from: '東日本', to: '倉庫A', size: 80 },
  { from: '西日本', to: '倉庫B', size: 70 },
  { from: '倉庫A', to: '店舗', size: 50 },
  { from: '倉庫B', to: '店舗', size: 45 },
  { from: '倉庫A', to: '返品', size: 10 },
]

export const flowDataC: FlowDatum[] = [
  { from: '営業', to: '見積', size: 90 },
  { from: '見積', to: '契約', size: 35 },
  { from: '見積', to: '失注', size: 55 },
  { from: '契約', to: '納品', size: 30 },
  { from: '納品', to: 'サポート', size: 20 },
]

export const flowDataD: FlowDatum[] = [
  { from: '設計', to: '開発', size: 70 },
  { from: '開発', to: 'テスト', size: 50 },
  { from: 'テスト', to: 'リリース', size: 35 },
  { from: '開発', to: '手戻り', size: 15 },
  { from: '手戻り', to: '設計', size: 10 },
]

export const flowDataE: FlowDatum[] = [
  { from: '問合せ', to: '受付', size: 100 },
  { from: '受付', to: '対応中', size: 75 },
  { from: '対応中', to: '完了', size: 55 },
  { from: '対応中', to: 'エスカレーション', size: 20 },
  { from: 'エスカレーション', to: '完了', size: 18 },
]

export const funnelData = [
  { stage: '認知', value: 1000 },
  { stage: '興味', value: 600 },
  { stage: '検討', value: 300 },
  { stage: '購入', value: 120 },
]
