import { useEffect, useMemo, useState } from 'react'
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
  focusedNodeId: string | null
  tooltip: TooltipState | null
  onFocusNode: (id: string | null) => void
  onTooltip: (tooltip: TooltipState | null) => void
}

/** 矢じり path（右向き三角）。marker 内の viewBox 0..10 上で描く */
const ARROW_PATH_D = 'M 0 1.5 L 9 5 L 0 8.5 Z'

/** 遷移線の太さ: 件数比例（Cytoscape / GoJS と同じ目安） */
function edgeStrokeWidth(value: number): number {
  const rawWidth = 1.2 + Math.abs(value) / 110
  return Math.min(12, rawWidth)
}

type ArrowMarkerProps = {
  id: string
  fill: string
  /** 通常矢印 7 / 圏外矢印 6 */
  size: number
}

/** defs 内の矢じり部品（同じ形・色とサイズだけ違う） */
function ArrowMarker({ id, fill, size }: ArrowMarkerProps) {
  return (
    <marker
      id={id}
      viewBox="0 0 10 10"
      refX="9"
      refY="5"
      markerWidth={size}
      markerHeight={size}
      orient="auto-start-reverse"
    >
      <path d={ARROW_PATH_D} fill={fill} />
    </marker>
  )
}

type NodeVisualRole = 'focus' | 'related' | 'faded' | 'normal'
type EdgeVisualRole = 'flow-in' | 'flow-out' | 'faded' | 'normal'

/**
 * 中央の曼荼羅チャート SVG。
 * 座標は props の nodes/edges（Helpers の戻り値）をそのまま使う。
 */
export function ScratchGraph({
  nodes,
  edges,
  edgeMinAbs,
  focusedNodeId,
  tooltip,
  onFocusNode,
  onTooltip,
}: ScratchGraphProps) {
  const [flowPhase, setFlowPhase] = useState(0)

  useEffect(() => {
    if (!focusedNodeId) {
      setFlowPhase(0)
      return
    }
    const timer = window.setInterval(() => {
      setFlowPhase((phase) => phase + 2)
    }, 45)
    return () => window.clearInterval(timer)
  }, [focusedNodeId])

  const maxEdgeValue = useMemo(
    () =>
      edges.length > 0
        ? Math.max(...edges.map(({ edge }) => edge.value))
        : null,
    [edges],
  )

  const focusInfo = useMemo(() => {
    if (!focusedNodeId) {
      return {
        relatedNodeIds: new Set<string>(),
        incomingKeys: new Set<string>(),
        outgoingKeys: new Set<string>(),
        externalFlow: null as 'in' | 'out' | null,
      }
    }

    const relatedNodeIds = new Set<string>()
    const incomingKeys = new Set<string>()
    const outgoingKeys = new Set<string>()

    for (const { edge } of edges) {
      const key = `${edge.from}-${edge.to}`
      if (edge.to === focusedNodeId) {
        incomingKeys.add(key)
        relatedNodeIds.add(edge.from)
      } else if (edge.from === focusedNodeId) {
        outgoingKeys.add(key)
        relatedNodeIds.add(edge.to)
      }
    }

    const focusNode = nodes.find((node) => node.id === focusedNodeId)
    const externalFlow =
      focusNode && focusNode.external !== 0
        ? focusNode.external > 0
          ? 'in'
          : 'out'
        : null

    return { relatedNodeIds, incomingKeys, outgoingKeys, externalFlow }
  }, [edges, focusedNodeId, nodes])

  const nodeRole = (nodeId: string): NodeVisualRole => {
    if (!focusedNodeId) return 'normal'
    if (nodeId === focusedNodeId) return 'focus'
    if (focusInfo.relatedNodeIds.has(nodeId)) return 'related'
    return 'faded'
  }

  const edgeRole = (edgeKey: string): EdgeVisualRole => {
    if (!focusedNodeId) return 'normal'
    if (focusInfo.incomingKeys.has(edgeKey)) return 'flow-in'
    if (focusInfo.outgoingKeys.has(edgeKey)) return 'flow-out'
    return 'faded'
  }

  return (
    <div className="tn-graph-area">
      <svg
        className="scratch-network-svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label="曼荼羅チャート"
        onClick={() => onFocusNode(null)}
      >
        <defs>
          {/* 矢じり部品置き場。line の markerEnd から id で参照する */}
          <ArrowMarker
            id="tn-arrow"
            fill={scratchStyles.arrowMarkerFill}
            size={7}
          />
          <ArrowMarker
            id="tn-arrow-muted"
            fill={scratchStyles.arrowMarkerMutedFill}
            size={7}
          />
          <ArrowMarker
            id="tn-arrow-flow-in"
            fill={scratchStyles.arrowFlowInFill}
            size={7}
          />
          <ArrowMarker
            id="tn-arrow-flow-out"
            fill={scratchStyles.arrowFlowOutFill}
            size={7}
          />
          <ArrowMarker
            id="tn-arrow-ext"
            fill={scratchStyles.arrowExtMarkerFill}
            size={6}
          />
          <ArrowMarker
            id="tn-arrow-ext-muted"
            fill={scratchStyles.arrowMarkerMutedFill}
            size={6}
          />
          <ArrowMarker
            id="tn-arrow-ext-flow-in"
            fill={scratchStyles.arrowFlowInFill}
            size={6}
          />
          <ArrowMarker
            id="tn-arrow-ext-flow-out"
            fill={scratchStyles.arrowFlowOutFill}
            size={6}
          />
          <linearGradient id="tn-node-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={scratchStyles.nodeGradient.start} />
            <stop offset="100%" stopColor={scratchStyles.nodeGradient.end} />
          </linearGradient>
        </defs>

        <rect
          width={VIEW_W}
          height={VIEW_H}
          fill={scratchStyles.canvasBg}
          rx="8"
        />

        {/* --- 遷移矢印 --- */}
        {edges.map(({ edge, fromLabel, toLabel, geom }) => {
          const edgeKey = `${edge.from}-${edge.to}`
          const isMuted = Math.abs(edge.value) < edgeMinAbs
          const role = edgeRole(edgeKey)
          const baseWidth = edgeStrokeWidth(edge.value)

          let strokeColor = isMuted
            ? scratchStyles.edgeStrokeMuted
            : scratchStyles.edgeStroke
          let markerEnd = isMuted ? 'url(#tn-arrow-muted)' : 'url(#tn-arrow)'
          let opacity = isMuted ? 0.55 : 0.95
          let dashArray: string | undefined
          let dashOffset = 0

          if (role === 'flow-in') {
            strokeColor = scratchStyles.edgeFlowIn
            markerEnd = 'url(#tn-arrow-flow-in)'
            opacity = 0.95
            dashArray = '10 7'
            dashOffset = flowPhase
          } else if (role === 'flow-out') {
            strokeColor = scratchStyles.edgeFlowOut
            markerEnd = 'url(#tn-arrow-flow-out)'
            opacity = 0.95
            dashArray = '10 7'
            dashOffset = -flowPhase
          } else if (role === 'faded') {
            opacity = 0.18
          }

          const labelFill = isMuted
            ? scratchStyles.edgeLabelFillMuted
            : scratchStyles.edgeLabelFill
          const showLabel =
            maxEdgeValue != null && edge.value === maxEdgeValue

          return (
            <g key={edgeKey} opacity={opacity}>
              <line
                x1={geom.start.x}
                y1={geom.start.y}
                x2={geom.end.x}
                y2={geom.end.y}
                stroke={strokeColor}
                strokeWidth={baseWidth}
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                markerEnd={markerEnd}
                pointerEvents="none"
              />
              {/*
                ホバー用の太い透明線（実線は細いので当たりを広げる）。
                React の onMouseEnter / Leave。色は変更せずツールチップのみ。
              */}
              <line
                x1={geom.start.x}
                y1={geom.start.y}
                x2={geom.end.x}
                y2={geom.end.y}
                stroke="transparent"
                strokeWidth={14}
                style={{ cursor: 'pointer' }}
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={() => {
                  onTooltip({
                    x: geom.mid.x,
                    y: geom.mid.y,
                    title: '遷移',
                    lines: [
                      `${fromLabel} → ${toLabel}`,
                      `件数: ${formatInt(edge.value)}`,
                    ],
                  })
                }}
                onMouseLeave={() => onTooltip(null)}
              />
              {showLabel ? (
                <text
                  x={geom.labelPos.x}
                  y={geom.labelPos.y}
                  fill={labelFill}
                  fontSize={11}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  pointerEvents="none"
                >
                  {formatInt(edge.value)}
                </text>
              ) : null}
            </g>
          )
        })}

        {/* --- ノード（楕円）＋圏外矢印 --- */}
        {nodes.map((node) => {
          const hasExternal = node.external !== 0
          const isExternalMuted = Math.abs(node.external) < edgeMinAbs
          const externalGeom = externalArrow(node.center, node.external)
          const { delta, pct } = formatDelta(node.before, node.after)
          const role = nodeRole(node.id)
          const isUp = node.after > node.before
          const externalTooltipLine =
            node.external >= 0
              ? `圏外からの流入: ${formatInt(node.external)}`
              : `圏外への流出: ${formatInt(Math.abs(node.external))}`

          let fill: string = 'url(#tn-node-fill)'
          let stroke = scratchStyles.nodeStroke
          let strokeWidth = 1

          if (role === 'focus') {
            fill = isUp
              ? scratchStyles.nodeUpFill
              : scratchStyles.nodeDownFill
            stroke = scratchStyles.nodeFocusStroke
            strokeWidth = 6
          } else if (role === 'related') {
            fill = isUp
              ? scratchStyles.nodeUpFill
              : scratchStyles.nodeDownFill
            stroke = isUp
              ? scratchStyles.nodeUpStroke
              : scratchStyles.nodeDownStroke
            strokeWidth = 2
          } else if (role === 'faded') {
            fill = scratchStyles.nodeFadedFill
            stroke = scratchStyles.nodeFadedStroke
            strokeWidth = 6
          }

          const isFocusExternal =
            focusedNodeId === node.id && focusInfo.externalFlow != null
          let extStroke = isExternalMuted
            ? scratchStyles.externalStrokeMuted
            : scratchStyles.externalStroke
          let extMarker = isExternalMuted
            ? 'url(#tn-arrow-ext-muted)'
            : 'url(#tn-arrow-ext)'
          let extOpacity = isExternalMuted ? 0.55 : 1
          let extDash: string | undefined
          let extDashOffset = 0

          if (isFocusExternal) {
            if (focusInfo.externalFlow === 'in') {
              extStroke = scratchStyles.edgeFlowIn
              extMarker = 'url(#tn-arrow-ext-flow-in)'
              extOpacity = 0.95
              extDash = '10 7'
              extDashOffset = flowPhase
            } else {
              extStroke = scratchStyles.edgeFlowOut
              extMarker = 'url(#tn-arrow-ext-flow-out)'
              extOpacity = 0.95
              extDash = '10 7'
              extDashOffset = -flowPhase
            }
          } else if (focusedNodeId && focusedNodeId !== node.id) {
            extOpacity = 0.18
          }

          return (
            <g key={node.id}>
              {hasExternal ? (
                <g opacity={extOpacity}>
                  <line
                    x1={externalGeom.lineStart.x}
                    y1={externalGeom.lineStart.y}
                    x2={externalGeom.lineEnd.x}
                    y2={externalGeom.lineEnd.y}
                    stroke={extStroke}
                    strokeWidth={1.4}
                    strokeDasharray={extDash}
                    strokeDashoffset={extDashOffset}
                    markerEnd={extMarker}
                    pointerEvents="none"
                  />
                  <text
                    x={externalGeom.label.x}
                    y={externalGeom.label.y}
                    fill={
                      isExternalMuted
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

              <ellipse
                cx={node.center.x}
                cy={node.center.y}
                rx={NODE_W / 2}
                ry={NODE_H / 2}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation()
                  onFocusNode(node.id)
                }}
                onMouseEnter={() => {
                  onTooltip({
                    x: node.center.x,
                    y: node.center.y - NODE_H / 2 - 8,
                    title: node.label,
                    lines: [
                      `前期: ${formatInt(node.before)}`,
                      `今期: ${formatInt(node.after)}`,
                      `差分: ${delta}（${pct}）`,
                      externalTooltipLine,
                    ],
                  })
                }}
                onMouseLeave={() => onTooltip(null)}
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
