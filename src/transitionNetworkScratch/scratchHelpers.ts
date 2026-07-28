import type { ScratchEdge, ScratchNode } from './scratchData'

/** SVG viewBox 幅 */
export const VIEW_W = 1200
/** SVG viewBox 高さ */
export const VIEW_H = 560
/** グラフ中心 X（圏外矢印の向き計算用） */
export const CX = VIEW_W / 2
/** グラフ中心 Y（圏外矢印の向き計算用） */
export const CY = VIEW_H / 2
/** ノード楕円の幅 */
export const NODE_W = 168
/** ノード楕円の高さ */
export const NODE_H = 64

/** 流入/流出線の表示最小値スライダー初期値 */
export const EDGE_MIN_DEFAULT = 50
/** 流入/流出線の表示最小値スライダー上限 */
export const EDGE_MIN_MAX = 1000

/** 2D 座標 */
export type Point = { x: number; y: number }

/** 楕円配置の横半径（Cytoscape と同じ可変配置） */
const RADIUS_X = 430
/** 楕円配置の縦半径 */
const RADIUS_Y = 195

/** グラフ上ツールチップの表示状態 */
export type TooltipState = {
  x: number
  y: number
  title: string
  lines: string[]
}

/** 座標付きノード（レイアウト後） */
export type LaidOutNode = ScratchNode & { center: Point }

/** 幾何情報付きエッジ（レイアウト後） */
export type LaidOutEdge = {
  edge: ScratchEdge
  fromLabel: string
  toLabel: string
  geom: {
    start: Point
    end: Point
    mid: Point
    labelPos: Point
  }
}

/** 数値を日本ロケールのカンマ区切りにする */
export function formatInt(n: number): string {
  return n.toLocaleString('ja-JP')
}

/** 前期→当期の差分と増減率を文字列で返す */
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

/**
 * ノードを楕円状に等間隔配置した座標一覧を返す（可変計算）。
 * 上から時計回り。Cytoscape の ellipsePositions と同じ式。
 */
function nodeCenters(count: number): Point[] {
  return Array.from({ length: count }, (_, i) => {
    /** 1周ぶんの角度（2π = 360度） */
    const FULL_TURN = 2 * Math.PI
    /** 12時方向から始めるための開始オフセット */
    const START_AT_TOP = -Math.PI / 2
    /** ノード1個ぶん進む角度 */
    const stepAngle = FULL_TURN / count
    /** i個目までに進む角度 */
    const angleFromStart = i * stepAngle
    /** 最終的な角度（12時開始 + i個目の進み） */
    const angle = START_AT_TOP + angleFromStart
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

/** 圏外流入／流出矢印の始終点とラベル位置を返す */
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

/** ノードを楕円配置した LaidOutNode 一覧を返す */
export function layoutNodes(nodes: ScratchNode[]): LaidOutNode[] {
  const centers = nodeCenters(nodes.length)
  return nodes.map((node, i) => ({ ...node, center: centers[i] }))
}

/** エッジに始点・終点ノード間の幾何情報を付与する */
export function layoutEdges(
  edges: ScratchEdge[],
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
