import type { AgChartInstance } from 'ag-charts-community'
import { AgCharts } from 'ag-charts-react'
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'
import {
  buildChordOptions,
  buildChartOptions,
  type SingleChartTypeId,
} from '../chart/chartOptions'
import type { ChartTypeId } from '../chart/chartTypes'
import {
  flowData,
  flowDataB,
  flowDataC,
} from '../data/enterpriseChartData'
import { sampleData } from '../data/sampleData'
import {
  copyAgChartToClipboard,
  copyElementGraphicsToClipboard,
  copyPngAndTextToClipboard,
  dataUrlToBlob,
  downloadAgChartAsPng,
  downloadElementGraphicsAsPng,
  renderElementGraphicsToPngBlob,
} from '../utils/copyChartImage'
import { PentagonChordLayout } from './PentagonChordLayout'

type ProductChartProps = {
  chartType: ChartTypeId
}

export type ProductChartHandle = {
  copyToClipboard: () => Promise<void>
  copyPngToClipboard: () => Promise<void>
  copyPngAndText: () => Promise<void>
  downloadCurrentChart: () => Promise<void>
}

const multiChordCharts = [
  { title: 'Chord A（EC）', data: flowData },
  { title: 'Chord B（物流）', data: flowDataB },
  { title: 'Chord C（営業）', data: flowDataC },
] as const

const compositeChartTypes = new Set<ChartTypeId>([
  'multi-chord',
  'pentagon-chord',
])

export const ProductChart = forwardRef<ProductChartHandle, ProductChartProps>(
  function ProductChart({ chartType }, ref) {
    const chartRef = useRef<AgChartInstance>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const options = useMemo(() => {
      if (chartType === 'multi-chord' || chartType === 'pentagon-chord') {
        return null
      }
      return buildChartOptions(chartType as SingleChartTypeId, sampleData)
    }, [chartType])

    const multiOptions = useMemo(
      () =>
        multiChordCharts.map(({ title, data }) =>
          buildChordOptions(title, [...data]),
        ),
      [],
    )

    useImperativeHandle(
      ref,
      () => ({
        async copyToClipboard() {
          if (compositeChartTypes.has(chartType)) {
            if (!containerRef.current) {
              throw new Error('コピー対象のグラフが見つかりません。')
            }
            await copyElementGraphicsToClipboard(containerRef.current)
            return
          }

          if (!chartRef.current) {
            throw new Error('コピー対象のグラフが見つかりません。')
          }

          await copyAgChartToClipboard(chartRef.current)
        },
        async copyPngToClipboard() {
          if (compositeChartTypes.has(chartType)) {
            if (!containerRef.current) {
              throw new Error('コピー対象のグラフが見つかりません。')
            }
            await copyElementGraphicsToClipboard(containerRef.current)
            return
          }

          if (!chartRef.current) {
            throw new Error('コピー対象のグラフが見つかりません。')
          }

          await copyAgChartToClipboard(chartRef.current)
        },
        async copyPngAndText() {
          const INFO_TEXT =
            'AG Grid / AG Charts Enterprise — 製品売上データ グラフ出力'

          let blob: Blob
          if (compositeChartTypes.has(chartType)) {
            if (!containerRef.current) {
              throw new Error('コピー対象のグラフが見つかりません。')
            }
            blob = await renderElementGraphicsToPngBlob(containerRef.current)
          } else {
            if (!chartRef.current) {
              throw new Error('コピー対象のグラフが見つかりません。')
            }
            const dataUrl = await chartRef.current.getImageDataURL({
              fileFormat: 'image/png',
            })
            blob = await dataUrlToBlob(dataUrl)
          }

          await copyPngAndTextToClipboard(blob, INFO_TEXT)
        },
        async downloadCurrentChart() {
          if (compositeChartTypes.has(chartType)) {
            if (!containerRef.current) {
              throw new Error('ダウンロード対象のグラフが見つかりません。')
            }
            await downloadElementGraphicsAsPng(containerRef.current, chartType)
            return
          }

          if (!chartRef.current) {
            throw new Error('ダウンロード対象のグラフが見つかりません。')
          }

          await downloadAgChartAsPng(chartRef.current, chartType)
        },
      }),
      [chartType],
    )

    if (chartType === 'pentagon-chord') {
      return (
        <div ref={containerRef} className="product-chart-root">
          <PentagonChordLayout />
        </div>
      )
    }

    if (chartType === 'multi-chord') {
      return (
        <div ref={containerRef} className="product-chart-root chart-multi">
          {multiOptions.map((opts, index) => (
            <div
              key={multiChordCharts[index].title}
              className="chart-multi-item"
            >
              <AgCharts
                options={opts}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          ))}
        </div>
      )
    }

    if (!options) return null

    return (
      <div ref={containerRef} className="product-chart-root">
        <AgCharts
          ref={chartRef}
          options={options}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    )
  },
)
