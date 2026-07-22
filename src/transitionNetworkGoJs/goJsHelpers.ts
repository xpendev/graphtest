import {
  NODE_COUNT_MAX,
  NODE_COUNT_MIN,
  type GoJsNetworkNode,
} from './goJsData'

/** 流入/流出線の表示最小値スライダー初期値 */
export const EDGE_MIN_DEFAULT = 50
/** 流入/流出線の表示最小値スライダー上限 */
export const EDGE_MIN_MAX = 1000

/** 楕円配置の中心 X（Cytoscape と同じ） */
const CX = 600
/** 楕円配置の中心 Y */
const CY = 280
/** 楕円の横半径 */
const RADIUS_X = 430
/** 楕円の縦半径 */
const RADIUS_Y = 195
/** ノード楕円サイズ（goJsStyles と揃える） */
const NODE_W = 168
const NODE_H = 64

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
 * Cytoscape の ellipsePositions と同じ式。
 */
export function ellipsePositions(count: number): { x: number; y: number }[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count
    return {
      x: CX + RADIUS_X * Math.cos(angle),
      y: CY + RADIUS_Y * Math.sin(angle),
    }
  })
}

/** @deprecated ellipsePositions と同じ */
export function nodePositions(count: number): { x: number; y: number }[] {
  return ellipsePositions(count)
}

/**
 * 圏外矢印用のゴーストノード／リンク（Cytoscape と同じ考え方）。
 * GoJS の Link も両端ノードが必要なため、透明ノードで代用する。
 */
export function buildExternalModels(
  nodes: GoJsNetworkNode[],
  positions: { x: number; y: number }[],
  edgeMinAbs: number,
): {
  ghosts: { key: string; category: string; loc: string }[]
  links: {
    key: string
    category: string
    from: string
    to: string
    label: string
    value: number
    fromLabel: string
    toLabel: string
    kind: string
    muted: boolean
  }[]
} {
  const ghosts: { key: string; category: string; loc: string }[] = []
  const links: {
    key: string
    category: string
    from: string
    to: string
    label: string
    value: number
    fromLabel: string
    toLabel: string
    kind: string
    muted: boolean
  }[] = []

  nodes.forEach((node, index) => {
    if (node.external === 0) return

    const center = positions[index]
    const ang = Math.atan2(center.y - CY, center.x - CX)
    const tip = {
      x: center.x + Math.cos(ang) * (NODE_W / 2 + 36),
      y: center.y + Math.sin(ang) * (NODE_H / 2 + 28),
    }
    const ghostId = `ext-ghost-${node.id}`
    const inflow = node.external > 0

    ghosts.push({
      key: ghostId,
      category: 'ghost',
      loc: `${tip.x} ${tip.y}`,
    })
    links.push({
      key: `ext-${node.id}`,
      category: 'external',
      from: inflow ? ghostId : node.id,
      to: inflow ? node.id : ghostId,
      label: formatInt(node.external),
      value: node.external,
      fromLabel: inflow ? '圏外' : node.label,
      toLabel: inflow ? node.label : '圏外',
      kind: 'external',
      muted: Math.abs(node.external) < edgeMinAbs,
    })
  })

  return { ghosts, links }
}

/** ノード内に表示する複数行ラベルを組み立てる */
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

/** ノードホバー用ツールチップの文言を返す */
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
