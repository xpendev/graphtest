import type { ReactNode } from 'react'
import { EDGE_MIN_MAX, NODE_SLIDER } from './cytoscapeLayout'

type CytoscapeFrameProps = {
  edgeMinAbs: number
  nodeCount: number
  onEdgeMinChange: (value: number) => void
  onNodeCountChange: (value: number) => void
  children: ReactNode
}

/** サマリ＋スライダー枠（グラフ本体は children） */
export function CytoscapeFrame({
  edgeMinAbs,
  nodeCount,
  onEdgeMinChange,
  onNodeCountChange,
  children,
}: CytoscapeFrameProps) {
  return (
    <div className="transition-network">
      <div className="tn-top-row">
        <aside className="tn-summary" aria-label="サマリ">
          <div className="tn-summary-badge">
            <div className="tn-summary-badge-title">集計項目</div>
            <div className="tn-summary-badge-line">前期購入量 → 当期購入量</div>
            <div className="tn-summary-badge-line">購入量差, 購入量比</div>
          </div>
          <div className="tn-summary-base">
            <div className="tn-summary-base-title">ベース金額</div>
            <div className="tn-summary-base-line">前期 26/01-26/06</div>
            <div className="tn-summary-base-line">当期 26/01-26/03</div>
          </div>
        </aside>

        <aside className="tn-top-control" aria-label="表示制御">
          <div className="tn-top-control-source">
            [データソース] 消費者購買系: CIPS
          </div>
          <label className="tn-top-control-label" htmlFor="tn-cy-edge-min">
            流入/流出線表示最小値(絶対値)
          </label>
          <div className="tn-top-control-value">
            {edgeMinAbs.toLocaleString('ja-JP')}
          </div>
          <input
            id="tn-cy-edge-min"
            className="tn-slider"
            type="range"
            min={0}
            max={EDGE_MIN_MAX}
            step={1}
            value={edgeMinAbs}
            onChange={(e) => onEdgeMinChange(Number(e.target.value))}
          />
        </aside>
      </div>

      <div className="tn-graph-area tn-lib-graph-area">{children}</div>

      <div className="tn-bottom-control">
        <label className="tn-bottom-control-label" htmlFor="tn-cy-node-count">
          ノード数: {nodeCount}
        </label>
        <input
          id="tn-cy-node-count"
          className="tn-slider tn-slider-bottom"
          type="range"
          min={NODE_SLIDER.min}
          max={NODE_SLIDER.max}
          step={1}
          value={nodeCount}
          onChange={(e) => onNodeCountChange(Number(e.target.value))}
        />
      </div>
    </div>
  )
}
