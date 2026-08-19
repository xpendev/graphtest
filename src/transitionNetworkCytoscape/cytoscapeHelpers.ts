import {
  NODE_COUNT_MAX,
  NODE_COUNT_MIN,
  type CytoscapeNetworkNode,
} from './cytoscapeData'

/** 流入/流出線の表示最小値スライダー初期値 */
export const EDGE_MIN_DEFAULT = 50
/** 流入/流出線の表示最小値スライダー上限 */
export const EDGE_MIN_MAX = 1000

/** 楕円配置の中心 X */
const CX = 600
/** 楕円配置の中心 Y */
const CY = 280
/** ノードを並べる大きな楕円軌道の横半径 */
const RADIUS_X = 900
/** ノードを並べる大きな楕円軌道の縦半径 */
const RADIUS_Y = 350

/** ノード楕円の高さ（cytoscapeStyles と揃える） */
const NODE_H = 64
/** スクラッチと同じ短い塗り矢印 */
const EXTERNAL_ARROW_H = 34
const EXTERNAL_NODE_GAP = 6
/** y=-1 が上。軸が下・三角が上（流出・上半分など） */
const POLY_ARROW_UP =
  '0 -1 1 -0.18 0.25 -0.18 0.25 1 -0.25 1 -0.25 -0.18 -1 -0.18'
/** 三角が下（流入・上半分など） */
const POLY_ARROW_DOWN =
  '0 1 1 0.18 0.25 0.18 0.25 -1 -0.25 -1 -0.25 0.18 -1 0.18'

/**
 * ノードを楕円状に等間隔配置した座標一覧を返す。
 * 上（12時）から時計回り。描画はしない。
 */
export function ellipsePositions(count: number): { x: number; y: number }[] {
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

    const x = CX + RADIUS_X * Math.cos(angle)
    const y = CY + RADIUS_Y * Math.sin(angle)
    return { x, y }
  })
}

/** 数値を日本ロケールのカンマ区切りにする */
export function formatInt(n: number): string {
  return n.toLocaleString('ja-JP')
}

/**
 * 前期→当期の差分と増減率を文字列で返す。
 * before が 0 のときは割合を「—」。
 */
export function formatDelta(
  before: number,
  after: number,
): {
  delta: string
  pct: string
} {
  const deltaValue = after - before
  const percentText =
    before === 0 ? '—' : `${Math.round((deltaValue / before) * 100)}%`
  return {
    delta: deltaValue.toLocaleString('ja-JP'),
    pct: percentText,
  }
}

type CyElement = {
  group: 'nodes' | 'edges'
  classes: string
  data: Record<string, string | number>
  position?: { x: number; y: number }
  selectable?: boolean
  grabbable?: boolean
}

/**
 * 圏外の短い塗り矢印ノードを返す（スクラッチと同じ形）。
 */
export function buildExternalElements(
  nodes: CytoscapeNetworkNode[],
  positions: { x: number; y: number }[],
  edgeMinAbs: number,
): CyElement[] {
  const elements: CyElement[] = []

  nodes.forEach((node, index) => {
    if (node.external === 0) return

    const center = positions[index]
    const outward = center.y < CY ? -1 : 1
    const isInflow = node.external > 0
    const isOutflow = !isInflow
    const isMuted = Math.abs(node.external) < edgeMinAbs
    const side = outward < 0 ? 'up' : 'down'
    const pointsUp = (outward < 0) === isOutflow
    const y0 = center.y + outward * (NODE_H / 2 + EXTERNAL_NODE_GAP)
    const arrowCenterY = y0 + outward * (EXTERNAL_ARROW_H / 2)

    elements.push({
      group: 'nodes',
      classes: isMuted ? 'external-arrow muted' : 'external-arrow',
      data: {
        id: `ext-arrow-${node.id}`,
        hostId: node.id,
        kind: 'external-arrow',
        label: formatInt(node.external),
        side,
        dir: isInflow ? 'in' : 'out',
        poly: pointsUp ? POLY_ARROW_UP : POLY_ARROW_DOWN,
        value: node.external,
        fromLabel: isInflow ? '圏外' : node.label,
        toLabel: isInflow ? node.label : '圏外',
      },
      position: { x: center.x, y: arrowCenterY },
      selectable: false,
      grabbable: false,
    })
  })

  return elements
}

/** ノード内に表示する複数行ラベルを組み立てる */
export function nodeLabelLines(node: CytoscapeNetworkNode): string {
  const { delta, pct } = formatDelta(node.before, node.after)
  const externalLine =
    node.external >= 0
      ? `外:+${formatInt(node.external)}`
      : `外:${formatInt(node.external)}`
  return [
    node.label,
    `${formatInt(node.before)} → ${formatInt(node.after)}`,
    `${delta} ${pct}`,
    externalLine,
  ].join('\n')
}

/** ノードホバー用ツールチップの文言を返す */
export function nodeTooltipContent(node: CytoscapeNetworkNode): {
  title: string
  lines: string[]
} {
  const { delta, pct } = formatDelta(node.before, node.after)
  const externalLabel =
    node.external >= 0
      ? `圏外からの流入: ${formatInt(node.external)}`
      : `圏外への流出: ${formatInt(Math.abs(node.external))}`
  return {
    title: node.label,
    lines: [
      `前期: ${formatInt(node.before)}`,
      `今期: ${formatInt(node.after)}`,
      `差分: ${delta}（${pct}）`,
      externalLabel,
    ],
  }
}

/** エッジホバー用ツールチップの文言を返す */
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

/** ノード数スライダーの min / max */
export const NODE_SLIDER = {
  min: NODE_COUNT_MIN,
  max: NODE_COUNT_MAX,
} as const
