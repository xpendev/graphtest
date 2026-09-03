import type { GoJsNetworkEdge, GoJsNetworkNode } from '../transitionNetworkGoJs/goJsData'
import { isGrayEdge } from '../transitionNetworkGoJs/goJsData'
import {
  buildExternalModels,
  ellipsePositions,
  formatDelta,
  formatInt,
} from '../transitionNetworkGoJs/goJsHelpers'
import { NODE_HEIGHT, NODE_WIDTH } from '../transitionNetworkGoJs/goJsStyles'
import { excelLayoutOffset, shiftPoint } from './excelLayoutByCount'

export type GoJsExcelExportInput = {
  nodes: GoJsNetworkNode[]
  edges: GoJsNetworkEdge[]
  edgeMinAbs: number
}

/** Data / Node / Edge 各シートの行（1 行目はヘッダー） */
export type GoJsExcelTables = {
  data: (string | number)[][]
  node: (string | number)[][]
  edge: (string | number)[][]
}

/** GoJS の "x y" 文字列を座標にする */
function parseLoc(loc: string): { x: number; y: number } {
  const [x, y] = loc.split(/\s+/).map(Number)
  return { x, y }
}

/** 楕円縁上の接点（圏外矢印のノード側端点） */
function ellipseEdgeToward(
  center: { x: number; y: number },
  other: { x: number; y: number },
): { x: number; y: number } {
  const rx = NODE_WIDTH / 2
  const ry = NODE_HEIGHT / 2
  const vx = other.x - center.x
  const vy = other.y - center.y
  const mag = Math.hypot(vx, vy)
  if (mag < 0.001) return center
  const t = 1 / Math.hypot(vx / rx, vy / ry)
  return { x: center.x + t * vx, y: center.y + t * vy }
}

/**
 * Excel 圏外矢印の棒の長さ倍率。
 * GoJS の tip 位置に対し、ノード縁から先端までの距離をこの割合にする。
 */
const EXCEL_EXTERNAL_SHAFT_SCALE = 0.5

/** 圏外矢印の先端を、縁からの距離が短くなる位置へ移す */
function shortenExternalTip(
  edgePoint: { x: number; y: number },
  tip: { x: number; y: number },
): { x: number; y: number } {
  return {
    x: edgePoint.x + (tip.x - edgePoint.x) * EXCEL_EXTERNAL_SHAFT_SCALE,
    y: edgePoint.y + (tip.y - edgePoint.y) * EXCEL_EXTERNAL_SHAFT_SCALE,
  }
}

/** ノード楕円内に出す複数行ラベル */
function nodeDisplayLabel(node: GoJsNetworkNode): string {
  const { delta, pct } = formatDelta(node.before, node.after)
  return [
    node.label,
    `${formatInt(node.before)} → ${formatInt(node.after)}`,
    `${delta} ${pct}`,
  ].join('\n')
}

/**
 * VBA が読む Data / Node / Edge 表を組み立てる。
 * 配置は GoJS と同じ軌道→ Excel 用中心へ平行移動。
 */
export function buildGoJsExcelTables(input: GoJsExcelExportInput): GoJsExcelTables {
  const { nodes, edges, edgeMinAbs } = input
  // GoJS と同じ軌道で一度計算し、Excel 用中心へ平行移動する
  const basePositions = ellipsePositions(nodes.length)
  const external = buildExternalModels(nodes, basePositions, edgeMinAbs)
  const { dx, dy } = excelLayoutOffset(nodes.length)
  const positions = basePositions.map((p) => shiftPoint(p, dx, dy))
  const ghostLocById = new Map(
    external.ghosts.map((ghost) => [
      ghost.key,
      shiftPoint(parseLoc(ghost.loc), dx, dy),
    ]),
  )
  const nodeLocById = new Map(
    nodes.map((node, index) => [node.id, positions[index]]),
  )

  const maxEdgeValue =
    edges.length > 0 ? Math.max(...edges.map((edge) => edge.value)) : null

  const data: (string | number)[][] = [
    ['key', 'value'],
    ['nodeWidth', NODE_WIDTH],
    ['nodeHeight', NODE_HEIGHT],
  ]

  const node: (string | number)[][] = [
    ['id', 'label', 'before', 'after', 'x', 'y'],
    ...nodes.map((nodeRow, index) => [
      nodeRow.id,
      nodeDisplayLabel(nodeRow),
      nodeRow.before,
      nodeRow.after,
      positions[index].x,
      positions[index].y,
    ]),
  ]

  const edge: (string | number)[][] = [
    [
      'from',
      'to',
      'value',
      'muted',
      'kind',
      'label',
      'fromX',
      'fromY',
      'toX',
      'toY',
    ],
    ...edges.map((edgeRow) => {
      const from = nodeLocById.get(edgeRow.from)
      const to = nodeLocById.get(edgeRow.to)
      return [
        edgeRow.from,
        edgeRow.to,
        edgeRow.value,
        isGrayEdge(edgeRow, edgeMinAbs) ? 1 : 0,
        'internal',
        edgeRow.value === maxEdgeValue ? formatInt(edgeRow.value) : '',
        from?.x ?? '',
        from?.y ?? '',
        to?.x ?? '',
        to?.y ?? '',
      ]
    }),
    ...external.links.map((link) => {
      const fromId = link.from
      const toId = link.to
      let from = ghostLocById.get(fromId) ?? nodeLocById.get(fromId)
      let to = ghostLocById.get(toId) ?? nodeLocById.get(toId)
      if (from && to) {
        if (nodeLocById.has(fromId) && ghostLocById.has(toId)) {
          from = ellipseEdgeToward(from, to)
          to = shortenExternalTip(from, to)
        } else if (ghostLocById.has(fromId) && nodeLocById.has(toId)) {
          to = ellipseEdgeToward(to, from)
          from = shortenExternalTip(to, from)
        }
      }
      return [
        fromId,
        toId,
        link.value,
        link.muted ? 1 : 0,
        'external',
        link.label,
        from?.x ?? '',
        from?.y ?? '',
        to?.x ?? '',
        to?.y ?? '',
      ]
    }),
  ]

  return { data, node, edge }
}
