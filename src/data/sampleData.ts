export type ProductRow = {
  product: string
  sales: number
  stock: number
}

export const sampleData: ProductRow[] = [
  { product: 'ノートPC', sales: 120, stock: 45 },
  { product: 'モニター', sales: 85, stock: 62 },
  { product: 'キーボード', sales: 200, stock: 150 },
  { product: 'マウス', sales: 175, stock: 210 },
  { product: 'ヘッドセット', sales: 95, stock: 38 },
  { product: 'Webカメラ', sales: 60, stock: 27 },
  { product: 'USBハブ', sales: 140, stock: 88 },
  { product: '外付けSSD', sales: 110, stock: 54 },
  { product: 'プリンター', sales: 40, stock: 15 },
  { product: 'タブレット', sales: 70, stock: 33 },
]
