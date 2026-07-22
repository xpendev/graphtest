import { EDGE_MIN_MAX } from './scratchLayout'

type ScratchEdgeControlProps = {
  edgeMinAbs: number
  onChange: (value: number) => void
}

export function ScratchEdgeControl({
  edgeMinAbs,
  onChange,
}: ScratchEdgeControlProps) {
  return (
    <aside className="tn-top-control" aria-label="表示制御">
      <div className="tn-top-control-source">
        [データソース] 消費者購買系: CIPS
      </div>
      <label className="tn-top-control-label" htmlFor="tn-edge-min">
        流入/流出線表示最小値(絶対値)
      </label>
      <div className="tn-top-control-value">
        {edgeMinAbs.toLocaleString('ja-JP')}
      </div>
      <input
        id="tn-edge-min"
        className="tn-slider"
        type="range"
        min={0}
        max={EDGE_MIN_MAX}
        step={1}
        value={edgeMinAbs}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </aside>
  )
}
