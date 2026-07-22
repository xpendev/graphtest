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
} from './scratchHelpers'
import { scratchStyles } from './scratchStyles'

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
            <path
              d="M 0 1.5 L 9 5 L 0 8.5 Z"
              fill={scratchStyles.arrowMarkerFill}
            />
          </marker>
          <marker
            id="tn-arrow-muted"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path
              d="M 0 1.5 L 9 5 L 0 8.5 Z"
              fill={scratchStyles.arrowMarkerMutedFill}
            />
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
            <path
              d="M 0 1.5 L 9 5 L 0 8.5 Z"
              fill={scratchStyles.arrowExtMarkerFill}
            />
          </marker>
          <marker
            id="tn-arrow-ext-muted"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path
              d="M 0 1.5 L 9 5 L 0 8.5 Z"
              fill={scratchStyles.arrowMarkerMutedFill}
            />
          </marker>
          <linearGradient id="tn-node-fill" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={scratchStyles.nodeGradient.start}
            />
            <stop
              offset="100%"
              stopColor={scratchStyles.nodeGradient.end}
            />
          </linearGradient>
          <linearGradient id="tn-node-fill-hover" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={scratchStyles.nodeGradientHover.start}
            />
            <stop
              offset="100%"
              stopColor={scratchStyles.nodeGradientHover.end}
            />
          </linearGradient>
        </defs>

        <rect
          width={VIEW_W}
          height={VIEW_H}
          fill={scratchStyles.canvasBg}
          rx="8"
        />

        {edges.map(({ edge, fromLabel, toLabel, geom }) => {
          const key = `${edge.from}-${edge.to}`
          const active = hoverEdgeKey === key
          const muted = Math.abs(edge.value) < edgeMinAbs
          const strokeColor = active
            ? muted
              ? scratchStyles.edgeStrokeMutedHover
              : scratchStyles.edgeStrokeHover
            : muted
              ? scratchStyles.edgeStrokeMuted
              : scratchStyles.edgeStroke
          const strokeWidth = Math.min(4, 1.2 + Math.abs(edge.value) / 400)

          return (
            <g key={key} opacity={muted ? 0.55 : 0.95}>
              <line
                x1={geom.start.x}
                y1={geom.start.y}
                x2={geom.end.x}
                y2={geom.end.y}
                stroke={strokeColor}
                strokeWidth={active ? strokeWidth + 1 : strokeWidth}
                markerEnd={muted ? 'url(#tn-arrow-muted)' : 'url(#tn-arrow)'}
                pointerEvents="none"
              />
              {/*
                ホバー用ヒット領域。
                React の onMouseEnter / onMouseLeave（SVG 要素上のマウスイベント）。
                jQuery ではない。
              */}
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
                fill={
                  muted
                    ? scratchStyles.edgeLabelFillMuted
                    : scratchStyles.edgeLabelFill
                }
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
          const showExternal = node.external !== 0
          const mutedExternal = Math.abs(node.external) < edgeMinAbs
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
                <g opacity={mutedExternal ? 0.55 : 1}>
                  <line
                    x1={ext.lineStart.x}
                    y1={ext.lineStart.y}
                    x2={ext.lineEnd.x}
                    y2={ext.lineEnd.y}
                    stroke={
                      mutedExternal
                        ? scratchStyles.externalStrokeMuted
                        : scratchStyles.externalStroke
                    }
                    strokeWidth={1.4}
                    markerEnd={
                      mutedExternal
                        ? 'url(#tn-arrow-ext-muted)'
                        : 'url(#tn-arrow-ext)'
                    }
                    pointerEvents="none"
                  />
                  <text
                    x={ext.label.x}
                    y={ext.label.y}
                    fill={
                      mutedExternal
                        ? scratchStyles.externalLabelFillMuted
                        : scratchStyles.externalLabelFill
                    }
                    fontSize={11}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    pointerEvents="none"
                  >
                    {formatInt(node.external)}
                  </text>
                </g>
              ) : null}

              {/*
                ノードホバー。
                React の onMouseEnter / onMouseLeave（SVG 要素上のマウスイベント）。
                jQuery ではない。
              */}
              <ellipse
                cx={node.center.x}
                cy={node.center.y}
                rx={NODE_W / 2}
                ry={NODE_H / 2}
                fill={
                  active ? 'url(#tn-node-fill-hover)' : 'url(#tn-node-fill)'
                }
                stroke={
                  active
                    ? scratchStyles.nodeStrokeHover
                    : scratchStyles.nodeStroke
                }
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
                fill={scratchStyles.nodeTitleFill}
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
                fill={scratchStyles.nodeBodyFill}
                fontSize={11}
                textAnchor="middle"
                pointerEvents="none"
              >
                {formatInt(node.before)} → {formatInt(node.after)}
              </text>
              <text
                x={node.center.x}
                y={node.center.y + 18}
                fill={scratchStyles.nodeDeltaFill}
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
