import JSZip from 'jszip'
import type { GoJsExcelTables } from './goJsExcelData'

type CellValue = string | number

/** XML 特殊文字をエスケープする */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '&#10;')
}

/** 1始まり列番号を A, B, …, AA 形式にする */
function columnLetter(col: number): string {
  let n = col
  let letters = ''
  while (n > 0) {
    const rem = (n - 1) % 26
    letters = String.fromCharCode(65 + rem) + letters
    n = Math.floor((n - 1) / 26)
  }
  return letters
}

/** 行・列からセル参照（例: B3）を作る */
function cellRef(row: number, col: number): string {
  return `${columnLetter(col)}${row}`
}

/** 1セル分の sheet XML を作る */
function cellXml(row: number, col: number, value: CellValue): string {
  const ref = cellRef(row, col)
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `<c r="${ref}"><v>${value}</v></c>`
  }
  const text = String(value)
  const preserve = text.includes('\n') ? ' xml:space="preserve"' : ''
  return `<c r="${ref}" t="inlineStr"><is><t${preserve}>${escapeXml(text)}</t></is></c>`
}

/** 二次元配列から sheetData XML を組み立てる */
function buildSheetDataXml(rows: CellValue[][]): string {
  const rowXml = rows
    .map((row, rowIndex) => {
      const r = rowIndex + 1
      const cells = row
        .map((value, colIndex) => cellXml(r, colIndex + 1, value))
        .join('')
      const lastCol = Math.max(1, row.length)
      return `<row r="${r}" spans="1:${lastCol}">${cells}</row>`
    })
    .join('')
  return `<sheetData>${rowXml}</sheetData>`
}

/** ワークシート XML の sheetData（と dimension）だけ差し替える */
function patchWorksheetXml(originalXml: string, rows: CellValue[][]): string {
  const sheetData = buildSheetDataXml(rows)
  let next = originalXml.replace(/<sheetData[\s\S]*?<\/sheetData>/, sheetData)
  if (next === originalXml) {
    throw new Error('テンプレートの sheetData を更新できませんでした。')
  }

  const lastRow = rows.length
  const lastCol = rows.reduce((max, row) => Math.max(max, row.length), 1)
  const dimension = `A1:${cellRef(lastRow, lastCol)}`
  if (next.includes('<dimension ')) {
    next = next.replace(
      /<dimension ref="[^"]*"\/>/,
      `<dimension ref="${dimension}"/>`,
    )
  }
  return next
}

/** workbook 関係の Target を xl/ 配下パスにそろえる */
function resolveXlPath(target: string): string {
  const normalized = target.replace(/^\//, '')
  if (normalized.startsWith('xl/')) return normalized
  return `xl/${normalized}`
}

/** シート名 → ZIP 内パス（例: xl/worksheets/sheet1.xml）の対応表 */
function parseSheetPaths(workbookXml: string, relsXml: string): Map<string, string> {
  const relMap = new Map<string, string>()
  for (const match of relsXml.matchAll(/<Relationship\b[^>]*\/>/g)) {
    const tag = match[0]
    const id = tag.match(/\bId="([^"]+)"/)?.[1]
    const target = tag.match(/\bTarget="([^"]+)"/)?.[1]
    if (id && target) relMap.set(id, resolveXlPath(target))
  }

  const sheetMap = new Map<string, string>()
  for (const match of workbookXml.matchAll(/<sheet\b[^>]*\/>/g)) {
    const tag = match[0]
    const name = tag.match(/\bname="([^"]+)"/)?.[1]
    const relId = tag.match(/\br:id="([^"]+)"/)?.[1]
    if (!name || !relId) continue
    const target = relMap.get(relId)
    if (target) sheetMap.set(name, target)
  }
  return sheetMap
}

/**
 * テンプレート .xlsm（中身は ZIP）をメモリ上で開き、
 * Data / Node / Edge の sheet XML だけ差し替えて返す。
 * vbaProject.bin / Chart シートは触らない。
 */
export async function fillXlsmTemplate(
  templateBuffer: ArrayBuffer,
  tables: GoJsExcelTables,
): Promise<ArrayBuffer> {
  const zip = await JSZip.loadAsync(templateBuffer)
  if (!zip.file('xl/vbaProject.bin')) {
    throw new Error('テンプレートに vbaProject.bin がありません。')
  }
  const workbookXml = await zip.file('xl/workbook.xml')?.async('string')
  const relsXml = await zip.file('xl/_rels/workbook.xml.rels')?.async('string')
  if (!workbookXml || !relsXml) {
    throw new Error('テンプレートの workbook.xml が読み取れません。')
  }

  const sheetPaths = parseSheetPaths(workbookXml, relsXml)
  const payloads: Record<string, CellValue[][]> = {
    Data: tables.data,
    Node: tables.node,
    Edge: tables.edge,
  }

  for (const [sheetName, rows] of Object.entries(payloads)) {
    const path = sheetPaths.get(sheetName)
    if (!path) {
      throw new Error(`テンプレートにシート "${sheetName}" がありません。`)
    }
    const originalXml = await zip.file(path)?.async('string')
    if (!originalXml) {
      throw new Error(`テンプレートの ${path} が読み取れません。`)
    }
    zip.file(path, patchWorksheetXml(originalXml, rows))
  }

  zip.remove('xl/calcChain.xml')

  return zip.generateAsync({
    type: 'arraybuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })
}
