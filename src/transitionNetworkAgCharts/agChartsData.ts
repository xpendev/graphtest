/**
 * 遷移ネットワーク用のデータ定義・生成（AG Charts Chord）。
 *
 * 現状は検証用のモック（固定ダミー）です。
 * Chord はカテゴリ間の遷移のみ扱い、圏外流入／流出は含めません。
 * カテゴリ数上限 30（均等 Chord の確認用）。
 */
export type AgChartsNetworkNode = {
  id: string
  label: string
  before: number
  after: number
}

export type AgChartsNetworkEdge = {
  from: string
  to: string
  value: number
}

export const NODE_COUNT_MIN = 2
/** スパイク確認用の上限（均等 Chord） */
export const NODE_COUNT_MAX = 30

/** 先頭8件は従来どおり。9件目以降は試し用の連番カテゴリ */
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

const NODE_POOL_EXTRA: AgChartsNetworkNode[] = Array.from(
  { length: NODE_COUNT_MAX - NODE_POOL_BASE.length },
  (_, i) => {
    const n = i + 9
    return {
      id: `cat-${n}`,
      label: `カテゴリ${n}`,
      before: 100 + n * 17,
      after: 90 + n * 19,
    }
  },
)

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
  const n = nodes.length
  if (n < 2) return edges

  const addEdge = (fromIndex: number, toIndex: number, value: number) => {
    if (fromIndex === toIndex) return
    const from = nodes[fromIndex].id
    const to = nodes[toIndex].id
    const key = `${from}->${to}`
    if (seen.has(key)) return
    seen.add(key)
    edges.push({ from, to, value })
  }

  for (let i = 0; i < n; i++) {
    // 1本 / 2本 / 3本 を順番に割り当て
    const linkCount = (i % 3) + 1
    for (let k = 1; k <= linkCount; k++) {
      // 隣だけでなく少し飛ばした相手にもつなぐ
      const step = k + (i % 2)
      const j = (i + step) % n
      const value = 40 + linkCount * 25 + k * 12 + ((i * 9 + k * 5) % 30)
      addEdge(i, j, value)
    }
  }

  return edges
}

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
