/**
 * 遷移ネットワーク用のデータ定義・生成。
 *
 * 現状は検証用のモック（固定ダミー）です。
 * 本番では DB / API からカテゴリ・前期当期値・遷移件数などを取得し、
 * 同じ型（GoJsNetworkNode / GoJsNetworkEdge）に変換して渡す想定です。
 *
 * ノード数上限 30（Cytoscape / Scratch と同じ試し表示用）。
 */

/** カテゴリ1件＝グラフ上の楕円ノード1個 */
export type GoJsNetworkNode = {
  id: string
  label: string
  /** 前期の購入量（画面座標や相対値ではない） */
  before: number
  /** 当期の購入量 */
  after: number
  /** 圏外との純増減（正=流入、負=流出） */
  external: number
}

/** カテゴリ間の遷移1本＝有向矢印1本 */
export type GoJsNetworkEdge = {
  from: string
  to: string
  value: number
  /**
   * true のとき線をグレー表示（スライダーしきい値より優先）。
   * false のとき常に通常色。未指定時は表示最小値しきい値で判定。
   */
  muted?: boolean
}

/** ノード数の下限 */
export const NODE_COUNT_MIN = 2
/** 試し表示用の上限（Cytoscape / Scratch と同じ） */
export const NODE_COUNT_MAX = 30

/** 元画面を再現する固定8カテゴリ（9件目以降は NODE_POOL_EXTRA） */
const NODE_POOL_BASE: GoJsNetworkNode[] = [
  {
    id: 'other',
    label: 'その他',
    before: 150712,
    after: 153077,
    external: 1313,
  },
  {
    id: 'other-unselected',
    label: 'その他(選択以外)',
    before: 109536,
    after: 105379,
    external: -3044,
  },
  {
    id: 'cat-a',
    label: 'カテゴリA',
    before: 568,
    after: 660,
    external: -9,
  },
  {
    id: 'cat-b',
    label: 'カテゴリB',
    before: 734,
    after: 523,
    external: -187,
  },
  {
    id: 'cat-c',
    label: 'カテゴリC',
    before: 30,
    after: 26,
    external: 11,
  },
  {
    id: 'cat-d',
    label: 'カテゴリD',
    before: 1,
    after: 0,
    external: 0,
  },
  {
    id: 'cat-e',
    label: 'カテゴリE',
    before: 420,
    after: 510,
    external: 40,
  },
  {
    id: 'cat-f',
    label: 'カテゴリF',
    before: 880,
    after: 760,
    external: -55,
  },
]

/** 上限まで埋める試し用の連番カテゴリ */
const NODE_POOL_EXTRA: GoJsNetworkNode[] = Array.from(
  { length: NODE_COUNT_MAX - NODE_POOL_BASE.length },
  (_, i) => {
    const n = i + 9
    const dummyBefore = 100 + n * 17
    const dummyAfter = 90 + n * 19
    const dummyExternalSign = n % 3 === 0 ? 1 : -1
    const dummyExternal = dummyExternalSign * (10 + n * 3)
    return {
      id: `cat-${n}`,
      label: `カテゴリ${n}`,
      before: dummyBefore,
      after: dummyAfter,
      external: dummyExternal,
    }
  },
)

/** 全ノード候補の倉庫 */
const NODE_POOL: GoJsNetworkNode[] = [...NODE_POOL_BASE, ...NODE_POOL_EXTRA]

/** 固定8カテゴリ間の遷移 */
const EDGE_POOL_BASE: GoJsNetworkEdge[] = [
  { from: 'other', to: 'other-unselected', value: 1151 },
  { from: 'other', to: 'cat-a', value: 420 },
  { from: 'other', to: 'cat-b', value: 280 },
  { from: 'cat-a', to: 'other', value: 95 },
  { from: 'cat-a', to: 'cat-b', value: 62 },
  { from: 'cat-a', to: 'other-unselected', value: 48 },
  { from: 'cat-b', to: 'cat-c', value: 110 },
  { from: 'cat-b', to: 'other', value: 75 },
  { from: 'cat-c', to: 'cat-d', value: 8 },
  { from: 'cat-c', to: 'cat-a', value: 12 },
  { from: 'other-unselected', to: 'cat-d', value: 22 },
  { from: 'other-unselected', to: 'cat-b', value: 35 },
  { from: 'cat-e', to: 'other', value: 150 },
  { from: 'cat-e', to: 'cat-a', value: 44 },
  { from: 'cat-f', to: 'cat-b', value: 88 },
  { from: 'cat-f', to: 'cat-e', value: 210 },
  { from: 'other', to: 'cat-e', value: 320 },
  { from: 'cat-d', to: 'cat-f', value: 5 },
  { from: 'cat-c', to: 'cat-e', value: 18 },
  { from: 'cat-a', to: 'cat-f', value: 130 },
]

/** 連番カテゴリ向けの遷移 */
const EDGE_POOL_EXTRA: GoJsNetworkEdge[] = NODE_POOL_EXTRA.flatMap(
  (node, i) => {
    const edges: GoJsNetworkEdge[] = [
      { from: 'other', to: node.id, value: 40 + i * 7 },
      { from: node.id, to: 'other', value: 20 + i * 3 },
    ]
    if (i > 0) {
      edges.push({
        from: NODE_POOL_EXTRA[i - 1].id,
        to: node.id,
        value: 15 + i * 2,
      })
    }
    return edges
  },
)

/** 全矢印候補の倉庫 */
const EDGE_POOL: GoJsNetworkEdge[] = [...EDGE_POOL_BASE, ...EDGE_POOL_EXTRA]

/** しきい値未満（または muted 指定）ならグレー表示対象 */
export function isGrayEdge(edge: GoJsNetworkEdge, edgeMinAbs: number): boolean {
  if (edge.muted === true) return true
  if (edge.muted === false) return false
  return Math.abs(edge.value) < edgeMinAbs
}

/**
 * 倉庫から今回使う分だけ取り出す（描画はしない）。
 * 1. count を 2〜30 に丸める
 * 2. NODE_POOL の先頭 n 件
 * 3. 両端が nodes にいるエッジだけ残す
 */
export function buildGoJsNetwork(count: number): {
  nodes: GoJsNetworkNode[]
  edges: GoJsNetworkEdge[]
} {
  const n = Math.min(
    NODE_COUNT_MAX,
    Math.max(NODE_COUNT_MIN, Math.floor(count)),
  )
  const nodes = NODE_POOL.slice(0, n)
  const ids = new Set(nodes.map((node) => node.id))
  const edges = EDGE_POOL.filter(
    (edge) => ids.has(edge.from) && ids.has(edge.to),
  )
  return { nodes, edges }
}
