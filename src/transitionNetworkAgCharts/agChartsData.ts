/**
 * 遷移ネットワーク用のデータ定義・生成（AG Charts Chord）。
 *
 * 現状は検証用のモック（固定ダミー）です。
 * Chord はカテゴリ間の遷移のみ扱い、圏外流入／流出は含めません。
 * カテゴリ数上限 30（均等 Chord の確認用）。
 */

/** カテゴリ1件（Chord のノード）。before/after は購入量 */
export type AgChartsNetworkNode = {
  id: string
  label: string
  /** 前期の購入量（画面座標や相対値ではない） */
  before: number
  /** 当期の購入量 */
  after: number
}

/** カテゴリ間の遷移1本 */
export type AgChartsNetworkEdge = {
  from: string
  to: string
  value: number
}

/** ノード数の下限 */
export const NODE_COUNT_MIN = 2
/** スパイク確認用の上限（均等 Chord） */
export const NODE_COUNT_MAX = 30

/** 元画面を再現する固定8カテゴリ */
const NODE_POOL_BASE: AgChartsNetworkNode[] = [
  {
    id: 'other',
    label: 'その他',
    before: 150712,
    after: 153077,
  },
  {
    id: 'other-unselected',
    label: 'その他(選択以外)',
    before: 109536,
    after: 105379,
  },
  {
    id: 'cat-a',
    label: 'カテゴリA',
    before: 568,
    after: 660,
  },
  {
    id: 'cat-b',
    label: 'カテゴリB',
    before: 734,
    after: 523,
  },
  {
    id: 'cat-c',
    label: 'カテゴリC',
    before: 30,
    after: 26,
  },
  {
    id: 'cat-d',
    label: 'カテゴリD',
    before: 1,
    after: 0,
  },
  {
    id: 'cat-e',
    label: 'カテゴリE',
    before: 420,
    after: 510,
  },
  {
    id: 'cat-f',
    label: 'カテゴリF',
    before: 880,
    after: 760,
  },
]

/** 上限まで埋める試し用の連番カテゴリ */
const NODE_POOL_EXTRA: AgChartsNetworkNode[] = Array.from(
  { length: NODE_COUNT_MAX - NODE_POOL_BASE.length },
  (_, i) => {
    const n = i + 9
    const dummyBefore = 100 + n * 17
    const dummyAfter = 90 + n * 19
    return {
      id: `cat-${n}`,
      label: `カテゴリ${n}`,
      before: dummyBefore,
      after: dummyAfter,
    }
  },
)

/** 全ノード候補の倉庫 */
const NODE_POOL: AgChartsNetworkNode[] = [
  ...NODE_POOL_BASE,
  ...NODE_POOL_EXTRA,
]

/**
 * 疎な遷移を作る。各カテゴリの出次数は 1 / 2 / 3 を循環。
 * 全結合にはしない（つながりが多い／少ないの差が見えるようにする）。
 */
function buildSparseEdges(nodes: AgChartsNetworkNode[]): AgChartsNetworkEdge[] {
  const edges: AgChartsNetworkEdge[] = []
  const seen = new Set<string>()
  const nodeCount = nodes.length
  if (nodeCount < 2) return edges

  const addEdge = (fromIndex: number, toIndex: number, value: number) => {
    if (fromIndex === toIndex) return
    const from = nodes[fromIndex].id
    const to = nodes[toIndex].id
    const key = `${from}->${to}`
    if (seen.has(key)) return
    seen.add(key)
    edges.push({ from, to, value })
  }

  for (let i = 0; i < nodeCount; i++) {
    // 出次数: 1本 / 2本 / 3本 を順番に割り当て
    const outDegree = (i % 3) + 1
    for (let k = 1; k <= outDegree; k++) {
      // 隣だけでなく少し飛ばした相手にもつなぐ
      const step = k + (i % 2)
      const toIndex = (i + step) % nodeCount
      const value = 40 + outDegree * 25 + k * 12 + ((i * 9 + k * 5) % 30)
      addEdge(i, toIndex, value)
    }
  }

  return edges
}

/**
 * 倉庫から今回使う分だけ取り出す（描画はしない）。
 * Chord 用なのでエッジは表示中ノードだけで疎に再生成する。
 */
export function buildAgChartsNetwork(count: number): {
  nodes: AgChartsNetworkNode[]
  edges: AgChartsNetworkEdge[]
} {
  const n = Math.min(
    NODE_COUNT_MAX,
    Math.max(NODE_COUNT_MIN, Math.floor(count)),
  )
  const nodes = NODE_POOL.slice(0, n)
  const edges = buildSparseEdges(nodes)
  return { nodes, edges }
}
