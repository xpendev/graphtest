import {
  NODE_H,
  NODE_W,
  VIEW_H,
  VIEW_W,
  externalArrow,
  formatDelta,
  formatInt,
  type LaidOutEdge,
  type LaidOutNode,
  type TooltipState,
} from './scratchLayout'

type ScratchGraphProps = {
  nodes: LaidOutNode[]
  edges: LaidOutEdge[]
  edgeMinAbs: number
  tooltip: TooltipState | null
  hoverEdgeKey: string | null
  hoverNodeId: string | null
  onHoverEdge: (key: string | null, tooltip: TooltipState | null) => void
  onHoverNode: (id: string | null, tooltip: TooltipState | null) => void
}

export function ScratchGraph({
  nodes,
  edges,
  edgeMinAbs,
  tooltip,
  hoverEdgeKey,
  hoverNodeId,
  onHoverEdge,
  onHoverNode,
}: ScratchGraphProps) {
  return (
    <div className="tn-graph-area">
      <svg
        className="scratch-network-svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label="カテゴリ間遷移ネットワーク"
      >
        <defs>
          <marker
            id="tn-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 9 5 L 0 8.5 Z" fill="#5b9fd4" />
          </marker>
          <marker
            id="tn-arrow-ext"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 9 5 L 0 8.5 Z" fill="#7eb6de" />
          </marker>
          <linearGradient id="tn-node-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6eb0d8" />
            <stop offset="100%" stopColor="#3d7fa8" />
          </linearGradient>
          <linearGradient id="tn-node-fill-hover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8bc4e4" />
            <stop offset="100%" stopColor="#4f96bd" />
          </linearGradient>
        </defs>

        <rect width={VIEW_W} height={VIEW_H} fill="#1a1f24" rx="8" />

        {edges.map(({ edge, fromLabel, toLabel, geom }) => {
          const key = `${edge.from}-${edge.to}`
          const active = hoverEdgeKey === key
          const strokeColor = active ? '#9fd0ef' : '#5b9fd4'
          const strokeWidth = Math.min(4, 1.2 + Math.abs(edge.value) / 400)

          return (
            <g key={key}>
              <line
                x1={geom.start.x}
                y1={geom.start.y}
                x2={geom.end.x}
                y2={geom.end.y}
                stroke={strokeColor}
                strokeWidth={active ? strokeWidth + 1 : strokeWidth}
                markerEnd="url(#tn-arrow)"
                opacity={0.95}
                pointerEvents="none"
              />
              <line
                x1={geom.start.x}
                y1={geom.start.y}
                x2={geom.end.x}
                y2={geom.end.y}
                stroke="transparent"
                strokeWidth={14}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => {
                  onHoverEdge(key, {
                    x: geom.mid.x,
                    y: geom.mid.y,
                    title: '遷移',
                    lines: [
                      `${fromLabel} → ${toLabel}`,
                      `件数: ${formatInt(edge.value)}`,
                    ],
                  })
                }}
                onMouseLeave={() => onHoverEdge(null, null)}
              />
              <text
                x={geom.labelPos.x}
                y={geom.labelPos.y}
                fill="#e8eef3"
                fontSize={11}
                textAnchor="middle"
                dominantBaseline="middle"
                pointerEvents="none"
              >
                {formatInt(edge.value)}
              </text>
            </g>
          )
        })}

        {nodes.map((node) => {
          const showExternal = Math.abs(node.external) >= edgeMinAbs
          const ext = externalArrow(node.center, node.external)
          const { delta, pct } = formatDelta(node.before, node.after)
          const active = hoverNodeId === node.id
          const extLabel =
            node.external >= 0
              ? `圏外からの流入: ${formatInt(node.external)}`
              : `圏外への流出: ${formatInt(Math.abs(node.external))}`

          return (
            <g key={node.id}>
              {showExternal ? (
                <>
                  <line
                    x1={ext.lineStart.x}
                    y1={ext.lineStart.y}
                    x2={ext.lineEnd.x}
                    y2={ext.lineEnd.y}
                    stroke="#7eb6de"
                    strokeWidth={1.4}
                    markerEnd="url(#tn-arrow-ext)"
                    pointerEvents="none"
                  />
                  <text
                    x={ext.label.x}
                    y={ext.label.y}
                    fill="#d7e6f2"
                    fontSize={11}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    pointerEvents="none"
                  >
                    {formatInt(node.external)}
                  </text>
                </>
              ) : null}

              <ellipse
                cx={node.center.x}
                cy={node.center.y}
                rx={NODE_W / 2}
                ry={NODE_H / 2}
                fill={
                  active ? 'url(#tn-node-fill-hover)' : 'url(#tn-node-fill)'
                }
                stroke={active ? '#c5e6f8' : '#9fd0ef'}
                strokeWidth={active ? 2 : 1}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => {
                  onHoverNode(node.id, {
                    x: node.center.x,
                    y: node.center.y - NODE_H / 2 - 8,
                    title: node.label,
                    lines: [
                      `前期: ${formatInt(node.before)}`,
                      `今期: ${formatInt(node.after)}`,
                      `差分: ${delta}（${pct}）`,
                      extLabel,
                    ],
                  })
                }}
                onMouseLeave={() => onHoverNode(null, null)}
              />
              <text
                x={node.center.x}
                y={node.center.y - 16}
                fill="#fff"
                fontSize={12}
                fontWeight={600}
                textAnchor="middle"
                pointerEvents="none"
              >
                {node.label}
              </text>
              <text
                x={node.center.x}
                y={node.center.y + 2}
                fill="#f2f7fb"
                fontSize={11}
                textAnchor="middle"
                pointerEvents="none"
              >
                {formatInt(node.before)} → {formatInt(node.after)}
              </text>
              <text
                x={node.center.x}
                y={node.center.y + 18}
                fill="#d4e8f6"
                fontSize={11}
                textAnchor="middle"
                pointerEvents="none"
              >
                {delta} {pct}
              </text>
            </g>
          )
        })}
      </svg>

      {tooltip ? (
        <div
          className="tn-tooltip"
          style={{
            left: `${(tooltip.x / VIEW_W) * 100}%`,
            top: `${(tooltip.y / VIEW_H) * 100}%`,
          }}
        >
          <div className="tn-tooltip-title">{tooltip.title}</div>
          {tooltip.lines.map((line) => (
            <div key={line} className="tn-tooltip-line">
              {line}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
