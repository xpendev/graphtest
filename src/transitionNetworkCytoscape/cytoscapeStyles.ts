import type { EdgeSingular } from 'cytoscape'

/** Cytoscape グラフ本体の見た目定義（ノード／エッジ） */
export const cytoscapeStyles = [
  {
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
    selector: 'node.hover',
    style: {
      'border-width': 2,
      'border-color': '#c5e6f8',
      'background-color': '#4f96bd',
    },
  },
  {
    selector: 'edge',
    style: {
      width: (ele: EdgeSingular) =>
        Math.min(4, 1.2 + Math.abs(Number(ele.data('value'))) / 400),
      'line-color': '#5b9fd4',
      'target-arrow-color': '#5b9fd4',
      'target-arrow-shape': 'triangle' as const,
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
      width: (ele: EdgeSingular) =>
        Math.min(5, 2.2 + Math.abs(Number(ele.data('value'))) / 400),
    },
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': 2,
      'border-color': '#c5e6f8',
    },
  },
]
