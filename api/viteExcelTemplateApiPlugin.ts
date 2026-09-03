import fs from 'node:fs'
import path from 'node:path'
import type { Connect, Plugin } from 'vite'

/**
 * Vite プラグイン: 開発/プレビューで Excel テンプレート .xlsm を配信する
 * GET /api/excel/network-macro.xlsm → api/excel/network-macro.xlsm
 */
export function excelTemplateApiPlugin(): Plugin {
  return {
    name: 'excel-template-api',
    configureServer(server) {
      server.middlewares.use(handler(server.config.root))
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler(server.config.root))
    },
  }
}

/** テンプレートファイルを返す HTTP ハンドラ */
function handler(rootDir: string): Connect.NextHandleFunction {
  return (req, res, next) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    if (url.pathname !== '/api/excel/network-macro.xlsm') {
      next()
      return
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.statusCode = 405
      res.end()
      return
    }

    const filePath = path.join(rootDir, 'api/excel/network-macro.xlsm')
    if (!fs.existsSync(filePath)) {
      res.statusCode = 404
      res.end()
      return
    }

    res.statusCode = 200
    res.setHeader(
      'Content-Type',
      'application/vnd.ms-excel.sheet.macroEnabled.12',
    )
    if (req.method === 'HEAD') {
      res.end()
      return
    }
    fs.createReadStream(filePath).pipe(res)
  }
}
