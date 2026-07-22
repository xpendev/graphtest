import type { AgChartOptions } from 'ag-charts-community'
import type { ProductRow } from '../data/sampleData'
import {
  boxPlotData,
  flowData,
  funnelData,
  heatmapData,
  hierarchyData,
  histogramData,
  ohlcData,
  polarData,
  rangeData,
  waterfallData,
  type FlowDatum,
} from '../data/enterpriseChartData'
import type { ChartTypeId } from './chartTypes'

export type SingleChartTypeId = Exclude<
  ChartTypeId,
  'multi-chord' | 'pentagon-chord'
>

export function buildChordOptions(
  title: string,
  data: FlowDatum[],
): AgChartOptions {
  return {
    title: { text: title },
    data,
    series: [
      {
        type: 'chord',
        fromKey: 'from',
        toKey: 'to',
        sizeKey: 'size',
      },
    ],
  }
}

export function buildChartOptions(
  type: SingleChartTypeId,
  data: ProductRow[],
): AgChartOptions {
  switch (type) {
    case 'bar':
      return {
        title: { text: '製品別 売上' },
        data,
        series: [{ type: 'bar', xKey: 'product', yKey: 'sales', yName: '売上' }],
      }
    case 'line':
      return {
        title: { text: '製品別 売上' },
        data,
        series: [{ type: 'line', xKey: 'product', yKey: 'sales', yName: '売上' }],
      }
    case 'area':
      return {
        title: { text: '製品別 売上' },
        data,
        series: [{ type: 'area', xKey: 'product', yKey: 'sales', yName: '売上' }],
      }
    case 'scatter':
      return {
        title: { text: '売上 × 在庫' },
        data,
        series: [
          {
            type: 'scatter',
            xKey: 'sales',
            yKey: 'stock',
            xName: '売上',
            yName: '在庫',
          },
        ],
      }
    case 'bubble':
      return {
        title: { text: '売上 × 在庫（サイズ＝売上）' },
        data,
        series: [
          {
            type: 'bubble',
            xKey: 'sales',
            yKey: 'stock',
            sizeKey: 'sales',
            xName: '売上',
            yName: '在庫',
            sizeName: '売上',
          },
        ],
      }
    case 'pie':
      return {
        title: { text: '売上構成' },
        data,
        series: [
          {
            type: 'pie',
            angleKey: 'sales',
            calloutLabelKey: 'product',
            legendItemKey: 'product',
          },
        ],
      }
    case 'donut':
      return {
        title: { text: '売上構成' },
        data,
        series: [
          {
            type: 'donut',
            angleKey: 'sales',
            calloutLabelKey: 'product',
            legendItemKey: 'product',
          },
        ],
      }
    case 'combination':
      return {
        title: { text: '売上（棒）と在庫（折れ線）' },
        data,
        series: [
          { type: 'bar', xKey: 'product', yKey: 'sales', yName: '売上' },
          { type: 'line', xKey: 'product', yKey: 'stock', yName: '在庫' },
        ],
      }
    case 'box-plot':
      return {
        title: { text: 'Box Plot' },
        data: boxPlotData,
        series: [
          {
            type: 'box-plot',
            xKey: 'category',
            minKey: 'min',
            q1Key: 'q1',
            medianKey: 'median',
            q3Key: 'q3',
            maxKey: 'max',
          },
        ],
      }
    case 'candlestick':
      return {
        title: { text: 'Candlestick' },
        data: ohlcData,
        series: [
          {
            type: 'candlestick',
            xKey: 'date',
            openKey: 'open',
            highKey: 'high',
            lowKey: 'low',
            closeKey: 'close',
          },
        ],
      }
    case 'ohlc':
      return {
        title: { text: 'OHLC' },
        data: ohlcData,
        series: [
          {
            type: 'ohlc',
            xKey: 'date',
            openKey: 'open',
            highKey: 'high',
            lowKey: 'low',
            closeKey: 'close',
          },
        ],
      }
    case 'heatmap':
      return {
        title: { text: 'Heatmap' },
        data: heatmapData,
        series: [
          {
            type: 'heatmap',
            xKey: 'x',
            yKey: 'y',
            colorKey: 'value',
            colorName: '値',
          },
        ],
      }
    case 'histogram':
      return {
        title: { text: 'Histogram' },
        data: histogramData,
        series: [{ type: 'histogram', xKey: 'value' }],
      }
    case 'nightingale':
      return {
        title: { text: 'Nightingale' },
        data: polarData,
        series: [
          {
            type: 'nightingale',
            angleKey: 'metric',
            radiusKey: 'score',
          },
        ],
      }
    case 'radar-line':
      return {
        title: { text: 'Radar Line' },
        data: polarData,
        series: [
          {
            type: 'radar-line',
            angleKey: 'metric',
            radiusKey: 'score',
          },
        ],
      }
    case 'radar-area':
      return {
        title: { text: 'Radar Area' },
        data: polarData,
        series: [
          {
            type: 'radar-area',
            angleKey: 'metric',
            radiusKey: 'score',
          },
        ],
      }
    case 'radial-column':
      return {
        title: { text: 'Radial Column' },
        data: polarData,
        series: [
          {
            type: 'radial-column',
            angleKey: 'metric',
            radiusKey: 'score',
          },
        ],
      }
    case 'radial-bar':
      return {
        title: { text: 'Radial Bar' },
        data: polarData,
        series: [
          {
            type: 'radial-bar',
            angleKey: 'metric',
            radiusKey: 'score',
          },
        ],
      }
    case 'range-bar':
      return {
        title: { text: 'Range Bar' },
        data: rangeData,
        series: [
          {
            type: 'range-bar',
            xKey: 'month',
            yLowKey: 'low',
            yHighKey: 'high',
          },
        ],
      }
    case 'range-area':
      return {
        title: { text: 'Range Area' },
        data: rangeData,
        series: [
          {
            type: 'range-area',
            xKey: 'month',
            yLowKey: 'low',
            yHighKey: 'high',
          },
        ],
      }
    case 'waterfall':
      return {
        title: { text: 'Waterfall' },
        data: waterfallData,
        series: [
          {
            type: 'waterfall',
            xKey: 'step',
            yKey: 'amount',
            totals: [{ totalType: 'total', index: 4, axisLabel: '期末' }],
          },
        ],
      }
    case 'sunburst':
      return {
        title: { text: 'Sunburst' },
        data: hierarchyData,
        series: [
          {
            type: 'sunburst',
            labelKey: 'name',
            sizeKey: 'size',
            childrenKey: 'children',
          },
        ],
      }
    case 'treemap':
      return {
        title: { text: 'Treemap' },
        data: hierarchyData,
        series: [
          {
            type: 'treemap',
            labelKey: 'name',
            sizeKey: 'size',
            childrenKey: 'children',
          },
        ],
      }
    case 'sankey':
      return {
        title: { text: 'Sankey' },
        data: flowData,
        series: [
          {
            type: 'sankey',
            fromKey: 'from',
            toKey: 'to',
            sizeKey: 'size',
          },
        ],
      }
    case 'chord':
      return buildChordOptions('Chord', flowData)
    case 'funnel':
      return {
        title: { text: 'Funnel' },
        data: funnelData,
        series: [
          {
            type: 'funnel',
            stageKey: 'stage',
            valueKey: 'value',
          },
        ],
      }
    case 'cone-funnel':
      return {
        title: { text: 'Cone Funnel' },
        data: funnelData,
        series: [
          {
            type: 'cone-funnel',
            stageKey: 'stage',
            valueKey: 'value',
          },
        ],
      }
    case 'pyramid':
      return {
        title: { text: 'Pyramid' },
        data: funnelData,
        series: [
          {
            type: 'pyramid',
            stageKey: 'stage',
            valueKey: 'value',
          },
        ],
      }
  }
}
