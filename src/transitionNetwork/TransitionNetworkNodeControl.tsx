import { NODE_COUNT_MAX, NODE_COUNT_MIN } from '../data/transitionNetworkData'

type TransitionNetworkNodeControlProps = {
  nodeCount: number
  onChange: (value: number) => void
}

export function TransitionNetworkNodeControl({
  nodeCount,
  onChange,
}: TransitionNetworkNodeControlProps) {
  return (
    <div className="tn-bottom-control">
      <label className="tn-bottom-control-label" htmlFor="tn-node-count">
        ノード数: {nodeCount}
      </label>
      <input
        id="tn-node-count"
        className="tn-slider tn-slider-bottom"
        type="range"
        min={NODE_COUNT_MIN}
        max={NODE_COUNT_MAX}
        step={1}
        value={nodeCount}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}
