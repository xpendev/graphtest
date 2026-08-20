/** スクラッチ SVG の見た目定数（ノード／エッジ／マーカー） */
export const scratchStyles = {
  // --- キャンバス ---
  canvasBg: '#1a1f24',

  // --- 矢じり ---
  arrowMarkerFill: '#5b9fd4',
  arrowExtMarkerFill: '#7eb6de',
  arrowMarkerMutedFill: '#6a737a',
  arrowFlowInFill: '#8ff5ab',
  arrowFlowOutFill: '#ff8f8f',

  // --- ノード ---
  nodeGradient: {
    start: '#6eb0d8',
    end: '#3d7fa8',
  },
  nodeStroke: '#9fd0ef',
  nodeTitleFill: '#fff',
  nodeBodyFill: '#f2f7fb',
  nodeDeltaFill: '#d4e8f6',

  // クリック強調（増加=緑／それ以外=赤）
  nodeUpFill: '#3f8d52',
  nodeUpStroke: '#9ad89a',
  nodeDownFill: '#b85656',
  nodeDownStroke: '#e6a3a3',
  nodeFocusStroke: '#f1d16f',
  nodeFadedFill: '#6f7782',
  nodeFadedStroke: '#000000',

  // --- 遷移線（通常／グレー） ---
  edgeStroke: '#5b9fd4',
  edgeStrokeMuted: '#6a737a',
  edgeLabelFill: '#e8eef3',
  edgeLabelFillMuted: '#9aa3ab',
  edgeFlowIn: '#8ff5ab',
  edgeFlowOut: '#ff8f8f',

  // --- 圏外矢印 ---
  externalStroke: '#7eb6de',
  externalStrokeMuted: '#6a737a',
  externalLabelFill: '#d7e6f2',
  externalLabelFillMuted: '#9aa3ab',
} as const
