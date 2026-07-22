import type { TransitionEdge, TransitionNode } from '../data/transitionNetworkData'

export const VIEW_W = 1200
export const VIEW_H = 560
export const CX = VIEW_W / 2
export const CY = VIEW_H / 2
/** 横方向に広く見せるため、円ではなく楕円配置にする */
export const RADIUS_X = 430
export const RADIUS_Y = 195
export const NODE_W = 168
export const NODE_H = 64

export const EDGE_MIN_DEFAULT = 50
export const EDGE_MIN_MAX = 500

export type Point = { x: number; y: number }

export type TooltipState = {
  x: number
  y: number
  title: string
  lines: string[]
}

export type LaidOutNode = TransitionNode & { center: Point }

export type LaidOutEdge = {
  edge: TransitionEdge
  fromLabel: string
  toLabel: string
  geom: {
    start: Point
    end: Point
    mid: Point
    labelPos: Point
  }
}

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

function nodeCenters(count: number): Point[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count
    return {
      x: CX + RADIUS_X * Math.cos(angle),
      y: CY + RADIUS_Y * Math.sin(angle),
    }
  })
}

function ellipseEdgePoint(center: Point, angle: number): Point {
  const rx = NODE_W / 2
  const ry = NODE_H / 2
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const denom = Math.sqrt(rx * rx * sin * sin + ry * ry * cos * cos)
  const t = (rx * ry) / denom
  return { x: center.x + t * cos, y: center.y + t * sin }
}

function angleBetween(a: Point, b: Point): number {
  return Math.atan2(b.y - a.y, b.x - a.x)
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

function buildEdgeGeometry(
  from: Point,
  to: Point,
): LaidOutEdge['geom'] {
  const ang = angleBetween(from, to)
  const start = ellipseEdgePoint(from, ang)
  const end = ellipseEdgePoint(to, ang + Math.PI)
  const mid = midpoint(start, end)
  const nx = -Math.sin(ang)
  const ny = Math.cos(ang)
  return {
    start,
    end,
    mid,
    labelPos: { x: mid.x + nx * 12, y: mid.y + ny * 12 },
  }
}

export function externalArrow(
  center: Point,
  external: number,
): { lineStart: Point; lineEnd: Point; label: Point } {
  const ang = angleBetween({ x: CX, y: CY }, center)
  const outward = external < 0
  const tip = {
    x: center.x + Math.cos(ang) * (NODE_W / 2 + 36),
    y: center.y + Math.sin(ang) * (NODE_H / 2 + 28),
  }
  const base = ellipseEdgePoint(center, ang)
  if (outward) {
    return {
      lineStart: base,
      lineEnd: tip,
      label: {
        x: tip.x + Math.cos(ang) * 14,
        y: tip.y + Math.sin(ang) * 14,
      },
    }
  }
  return {
    lineStart: tip,
    lineEnd: base,
    label: {
      x: tip.x + Math.cos(ang) * 14,
      y: tip.y + Math.sin(ang) * 14,
    },
  }
}

export function layoutNodes(nodes: TransitionNode[]): LaidOutNode[] {
  const centers = nodeCenters(nodes.length)
  return nodes.map((node, i) => ({ ...node, center: centers[i] }))
}

export function layoutEdges(
  edges: TransitionEdge[],
  nodes: LaidOutNode[],
): LaidOutEdge[] {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  return edges
    .map((edge) => {
      const from = byId.get(edge.from)
      const to = byId.get(edge.to)
      if (!from || !to) return null
      return {
        edge,
        fromLabel: from.label,
        toLabel: to.label,
        geom: buildEdgeGeometry(from.center, to.center),
      }
    })
    .filter((x): x is LaidOutEdge => x !== null)
}
