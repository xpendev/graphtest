import type { Diagram } from 'gojs'
import {
  NODE_COUNT_MAX,
  NODE_COUNT_MIN,
  type GoJsNetworkNode,
} from './goJsData'

/** 流入/流出線の表示最小値スライダー初期値 */
export const EDGE_MIN_DEFAULT = 50
/** 流入/流出線の表示最小値スライダー上限 */
export const EDGE_MIN_MAX = 1000

/** 楕円配置の中心 X（Cytoscape / Scratch と同じ） */
const CX = 600
/** 楕円配置の中心 Y */
const CY = 280
/** ノード楕円の高さ（goJsStyles と揃える） */
const NODE_H = 64
/** 圏外矢印の先端をノード上下縁から外へ伸ばす距離 */
const EXTERNAL_TIP_GAP = 56

type DisplaySettings = {
  radiusX: number
  radiusY: number
  zoom: number
}

/** 11件以降（未調整） */
const DISPLAY_FALLBACK: DisplaySettings = {
  radiusX: 900,
  radiusY: 350,
  zoom: 1.0,
}

/**
 * ノード数ごとの配置円と zoom（1〜50 は個別固定、51以降は DISPLAY_FALLBACK）。
 * 調整するのは radiusX / radiusY / zoom のみ。
 */
const DISPLAY_BY_COUNT: Record<number, DisplaySettings> = {
  1: { radiusX: 150, radiusY: 70, zoom: 1.35 },
  2: { radiusX: 150, radiusY: 70, zoom: 1.35 },
  3: { radiusX: 170, radiusY: 77, zoom: 1.35 },
  4: { radiusX: 170, radiusY: 60, zoom: 1.35 },
  5: { radiusX: 200, radiusY: 70, zoom: 1.2 },
  6: { radiusX: 220, radiusY: 85, zoom: 1.0 },
  7: { radiusX: 250, radiusY: 100, zoom: 1.0 },
  8: { radiusX: 270, radiusY: 130, zoom: 1.0 },
  9: { radiusX: 300, radiusY: 150, zoom: 1.0 },
  10: { radiusX: 310, radiusY: 150, zoom: 1.0 },
  11: { radiusX: 330, radiusY: 160, zoom: 1.0 },
  12: { radiusX: 350, radiusY: 180, zoom: 1.0 },
  13: { radiusX: 380, radiusY: 200, zoom: 1.0 },
  14: { radiusX: 400, radiusY: 220, zoom: 1.0 },
  15: { radiusX: 450, radiusY: 240, zoom: 1.0 },
  16: { radiusX: 500, radiusY: 260, zoom: 1.0 },
  17: { radiusX: 550, radiusY: 280, zoom: 1.0 },
  18: { radiusX: 600, radiusY: 300, zoom: 1.0 },
  19: { radiusX: 630, radiusY: 330, zoom: 1.0 },
  20: { radiusX: 650, radiusY: 350, zoom: 1.0 },
  21: { radiusX: 680, radiusY: 350, zoom: 1.0 },
  22: { radiusX: 710, radiusY: 350, zoom: 1.0 },
  23: { radiusX: 730, radiusY: 350, zoom: 1.0 },
  24: { radiusX: 750, radiusY: 350, zoom: 1.0 },
  25: { radiusX: 780, radiusY: 350, zoom: 1.0 },
  26: { radiusX: 810, radiusY: 350, zoom: 1.0 },
  27: { radiusX: 830, radiusY: 350, zoom: 1.0 },
  28: { radiusX: 850, radiusY: 350, zoom: 1.0 },
  29: { radiusX: 870, radiusY: 350, zoom: 1.0 },
  30: { radiusX: 900, radiusY: 350, zoom: 1.0 },
  31: { radiusX: 930, radiusY: 400, zoom: 1.0 },
  32: { radiusX: 960, radiusY: 450, zoom: 1.0 },
  33: { radiusX: 990, radiusY: 450, zoom: 1.0 },
  34: { radiusX: 1020, radiusY: 450, zoom: 1.0 },
  35: { radiusX: 1050, radiusY: 450, zoom: 1.0 },
  36: { radiusX: 1080, radiusY: 500, zoom: 1.0 },
  37: { radiusX: 1110, radiusY: 500, zoom: 1.0 },
  38: { radiusX: 1140, radiusY: 500, zoom: 1.0 },
  39: { radiusX: 1170, radiusY: 500, zoom: 1.0 },
  40: { radiusX: 1200, radiusY: 500, zoom: 1.0 },
  41: { radiusX: 1230, radiusY: 550, zoom: 1.0 },
  42: { radiusX: 1260, radiusY: 550, zoom: 1.0 },
  43: { radiusX: 1290, radiusY: 550, zoom: 1.0 },
  44: { radiusX: 1320, radiusY: 550, zoom: 1.0 },
  45: { radiusX: 1350, radiusY: 550, zoom: 1.0 },
  46: { radiusX: 1380, radiusY: 600, zoom: 1.0 },
  47: { radiusX: 1410, radiusY: 600, zoom: 1.0 },
  48: { radiusX: 1440, radiusY: 600, zoom: 1.0 },
  49: { radiusX: 1470, radiusY: 600, zoom: 1.0 },
  50: { radiusX: 1500, radiusY: 600, zoom: 1.0 },
}

function clampNodeCount(count: number): number {
  return Math.min(
    NODE_COUNT_MAX,
    Math.max(NODE_COUNT_MIN, Math.floor(count)),
  )
}

function displayForCount(count: number): DisplaySettings {
  const n = clampNodeCount(count)
  return DISPLAY_BY_COUNT[n] ?? DISPLAY_FALLBACK
}

/** ノード数に応じた配置楕円（軌道）の半径 */
export function layoutOrbitForCount(count: number): {
  radiusX: number
  radiusY: number
} {
  const { radiusX, radiusY } = displayForCount(count)
  return { radiusX, radiusY }
}

/** 画面初期表示・ノード数変更時の viewport を整える */
export function applyInitialViewport(
  diagram: Diagram,
  nodeCount: number,
): void {
  const { zoom } = displayForCount(nodeCount)
  diagram.commandHandler.zoomToFit()
  diagram.scale *= zoom
  diagram.centerRect(diagram.documentBounds)
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

/**
 * ノードを楕円状に等間隔配置した座標一覧を返す。
 * 上（12時）から時計回り。描画はしない。
 */
export function ellipsePositions(count: number): { x: number; y: number }[] {
  const { radiusX, radiusY } = layoutOrbitForCount(count)
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

    const x = CX + radiusX * Math.cos(angle)
    const y = CY + radiusY * Math.sin(angle)
    return { x, y }
  })
}

type GhostModel = { key: string; category: string; loc: string }
type ExternalLinkModel = {
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
  ghosts: GhostModel[]
  links: ExternalLinkModel[]
} {
  const ghosts: GhostModel[] = []
  const links: ExternalLinkModel[] = []

  nodes.forEach((node, index) => {
    if (node.external === 0) return

    const center = positions[index]
    const outward = center.y < CY ? -1 : 1
    const tip = {
      x: center.x,
      y: center.y + outward * (NODE_H / 2 + EXTERNAL_TIP_GAP),
    }
    const ghostId = `ext-ghost-${node.id}`
    const isInflow = node.external > 0
    const isMuted = Math.abs(node.external) < edgeMinAbs

    ghosts.push({
      key: ghostId,
      category: 'ghost',
      loc: `${tip.x} ${tip.y}`,
    })
    links.push({
      key: `ext-${node.id}`,
      category: 'external',
      from: isInflow ? ghostId : node.id,
      to: isInflow ? node.id : ghostId,
      label: formatInt(node.external),
      value: node.external,
      fromLabel: isInflow ? '圏外' : node.label,
      toLabel: isInflow ? node.label : '圏外',
      kind: 'external',
      muted: isMuted,
    })
  })

  return { ghosts, links }
}

/** ノード内に表示する複数行ラベルを組み立てる */
export function nodeLabelLines(node: GoJsNetworkNode): string {
  const { delta, pct } = formatDelta(node.before, node.after)
  return [
    node.label,
    `${formatInt(node.before)} → ${formatInt(node.after)}`,
    `${delta} ${pct}`,
  ].join('\n')
}

/** ノードホバー用ツールチップの文言を返す */
export function nodeTooltipContent(node: GoJsNetworkNode): {
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
