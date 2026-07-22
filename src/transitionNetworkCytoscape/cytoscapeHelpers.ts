import {
  NODE_COUNT_MAX,
  NODE_COUNT_MIN,
  type CytoscapeNetworkNode,
} from './cytoscapeData'

/** 流入/流出線の表示最小値スライダー初期値 */
export const EDGE_MIN_DEFAULT = 50
/** 流入/流出線の表示最小値スライダー上限 */
export const EDGE_MIN_MAX = 1000

/** 楕円配置の中心 X（git 当初の cytoscapeLayout と同じ） */
const CX = 600
/** 楕円配置の中心 Y */
const CY = 280
/** 楕円の横半径 */
const RADIUS_X = 430
/** 楕円の縦半径 */
const RADIUS_Y = 195

/**
 * ノードを楕円状に等間隔配置した座標一覧を返す。
 * 上から時計回り。count に応じて角度だけ変わる（固定表ではない）。
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
 * 圏外矢印用の要素（透明ゴーストノード + エッジ）を返す。
 * Cytoscape のエッジは必ず source/target ノードが必要なため、
 * Scratch の「何もないところからの線」はゴーストノードで代用する。
 */
export function buildExternalElements(
  nodes: CytoscapeNetworkNode[],
  positions: { x: number; y: number }[],
  edgeMinAbs: number,
): {
  group: 'nodes' | 'edges'
  classes: string
  data: Record<string, string | number>
  position?: { x: number; y: number }
  selectable?: boolean
  grabbable?: boolean
}[] {
  /** ノード楕円サイズ（cytoscapeStyles と揃える） */
  const NODE_W = 168
  const NODE_H = 64

  const elements: {
    group: 'nodes' | 'edges'
    classes: string
    data: Record<string, string | number>
    position?: { x: number; y: number }
    selectable?: boolean
    grabbable?: boolean
  }[] = []

  nodes.forEach((node, index) => {
    if (node.external === 0) return

    const center = positions[index]
    // グラフ中心からノードへ向かう向き＝圏外矢印の向き
    const ang = Math.atan2(center.y - CY, center.x - CX)
    const tip = {
      x: center.x + Math.cos(ang) * (NODE_W / 2 + 36),
      y: center.y + Math.sin(ang) * (NODE_H / 2 + 28),
    }
    const ghostId = `ext-ghost-${node.id}`
    const inflow = node.external > 0
    const muted = Math.abs(node.external) < edgeMinAbs

    elements.push({
      group: 'nodes',
      classes: 'external-ghost',
      data: { id: ghostId, label: '' },
      position: tip,
      selectable: false,
      grabbable: false,
    })
    elements.push({
      group: 'edges',
      classes: muted ? 'external muted' : 'external',
      data: {
        id: `ext-${node.id}`,
        source: inflow ? ghostId : node.id,
        target: inflow ? node.id : ghostId,
        label: formatInt(node.external),
        value: node.external,
        fromLabel: inflow ? '圏外' : node.label,
        toLabel: inflow ? node.label : '圏外',
        kind: 'external',
      },
    })
  })

  return elements
}

/** ノード内に表示する複数行ラベルを組み立てる */
export function nodeLabelLines(node: CytoscapeNetworkNode): string {
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
export function nodeTooltipContent(node: CytoscapeNetworkNode): {
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
