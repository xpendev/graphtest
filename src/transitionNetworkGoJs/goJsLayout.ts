import {
  NODE_COUNT_MAX,
  NODE_COUNT_MIN,
  type GoJsNetworkEdge,
  type GoJsNetworkNode,
} from './goJsData'

export const EDGE_MIN_DEFAULT = 50
export const EDGE_MIN_MAX = 500

const CX = 600
const CY = 280
const RADIUS_X = 430
const RADIUS_Y = 195

export function formatInt(n: number): string {
  return n.toLocaleString('ja-JP')
}

export function formatDelta(
  before: number,
  after: number,
): {
  delta: string
  pct: string
} {
  const d = after - before
  const pct = before === 0 ? '—' : `${Math.round((d / before) * 100)}%`
  return {
    delta: d.toLocaleString('ja-JP'),
    pct,
  }
}

export function ellipsePositions(count: number): { x: number; y: number }[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count
    return {
      x: CX + RADIUS_X * Math.cos(angle),
      y: CY + RADIUS_Y * Math.sin(angle),
    }
  })
}

export function nodeLabelLines(node: GoJsNetworkNode): string {
  const { delta, pct } = formatDelta(node.before, node.after)
  const ext =
    node.external >= 0
      ? `外:+${formatInt(node.external)}`
      : `外:${formatInt(node.external)}`
  return [
    node.label,
    `${formatInt(node.before)} → ${formatInt(node.after)}`,
    `${delta} ${pct}`,
    ext,
  ].join('\n')
}

export function filterGoJsEdges(
  edges: GoJsNetworkEdge[],
  edgeMinAbs: number,
): GoJsNetworkEdge[] {
  return edges.filter((edge) => Math.abs(edge.value) >= edgeMinAbs)
}

export function nodeTooltipContent(node: GoJsNetworkNode): {
  title: string
  lines: string[]
} {
  const { delta, pct } = formatDelta(node.before, node.after)
  const extLabel =
    node.external >= 0
      ? `圏外からの流入: ${formatInt(node.external)}`
      : `圏外への流出: ${formatInt(Math.abs(node.external))}`
  return {
    title: node.label,
    lines: [
      `前期: ${formatInt(node.before)}`,
      `今期: ${formatInt(node.after)}`,
      `差分: ${delta}（${pct}）`,
      extLabel,
    ],
  }
}

export function edgeTooltipContent(
  fromLabel: string,
  toLabel: string,
  value: number,
): {
  title: string
  lines: string[]
} {
  return {
    title: '遷移',
    lines: [`${fromLabel} → ${toLabel}`, `件数: ${formatInt(value)}`],
  }
}

export const NODE_SLIDER = {
  min: NODE_COUNT_MIN,
  max: NODE_COUNT_MAX,
} as const
