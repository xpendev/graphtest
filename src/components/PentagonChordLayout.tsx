import { AgCharts } from 'ag-charts-react'
import { useMemo } from 'react'
import { buildChordOptions } from '../chart/chartOptions'
import {
  flowData,
  flowDataB,
  flowDataC,
  flowDataD,
  flowDataE,
} from '../data/enterpriseChartData'

const CHART_SIZE = 170
const RADIUS_RATIO = 0.38

const pentagonCharts = [
  { title: 'Chord A（EC）', data: flowData },
  { title: 'Chord B（物流）', data: flowDataB },
  { title: 'Chord C（営業）', data: flowDataC },
  { title: 'Chord D（開発）', data: flowDataD },
  { title: 'Chord E（CS）', data: flowDataE },
] as const

/** 正五角形の頂点（上から時計回り）。単位はコンテナに対する割合 0–100 */
function pentagonCenters(): { x: number; y: number }[] {
  return Array.from({ length: 5 }, (_, i) => {
    const angleDeg = -90 + i * 72
    const angleRad = (angleDeg * Math.PI) / 180
    return {
      x: 50 + RADIUS_RATIO * 100 * Math.cos(angleRad),
      y: 50 + RADIUS_RATIO * 100 * Math.sin(angleRad),
    }
  })
}

export function PentagonChordLayout() {
  const centers = useMemo(() => pentagonCenters(), [])

  const optionsList = useMemo(
    () =>
      pentagonCharts.map(({ title, data }) =>
        buildChordOptions(title, [...data]),
      ),
    [],
  )

  // 各 Chord から他のすべてへ直線（完全グラフ、重複なし）
  const lines: { from: { x: number; y: number }; to: { x: number; y: number }; key: string }[] =
    []
  for (let i = 0; i < centers.length; i++) {
    for (let j = i + 1; j < centers.length; j++) {
      lines.push({
        from: centers[i],
        to: centers[j],
        key: `${i}-${j}`,
      })
    }
  }

  return (
    <div className="chart-pentagon">
      <svg
        className="chart-pentagon-lines"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {lines.map(({ from, to, key }) => (
          <line
            key={key}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="#64748b"
            strokeWidth={0.4}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {optionsList.map((opts, index) => {
        const { x, y } = centers[index]
        return (
          <div
            key={pentagonCharts[index].title}
            className="chart-pentagon-item"
            style={{
              width: CHART_SIZE,
              height: CHART_SIZE,
              left: `calc(${x}% - ${CHART_SIZE / 2}px)`,
              top: `calc(${y}% - ${CHART_SIZE / 2}px)`,
            }}
          >
            <AgCharts
              options={opts}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        )
      })}
    </div>
  )
}
