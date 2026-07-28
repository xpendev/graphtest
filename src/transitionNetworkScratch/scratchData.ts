/**
 * 遷移ネットワーク用のデータ定義・生成。
 *
 * 現状は検証用のモック（固定ダミー）です。
 * 本番では DB / API からカテゴリ・前期当期値・遷移件数などを取得し、
 * 同じ型（ScratchNode / ScratchEdge）に変換して渡す想定です。
 *
 * ノード数上限 30（Cytoscape と同じ試し表示用）。
 */
/** カテゴリ1件＝グラフ上の楕円ノード1個 */
export type ScratchNode = {
  /** ノードの一意キー（エッジの from / to から参照される） */
  id: string
  /** 楕円内に表示するカテゴリ名 */
  label: string
  /** 前期の金額・件数 */
  before: number
  /** 当期の金額・件数 */
  after: number
  /** 圏外との純増減（正=流入、負=流出） */
  external: number
}

/** カテゴリ間の遷移1本＝グラフ上の有向矢印1本 */
export type ScratchEdge = {
  /** 遷移元ノードの id */
  from: string
  /** 遷移先ノードの id */
  to: string
  /** 遷移件数（矢印ラベル・線の太さの元になる） */
  value: number
  /**
   * true のとき線をグレー表示（スライダーしきい値より優先）。
   * false のとき常に通常色。未指定時は表示最小値しきい値で判定。
   */
  muted?: boolean
}

/** ノード数スライダーの下限 */
export const NODE_COUNT_MIN = 2
/** 試し表示用の上限（Cytoscape / GoJS と同じ） */
export const NODE_COUNT_MAX = 30

/** 元画面を再現する固定8カテゴリ（9件目以降は NODE_POOL_EXTRA） */
const NODE_POOL_BASE: ScratchNode[] = [
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
    before: 0,
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

/** 上限 30 まで埋める試し用の連番カテゴリ（カテゴリ9〜30） */
const NODE_POOL_EXTRA: ScratchNode[] = Array.from(
  { length: NODE_COUNT_MAX - NODE_POOL_BASE.length },
  (_, i) => {
    /** 表示用の連番（カテゴリ9 始まり） */
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

/** 全ノード候補の倉庫。buildScratchNetwork が先頭から切り出す */
const NODE_POOL: ScratchNode[] = [...NODE_POOL_BASE, ...NODE_POOL_EXTRA]

/** 固定8カテゴリ間の遷移（元画面と同じ組み合わせ） */
const EDGE_POOL_BASE: ScratchEdge[] = [
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

/** 連番カテゴリ向けの遷移。「その他」との往復＋隣のカテゴリからの流入 */
const EDGE_POOL_EXTRA: ScratchEdge[] = NODE_POOL_EXTRA.flatMap((node, i) => {
  /** このカテゴリを起点・終点とする遷移 */
  const edges: ScratchEdge[] = [
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
})

/** 全矢印候補の倉庫。表示中ノード同士のものだけ buildScratchNetwork が残す */
const EDGE_POOL: ScratchEdge[] = [...EDGE_POOL_BASE, ...EDGE_POOL_EXTRA]

/** しきい値未満（または muted 指定）ならグレー表示対象 */
export function isGrayEdge(edge: ScratchEdge, edgeMinAbs: number): boolean {
  if (edge.muted === true) return true
  if (edge.muted === false) return false
  return Math.abs(edge.value) < edgeMinAbs
}

/**
 * 倉庫（NODE_POOL / EDGE_POOL）から、今回使う分だけ取り出す。
 * 描画はしない。返すのは材料の { nodes, edges } のみ。
 *
 * 手順:
 * 1. count を 2〜30 に丸めて n にする
 * 2. NODE_POOL の先頭 n 件を nodes にする
 * 3. EDGE_POOL から「from も to も nodes にいる」矢印だけ残す
 */
export function buildScratchNetwork(count: number): {
  nodes: ScratchNode[]
  edges: ScratchEdge[]
} {
  // 例: 1→2、4→4、100→30
  const n = Math.min(
    NODE_COUNT_MAX,
    Math.max(NODE_COUNT_MIN, Math.floor(count)),
  )
  // 倉庫から先頭 n 個だけ会議室に入れる
  const nodes = NODE_POOL.slice(0, n)
  // 会議室にいる人の id 名簿
  const ids = new Set(nodes.map((node) => node.id))
  // 名簿同士の矢印だけ残す（片方が会議室外なら捨てる）
  const edges = EDGE_POOL.filter(
    (edge) => ids.has(edge.from) && ids.has(edge.to),
  )
  return { nodes, edges }
}
