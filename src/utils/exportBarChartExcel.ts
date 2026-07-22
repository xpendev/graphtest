import { Workbook } from '@node-projects/excelforge'
import type { ProductRow } from '../data/sampleData'

const SHEET_NAME = '製品データ'
const CHART_TITLE = '製品別 売上'

export async function downloadBarChartExcel(
  data: ProductRow[],
  fileName = '製品別売上.xlsx',
): Promise<void> {
  if (data.length === 0) {
    throw new Error('エクスポートするデータがありません。')
  }

  const workbook = new Workbook()
  const sheet = workbook.addSheet(SHEET_NAME)

  sheet.writeRow(1, 1, ['製品名', '売上'])
  data.forEach((row, index) => {
    sheet.writeRow(index + 2, 1, [row.product, row.sales])
  })

  sheet.setColumnWidth(1, 16)
  sheet.setColumnWidth(2, 10)

  const lastRow = data.length + 1
  const sheetRef = `'${SHEET_NAME}'`

  sheet.addChart({
    type: 'column',
    title: CHART_TITLE,
    series: [
      {
        name: '売上',
        categories: `${sheetRef}!$A$2:$A$${lastRow}`,
        values: `${sheetRef}!$B$2:$B$${lastRow}`,
      },
    ],
    from: { col: 3, row: 0 },
    to: { col: 12, row: 18 },
    legend: 'bottom',
  })

  await workbook.download(fileName)
}
