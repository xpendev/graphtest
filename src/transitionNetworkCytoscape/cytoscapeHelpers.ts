import {
  NODE_COUNT_MAX,
  NODE_COUNT_MIN,
  type CytoscapeNetworkEdge,
  type CytoscapeNetworkNode,
} from './cytoscapeData'

/** 流入/流出線の表示最小値スライダー初期値 */
export const EDGE_MIN_DEFAULT = 50
/** 流入/流出線の表示最小値スライダー上限 */
export const EDGE_MIN_MAX = 500

/**
 * ノード数ごとの中心座標（固定値）。
 * 並びは「上から時計回り」。キャンバスはおおよそ 1200×560、中心付近に楕円状に置いたもの。
 * 見た目を変えたいときは、該当ノード数の配列の x/y を直接編集する。
 */
const NODE_POSITIONS_BY_COUNT: Record<number, { x: number; y: number }[]> = {
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
export function nodePositions(count: number): { x: number; y: number }[] {
  const positions = NODE_POSITIONS_BY_COUNT[count]
  if (!positions) {
    throw new Error(`未対応のノード数です: ${count}（対応は 2〜8）`)
  }
  return positions
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

/** しきい値未満の遷移エッジを除外する */
export function filterCytoscapeEdges(
  edges: CytoscapeNetworkEdge[],
  edgeMinAbs: number,
): CytoscapeNetworkEdge[] {
  return edges.filter((edge) => Math.abs(edge.value) >= edgeMinAbs)
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
