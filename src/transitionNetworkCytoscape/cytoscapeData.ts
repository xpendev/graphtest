/**
 * 遷移ネットワーク用のデータ定義・生成。
 *
 * 現状は検証用のモック（固定ダミー）です。
 * 本番では DB / API からカテゴリ・前期当期値・遷移件数などを取得し、
 * 同じ型（CytoscapeNetworkNode / CytoscapeNetworkEdge）に変換して渡す想定です。
 *
 * ノード数上限 30（試し表示用。Scratch / GoJS / Cytoscape 共通）。
 */
export type CytoscapeNetworkNode = {
  id: string
  label: string
  before: number
  after: number
  /** 圏外との純増減（正=流入、負=流出） */
  external: number
}

export type CytoscapeNetworkEdge = {
  from: string
  to: string
  value: number
  /**
   * true のとき線をグレー表示（スライダーしきい値より優先）。
   * false のとき常に通常色。未指定時は表示最小値しきい値で判定。
   */
  muted?: boolean
}

export const NODE_COUNT_MIN = 2
/** Cytoscape 試し表示用の上限 */
export const NODE_COUNT_MAX = 30

/** 先頭8件は従来どおり。9件目以降は試し用の連番カテゴリ */
const NODE_POOL_BASE: CytoscapeNetworkNode[] = [
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

const NODE_POOL_EXTRA: CytoscapeNetworkNode[] = Array.from(
  { length: NODE_COUNT_MAX - NODE_POOL_BASE.length },
  (_, i) => {
    const n = i + 9
    return {
      id: `cat-${n}`,
      label: `カテゴリ${n}`,
      before: 100 + n * 17,
      after: 90 + n * 19,
      external: (n % 3 === 0 ? 1 : -1) * (10 + n * 3),
    }
  },
)

const NODE_POOL: CytoscapeNetworkNode[] = [
  ...NODE_POOL_BASE,
  ...NODE_POOL_EXTRA,
]

/** 候補エッジ（両端が選ばれたノードに含まれるものだけ使用） */
const EDGE_POOL_BASE: CytoscapeNetworkEdge[] = [
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

/**
 * 追加ノード向けエッジ。件数を大きくばらつかせる（極少〜極多）。
 * 出次数もノードごとに変え、すべて同じ太さ・同じ本数にならないようにする。
 */
const EDGE_POOL_EXTRA: CytoscapeNetworkEdge[] = (() => {
  const edges: CytoscapeNetworkEdge[] = []
  const ids = NODE_POOL.map((n) => n.id)
  const seen = new Set<string>()

  // 少ないもの〜多いもの。既定しきい値(50)前後も混ぜて太さ差が分かるようにする。
  const VALUE_TIERS = [8, 22, 45, 62, 88, 130, 210, 380, 640, 920, 1180]

  const pushEdge = (from: string, to: string, value: number) => {
    if (from === to) return
    const key = `${from}->${to}`
    if (seen.has(key)) return
    seen.add(key)
    edges.push({ from, to, value })
  }

  NODE_POOL_EXTRA.forEach((node, i) => {
    const fromIndex = ids.indexOf(node.id)
    const outDegree = 1 + (i % 3) // 1 / 2 / 3 を循環

    for (let k = 0; k < outDegree; k++) {
      const toIndex = (fromIndex + 2 + k * 5) % ids.length
      const value = VALUE_TIERS[(i * 3 + k * 4) % VALUE_TIERS.length]
      pushEdge(node.id, ids[toIndex], value)
    }

    // 一部だけ「その他」系との太い／細い接続を混ぜる
    if (i % 2 === 0) {
      pushEdge(
        'other',
        node.id,
        VALUE_TIERS[(i + 7) % VALUE_TIERS.length],
      )
    }
    if (i % 3 === 0) {
      pushEdge(
        node.id,
        'other-unselected',
        VALUE_TIERS[(i + 2) % VALUE_TIERS.length],
      )
    }
  })

  return edges
})()

const EDGE_POOL: CytoscapeNetworkEdge[] = [
  ...EDGE_POOL_BASE,
  ...EDGE_POOL_EXTRA,
]

/** しきい値未満（または muted 指定）ならグレー表示対象 */
export function isGrayEdge(
  edge: CytoscapeNetworkEdge,
  edgeMinAbs: number,
): boolean {
  if (edge.muted === true) return true
  if (edge.muted === false) return false
  return Math.abs(edge.value) < edgeMinAbs
}

export function buildCytoscapeNetwork(count: number): {
  nodes: CytoscapeNetworkNode[]
  edges: CytoscapeNetworkEdge[]
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
