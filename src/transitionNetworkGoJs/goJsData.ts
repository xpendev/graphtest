/**
 * 遷移ネットワーク用のデータ定義・生成。
 *
 * 現状は検証用のモック（固定ダミー）です。
 * 本番では DB / API からカテゴリ・前期当期値・遷移件数などを取得し、
 * 同じ型（GoJsNetworkNode / GoJsNetworkEdge）に変換して渡す想定です。
 */
export type GoJsNetworkNode = {
  id: string
  label: string
  before: number
  after: number
  /** 圏外との純増減（正=流入、負=流出） */
  external: number
}

export type GoJsNetworkEdge = {
  from: string
  to: string
  value: number
  /**
   * true のとき線をグレー表示。
   * 未指定時は value が GRAY_EDGE_THRESHOLD 未満ならグレー。
   */
  muted?: boolean
}

/** この件数未満の遷移線はグレー（muted 未指定時） */
export const GRAY_EDGE_THRESHOLD = 100

export const NODE_COUNT_MIN = 2
export const NODE_COUNT_MAX = 8

/** 最大8ノード分のマスタ（先頭から count 個使う） */
const NODE_POOL: GoJsNetworkNode[] = [
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

/** 候補エッジ（両端が選ばれたノードに含まれるものだけ使用） */
const EDGE_POOL: GoJsNetworkEdge[] = [
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

export function isGrayEdge(edge: GoJsNetworkEdge): boolean {
  if (edge.muted === true) return true
  if (edge.muted === false) return false
  return edge.value < GRAY_EDGE_THRESHOLD
}

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
