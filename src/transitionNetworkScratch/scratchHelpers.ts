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
export const EDGE_MIN_MAX = 500

/** 2D 座標 */
export type Point = { x: number; y: number }

/**
 * ノード数ごとの中心座標（固定値）。
 * 並びは「上から時計回り」。見た目を変えたいときは該当ノード数の x/y を直接編集する。
 */
const NODE_POSITIONS_BY_COUNT: Record<number, Point[]> = {
  2: [
    { x: 600, y: 85 },
    { x: 600, y: 475 },
  ],
  3: [
    { x: 600, y: 85 },
    { x: 972, y: 378 },
    { x: 228, y: 378 },
  ],
  4: [
    { x: 600, y: 85 },
    { x: 1030, y: 280 },
    { x: 600, y: 475 },
    { x: 170, y: 280 },
  ],
  5: [
    { x: 600, y: 85 },
    { x: 1009, y: 220 },
    { x: 853, y: 438 },
    { x: 347, y: 438 },
    { x: 191, y: 220 },
  ],
  6: [
    { x: 600, y: 70 },
    { x: 1040, y: 160 },
    { x: 1040, y: 400 },
    { x: 600, y: 490 },
    { x: 160, y: 400 },
    { x: 160, y: 160 },
  ],
  7: [
    { x: 600, y: 65 },
    { x: 980, y: 130 },
    { x: 1090, y: 300 },
    { x: 840, y: 485 },
    { x: 360, y: 485 },
    { x: 110, y: 340 },
    { x: 250, y: 115 },
  ],
  8: [
    { x: 600, y: 85 },
    { x: 904, y: 142 },
    { x: 1030, y: 280 },
    { x: 904, y: 418 },
    { x: 600, y: 475 },
    { x: 296, y: 418 },
    { x: 170, y: 280 },
    { x: 296, y: 142 },
  ],
}

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

/** 指定ノード数の配置座標一覧を返す（固定表を参照） */
function nodeCenters(count: number): Point[] {
  const positions = NODE_POSITIONS_BY_COUNT[count]
  if (!positions) {
    throw new Error(`未対応のノード数です: ${count}（対応は 2〜8）`)
  }
  return positions
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

/** ノードを固定座標で配置した LaidOutNode 一覧を返す */
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
