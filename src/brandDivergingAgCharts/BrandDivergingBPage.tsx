import { AgCharts } from 'ag-charts-react'
import type { AgChartInstance } from 'ag-charts-community'
import {
  type AgCartesianChartOptions,
  BarSeriesModule,
  CategoryAxisModule,
  CrossLinesModule,
  LegendModule,
  ModuleRegistry,
  NumberAxisModule,
} from 'ag-charts-enterprise'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchBrandDiverging,
  SIZE_DEFAULT,
  SIZE_MAX,
  SIZE_MIN,
  SUBJECT_DEFAULT,
  SUBJECT_OPTIONS,
  type BrandDivergingSample,
} from './brandDivergingData'

ModuleRegistry.registerModules([
  BarSeriesModule,
  CategoryAxisModule,
  NumberAxisModule,
  CrossLinesModule,
  LegendModule,
])

type ChartRow = {
  label: string
  net: number
  inflow: number
  outflow: number
}

/**
 * 純増減（流入−流出）を1本の発散棒で表示。
 * 正＝青（純流入）、負＝赤（純流出）。ホバーで流入／流出の内訳。
 */
function buildOptions(sample: BrandDivergingSample): AgCartesianChartOptions {
  const data: ChartRow[] = sample.rows.map((row) => ({
    label: row.label,
    net: row.inflow - row.outflow,
    inflow: row.inflow,
    outflow: row.outflow,
  }))

  const maxAbs = Math.max(1, ...data.map((row) => Math.abs(row.net)))
  const axisMax = Math.ceil(maxAbs / 10) * 10

  return {
    animation: { enabled: false },
    background: { fill: '#ffffff' },
    title: { text: sample.meta.title, fontSize: 18 },
    subtitle: {
      text: '純増減（流入−流出）　左: 純流出　／　右: 純流入',
      fontSize: 12,
    },
    legend: { enabled: false },
    data,
    series: [
      {
        type: 'bar',
        direction: 'horizontal',
        xKey: 'label',
        yKey: 'net',
        yName: '純増減',
        cornerRadius: 0,
        itemStyler: ({ datum }) => {
          const row = datum as ChartRow
          const positive = row.net >= 0
          return {
            fill: positive ? '#4a7db8' : '#c44b4b',
            stroke: positive ? '#2f547a' : '#8a2f2f',
            strokeWidth: 0.5,
          }
        },
        tooltip: {
          renderer: ({ datum }) => {
            const row = datum as ChartRow
            return {
              title: row.label,
              data: [
                { label: '流入', value: String(row.inflow) },
                { label: '流出', value: String(row.outflow) },
                { label: '純増減', value: String(row.net) },
              ],
            }
          },
        },
      },
    ],
    axes: {
      y: {
        type: 'category',
        position: 'left',
        paddingInner: 0.35,
        tick: { enabled: false },
        gridLine: { enabled: false },
        label: { fontSize: 11 },
      },
      x: {
        type: 'number',
        position: 'bottom',
        min: -axisMax,
        max: axisMax,
        nice: false,
        gridLine: { enabled: true },
        label: { fontSize: 10 },
        crossLines: [
          {
            type: 'line',
            value: 0,
            stroke: '#333333',
            strokeWidth: 1,
          },
        ],
      },
    },
  }
}

/**
 * 曼荼羅チャート代替: 流出入差ランキング（純増減＋ホバー内訳）。
 */
export function BrandDivergingBPage() {
  const chartRef = useRef<AgChartInstance<AgCartesianChartOptions> | null>(null)
  const [size, setSize] = useState(SIZE_DEFAULT)
  const [subject, setSubject] = useState(SUBJECT_DEFAULT)
  const [sample, setSample] = useState<BrandDivergingSample | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isCopying, setIsCopying] = useState(false)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setMessage(null)
    void fetchBrandDiverging(size, subject)
      .then((next) => {
        if (!cancelled) setSample(next)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setSample(null)
        setMessage(
          error instanceof Error ? error.message : 'データの取得に失敗しました。',
        )
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [size, subject])

  const options = useMemo(
    () => (sample ? buildOptions(sample) : null),
    [sample],
  )

  const downloadPng = () => {
    setIsDownloading(true)
    setMessage(null)
    try {
      const chart = chartRef.current
      if (!chart || !sample) throw new Error('グラフの準備ができていません。')
      chart.download({
        fileName: `brand-diverging-${sample.size}-${Date.now()}`,
      })
      setMessage('PNGをダウンロードしました。')
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'PNGダウンロードに失敗しました。',
      )
    } finally {
      setIsDownloading(false)
    }
  }

  const copyPng = async () => {
    setIsCopying(true)
    setMessage(null)
    try {
      const chart = chartRef.current
      if (!chart) throw new Error('グラフの準備ができていません。')
      if (!navigator.clipboard?.write) {
        throw new Error('このブラウザでは画像コピーに対応していません。')
      }
      const dataUrl = await chart.getImageDataURL()
      if (!dataUrl) throw new Error('画像の生成に失敗しました。')
      const blob = await (await fetch(dataUrl)).blob()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setMessage('PNGをコピーしました。')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'PNGコピーに失敗しました。')
    } finally {
      setIsCopying(false)
    }
  }

  return (
    <main className="tn-page">
      <header className="tn-page-header">
        <div>
          <p className="tn-page-eyebrow">曼荼羅チャート代替案</p>
          <h1 className="tn-page-title">流出入差ランキング</h1>
          <p className="tn-page-subtitle">
            純増減（流入−流出）＋ホバーで流入／流出内訳（AG Charts）
          </p>
        </div>
        <div className="tn-page-actions">
          <Link className="tn-page-link" to="/">
            トップ
          </Link>
          <Link className="tn-page-link" to="/transition-network/cytoscape">
            曼荼羅（Cytoscape）
          </Link>
          <button
            type="button"
            className="tn-page-btn"
            disabled={isCopying || !sample}
            onClick={() => {
              void copyPng()
            }}
          >
            {isCopying ? 'コピー中…' : 'PNGをコピー'}
          </button>
          <button
            type="button"
            className="tn-page-btn"
            disabled={isDownloading || !sample}
            onClick={downloadPng}
          >
            {isDownloading ? 'ダウンロード中…' : 'PNGをダウンロード'}
          </button>
        </div>
      </header>

      {message ? (
        <p
          className={
            message.includes('失敗') || message.includes('できていません')
              ? 'tn-page-message error'
              : 'tn-page-message'
          }
          role="status"
        >
          {message}
        </p>
      ) : null}

      <div className="ag-spike-controls" aria-label="表示制御">
        <label className="ag-spike-controls-label" htmlFor="bd-b-subject">
          主語ブランド
        </label>
        <select
          id="bd-b-subject"
          className="ag-spike-select"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          {(sample?.subjects ?? [...SUBJECT_OPTIONS]).map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
        <label className="ag-spike-controls-label" htmlFor="bd-b-size">
          相手ブランド数: {size} / {SIZE_MAX}
        </label>
        <input
          id="bd-b-size"
          className="tn-slider ag-spike-slider"
          type="range"
          min={SIZE_MIN}
          max={SIZE_MAX}
          step={1}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
        />
      </div>

      <div className="tn-page-stage tn-page-stage-fit ag-spike-stage">
        {options && sample ? (
          <div className="tn-chart-frame-800">
            <div className="ag-spike-chart-host">
              <AgCharts
                ref={chartRef}
                options={options}
                style={{ width: 800, height: 420 }}
              />
            </div>
          </div>
        ) : (
          <div className="tn-graph-placeholder" role="status">
            {isLoading ? 'データを読み込み中…' : '表示できるデータがありません。'}
          </div>
        )}
      </div>
    </main>
  )
}
