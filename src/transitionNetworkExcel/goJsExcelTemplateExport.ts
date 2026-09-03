import {
  buildGoJsExcelTables,
  type GoJsExcelExportInput,
} from './goJsExcelData'
import { fillXlsmTemplate } from './patchXlsmTemplate'

const TEMPLATE_URL = '/api/excel/network-macro.xlsm'

/** ブラウザで Blob をファイル保存する */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * テンプレート .xlsm の数表だけ埋めてダウンロードする。
 * vbaProject.bin（マクロ）は変更しない。
 */
export async function exportGoJsNetworkExcelFromTemplate(
  input: GoJsExcelExportInput,
): Promise<void> {
  const templateResponse = await fetch(TEMPLATE_URL)
  if (!templateResponse.ok) {
    throw new Error(
      `Excel テンプレートの取得に失敗しました（HTTP ${templateResponse.status}）。`,
    )
  }
  const xlsmBuffer = await fillXlsmTemplate(
    await templateResponse.arrayBuffer(),
    buildGoJsExcelTables(input),
  )

  downloadBlob(
    new Blob([xlsmBuffer], {
      type: 'application/vnd.ms-excel.sheet.macroEnabled.12',
    }),
    `transition-network-gojs-${Date.now()}.xlsm`,
  )
}
