import type { EdgeSingular, NodeSingular } from 'cytoscape'

/** 件数に比例して線幅を求める（極少〜極多でおおよそ 1.2〜12） */
function edgeWidthFromValue(value: number, hoverBoost = 0): number {
  const magnitude = Math.abs(value)
  const base = (hoverBoost > 0 ? 1.6 : 1.2) + magnitude / 110
  const cap = hoverBoost > 0 ? 14 : 12
  return Math.min(cap, base)
}

/** Cytoscape グラフ本体の見た目定義（ノード／エッジ） */
export const cytoscapeStyles = [
  {
    // --- 通常ノード ---
    selector: 'node',
    style: {
      shape: 'ellipse' as const,
      width: 168,
      height: 64,
      'background-color': '#3d7fa8',
      'border-width': 1,
      'border-color': '#9fd0ef',
      label: 'data(label)',
      color: '#ffffff',
      'text-wrap': 'wrap' as const,
      'text-valign': 'center' as const,
      'text-halign': 'center' as const,
      'font-size': '11px',
      'text-max-width': '150px',
    },
  },
  {
    // 圏外矢印の外側端点（透明。エッジの接続先としてだけ使う）
    selector: 'node.external-arrow',
    style: {
      shape: 'polygon' as const,
      'shape-polygon-points': 'data(poly)',
      width: 48,
      height: 34,
      'background-color': '#7ec8f0',
      'border-width': 0,
      label: 'data(label)',
      color: '#e7f4ff',
      'font-size': '11px',
      'text-wrap': 'none' as const,
      'text-max-width': '80px',
      'text-halign': 'center' as const,
      'text-valign': (ele: NodeSingular) =>
        ele.data('side') === 'up' ? 'top' : 'bottom',
      'text-margin-y': (ele: NodeSingular) =>
        ele.data('side') === 'up' ? -10 : 10,
    },
  },
  {
    selector: 'node.external-arrow.muted',
    style: {
      'background-color': '#6a737a',
      color: '#9aa3ab',
      opacity: 0.55,
    },
  },
  {
    selector: 'node.external-arrow.hover',
    style: {
      'background-color': '#9fd0ef',
      'border-width': 0,
    },
  },
  {
    selector: 'node.external-arrow.flow-in',
    style: {
      'background-color': '#8ff5ab',
      opacity: 0.95,
    },
  },
  {
    selector: 'node.external-arrow.flow-out',
    style: {
      'background-color': '#ff8f8f',
      opacity: 0.95,
    },
  },
  {
    selector: 'node.external-arrow.faded',
    style: {
      'border-width': 0,
      'background-color': '#7ec8f0',
      opacity: 0.18,
    },
  },
  {
    selector: 'node.hover',
    style: {
      'border-width': 2,
      'border-color': '#c5e6f8',
      'background-color': '#4f96bd',
    },
  },
  {
    // クリック選択ノード
    selector: 'node.focus',
    style: {
      'border-width': 6,
      'border-color': '#f1d16f',
      'background-color': '#4f96bd',
    },
  },
  {
    // 選択ノードと関連するノード
    selector: 'node.related',
    style: {
      'border-width': 2,
      'border-color': '#8fd48d',
      'background-color': '#3f8d52',
    },
  },
  {
    // 当期が前期より増加したノード（クリック時）
    selector: 'node.up',
    style: {
      'border-width': 2,
      'border-color': '#9ad89a',
      'background-color': '#3f8d52',
    },
  },
  {
    // 当期が前期以下のノード（クリック時）
    selector: 'node.down',
    style: {
      'border-width': 2,
      'border-color': '#e6a3a3',
      'background-color': '#b85656',
    },
  },
  {
    // 非関連ノードは弱く表示
    selector: 'node.faded',
    style: {
      'border-width': 6,
      'border-color': '#000000',
      'background-color': '#6f7782',
      opacity: 1,
    },
  },
  {
    // --- 通常の遷移線 ---
    selector: 'edge',
    style: {
      width: (ele: EdgeSingular) =>
        edgeWidthFromValue(Number(ele.data('value'))),
      'line-color': '#5b9fd4',
      'target-arrow-color': '#5b9fd4',
      'target-arrow-shape': 'triangle' as const,
      'arrow-scale': 1.55,
      'curve-style': 'bezier' as const,
      label: 'data(label)',
      color: '#e8eef3',
      'font-size': '11px',
      'text-background-color': '#1a1f24',
      'text-background-opacity': 0.7,
      'text-background-padding': '2px',
    },
  },
  {
    selector: 'edge.hover',
    style: {
      'line-color': '#9fd0ef',
      'target-arrow-color': '#9fd0ef',
      'arrow-scale': 1.7,
      width: (ele: EdgeSingular) =>
        edgeWidthFromValue(Number(ele.data('value')), 1),
    },
  },
  {
    // クリックノードへ流入する線
    selector: 'edge.flow-in',
    style: {
      'line-color': '#8ff5ab',
      'target-arrow-color': '#8ff5ab',
      'arrow-scale': 1.7,
      'line-style': 'dashed',
      'line-dash-pattern': [10, 7],
      'line-dash-offset': (ele: EdgeSingular) =>
        Number(ele.data('flowPhase') ?? 0),
      opacity: 0.95,
    },
  },
  {
    // クリックノードから流出する線
    selector: 'edge.flow-out',
    style: {
      'line-color': '#ff8f8f',
      'target-arrow-color': '#ff8f8f',
      'arrow-scale': 1.7,
      'line-style': 'dashed',
      'line-dash-pattern': [10, 7],
      'line-dash-offset': (ele: EdgeSingular) =>
        Number(ele.data('flowPhase') ?? 0),
      opacity: 0.95,
    },
  },
  {
    // 非関連エッジは弱く表示
    selector: 'edge.faded',
    style: {
      opacity: 0.18,
    },
  },
  {
    // 表示最小値未満の遷移線（非表示ではなくグレー）
    selector: 'edge.muted',
    style: {
      'line-color': '#6a737a',
      'target-arrow-color': '#6a737a',
      color: '#9aa3ab',
      opacity: 0.55,
    },
  },
  {
    selector: 'edge.muted.hover',
    style: {
      'line-color': '#8a939b',
      'target-arrow-color': '#8a939b',
      opacity: 0.75,
    },
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': 2,
      'border-color': '#c5e6f8',
    },
  },
  {
    // up/down/related と同時付与されても選択枠を優先する
    selector: 'node.focus.up, node.focus.down, node.focus.related',
    style: {
      'border-width': 6,
      'border-color': '#f1d16f',
    },
  },
]
