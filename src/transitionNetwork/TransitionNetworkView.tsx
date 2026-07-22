import { useMemo, useState } from 'react'
import { buildTransitionNetwork } from '../data/transitionNetworkData'
import { TransitionNetworkEdgeControl } from './TransitionNetworkEdgeControl'
import { TransitionNetworkGraph } from './TransitionNetworkGraph'
import { TransitionNetworkNodeControl } from './TransitionNetworkNodeControl'
import { TransitionNetworkSummary } from './TransitionNetworkSummary'
import {
  EDGE_MIN_DEFAULT,
  layoutEdges,
  layoutNodes,
  type TooltipState,
} from './layout'

export function TransitionNetworkView() {
  const [nodeCount, setNodeCount] = useState(6)
  const [edgeMinAbs, setEdgeMinAbs] = useState(EDGE_MIN_DEFAULT)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [hoverEdgeKey, setHoverEdgeKey] = useState<string | null>(null)
  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null)

  const network = useMemo(
    () => buildTransitionNetwork(nodeCount),
    [nodeCount],
  )
  const nodes = useMemo(() => layoutNodes(network.nodes), [network.nodes])
  const edges = useMemo(
    () => layoutEdges(network.edges, nodes),
    [network.edges, nodes],
  )
  const visibleEdges = useMemo(
    () => edges.filter(({ edge }) => Math.abs(edge.value) >= edgeMinAbs),
    [edges, edgeMinAbs],
  )

  return (
    <div className="transition-network">
      <div className="tn-chrome">
        <TransitionNetworkSummary />
        <TransitionNetworkEdgeControl
          edgeMinAbs={edgeMinAbs}
          onChange={(value) => {
            setTooltip(null)
            setHoverEdgeKey(null)
            setEdgeMinAbs(value)
          }}
        />
      </div>

      <TransitionNetworkGraph
        nodes={nodes}
        edges={visibleEdges}
        edgeMinAbs={edgeMinAbs}
        tooltip={tooltip}
        hoverEdgeKey={hoverEdgeKey}
        hoverNodeId={hoverNodeId}
        onHoverEdge={(key, nextTooltip) => {
          setHoverEdgeKey(key)
          setTooltip(nextTooltip)
        }}
        onHoverNode={(id, nextTooltip) => {
          setHoverNodeId(id)
          setTooltip(nextTooltip)
        }}
      />

      <TransitionNetworkNodeControl
        nodeCount={nodeCount}
        onChange={(value) => {
          setTooltip(null)
          setHoverEdgeKey(null)
          setHoverNodeId(null)
          setNodeCount(value)
        }}
      />
    </div>
  )
}
