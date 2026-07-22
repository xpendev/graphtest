/** スクラッチ SVG の見た目定数（ノード／エッジ／マーカー） */
export const scratchStyles = {
  canvasBg: '#1a1f24',
  arrowMarkerFill: '#5b9fd4',
  arrowExtMarkerFill: '#7eb6de',
  nodeGradient: {
    start: '#6eb0d8',
    end: '#3d7fa8',
  },
  nodeGradientHover: {
    start: '#8bc4e4',
    end: '#4f96bd',
  },
  nodeStroke: '#9fd0ef',
  nodeStrokeHover: '#c5e6f8',
  edgeStroke: '#5b9fd4',
  edgeStrokeHover: '#9fd0ef',
  externalStroke: '#7eb6de',
  edgeLabelFill: '#e8eef3',
  externalLabelFill: '#d7e6f2',
  nodeTitleFill: '#fff',
  nodeBodyFill: '#f2f7fb',
  nodeDeltaFill: '#d4e8f6',
} as const
