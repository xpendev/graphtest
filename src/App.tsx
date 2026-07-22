import { AgGridReact } from 'ag-grid-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CHART_TYPES, type ChartTypeId } from './chart/chartTypes'
import { columnDefs } from './columns'
import {
  ProductChart,
  type ProductChartHandle,
} from './components/ProductChart'
import { sampleData } from './data/sampleData'
import './App.css'

function App() {
  const [chartType, setChartType] = useState<ChartTypeId>('bar')
  const [chartMessage, setChartMessage] = useState<string | null>(null)
  const [isCopying, setIsCopying] = useState(false)
  const [isCopyingPng, setIsCopyingPng] = useState(false)
  const [isCopyingPngText, setIsCopyingPngText] = useState(false)
  const [isExportingExcel, setIsExportingExcel] = useState(false)
  const chartRef = useRef<ProductChartHandle>(null)

  const isErrorMessage = (message: string) =>
    message.includes('失敗') ||
    message.includes('対応') ||
    message.includes('見つかりません')

  return (
    <main className="app">
      <div className="app-nav">
        <Link className="app-nav-link" to="/transition-network">
          遷移ネットワーク検証ページへ
        </Link>
      </div>
      <h1>製品一覧</h1>
      <p className="subtitle">
        AG Grid Enterprise — 3列 × 10行（固定データ）／トライアルライセンス
      </p>
      <div className="grid-wrap">
        <AgGridReact rowData={sampleData} columnDefs={columnDefs} />
      </div>

      <h2 className="chart-heading">グラフ表示</h2>
      <p className="subtitle">
        AG Charts Enterprise — Community + Enterprise 全 {CHART_TYPES.length}{' '}
        種類を切替
      </p>
      <div className="chart-toolbar">
        <label className="chart-type-label" htmlFor="chart-type-select">
          グラフ種類
          <select
            id="chart-type-select"
            className="chart-type-select"
            value={chartType}
            onChange={(e) => setChartType(e.target.value as ChartTypeId)}
            aria-label="グラフ種類"
          >
            {CHART_TYPES.map(({ id, label }) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div className="chart-action-buttons">
          <button
            type="button"
            className="chart-copy-btn"
            disabled={isCopying}
            title="選択中グラフをPNGでダウンロード"
            onClick={async () => {
              setIsCopying(true)
              setChartMessage(null)
              try {
                await chartRef.current?.downloadCurrentChart()
                setChartMessage(
                  '選択中グラフのPNGをダウンロードしました。',
                )
              } catch (error) {
                setChartMessage(
                  error instanceof Error
                    ? error.message
                    : 'グラフのダウンロードに失敗しました。',
                )
              } finally {
                setIsCopying(false)
              }
            }}
          >
            {isCopying ? 'ダウンロード中…' : 'グラフをダウンロード'}
          </button>
          <button
            type="button"
            className="chart-copy-btn"
            disabled={isCopyingPng}
            title="選択中グラフをPNGとしてクリップボードにコピー"
            onClick={async () => {
              setIsCopyingPng(true)
              setChartMessage(null)
              try {
                await chartRef.current?.copyPngToClipboard()
                setChartMessage('PNGをコピーしました。Ctrl+V で貼り付けできます。')
              } catch (error) {
                setChartMessage(
                  error instanceof Error
                    ? error.message
                    : 'PNGコピーに失敗しました。',
                )
              } finally {
                setIsCopyingPng(false)
              }
            }}
          >
            {isCopyingPng ? 'PNGコピー中…' : 'PNGをコピー'}
          </button>
          <button
            type="button"
            className="chart-copy-btn"
            disabled={isCopyingPngText}
            title="選択中グラフのPNG＋テキスト情報をクリップボードにコピー"
            onClick={async () => {
              setIsCopyingPngText(true)
              setChartMessage(null)
              try {
                await chartRef.current?.copyPngAndText()
                setChartMessage(
                  'PNG＋テキスト情報をコピーしました。Ctrl+V で貼り付けできます。',
                )
              } catch (error) {
                setChartMessage(
                  error instanceof Error
                    ? error.message
                    : 'PNG＋テキストコピーに失敗しました。',
                )
              } finally {
                setIsCopyingPngText(false)
              }
            }}
          >
            {isCopyingPngText ? 'コピー中…' : 'PNG＋テキストをコピー'}
          </button>
          <button
            type="button"
            className="chart-excel-btn"
            disabled={chartType !== 'bar' || isExportingExcel}
            title={
              chartType === 'bar'
                ? 'Excel の編集可能な棒グラフ付き xlsx をダウンロード'
                : '棒グラフ表示時のみ利用できます'
            }
            onClick={async () => {
              setIsExportingExcel(true)
              setChartMessage(null)
              try {
                const { downloadBarChartExcel } = await import(
                  './utils/exportBarChartExcel'
                )
                await downloadBarChartExcel(sampleData)
                setChartMessage(
                  'Excel ファイルをダウンロードしました。グラフは Excel 上で編集できます。',
                )
              } catch (error) {
                setChartMessage(
                  error instanceof Error
                    ? error.message
                    : 'Excel のダウンロードに失敗しました。',
                )
              } finally {
                setIsExportingExcel(false)
              }
            }}
          >
            {isExportingExcel ? '作成中…' : 'Excel ダウンロード'}
          </button>
        </div>
      </div>
      {chartMessage ? (
        <p
          className={
            isErrorMessage(chartMessage)
              ? 'chart-copy-message error'
              : 'chart-copy-message'
          }
          role="status"
        >
          {chartMessage}
        </p>
      ) : null}
      <div className="chart-wrap">
        <ProductChart ref={chartRef} chartType={chartType} />
      </div>
    </main>
  )
}

export default App
