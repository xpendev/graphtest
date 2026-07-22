import go from 'gojs'

const $ = go.GraphObject.make

/** PNG 出力・キャンバス背景色 */
export const GOJS_DIAGRAM_BG = '#1a1f24'

/** ノード塗り（通常） */
export const NODE_FILL = '#3d7fa8'
/** ノード枠線（通常） */
export const NODE_STROKE = '#9fd0ef'
/** ノード塗り（ホバー） */
export const NODE_FILL_HOVER = '#4f96bd'
/** ノード枠線（ホバー） */
export const NODE_STROKE_HOVER = '#c5e6f8'
/** ノード内テキスト色 */
export const NODE_TEXT = '#ffffff'

/** リンク線・矢印（通常） */
export const LINK_STROKE = '#5b9fd4'
/** リンク線（ホバー） */
export const LINK_STROKE_HOVER = '#9fd0ef'
/** リンクラベル色 */
export const LINK_LABEL = '#e8eef3'

/** ノード楕円の幅 */
export const NODE_WIDTH = 168
/** ノード楕円の高さ */
export const NODE_HEIGHT = 64

type GraphObjectHandlers = {
  mouseEnter: (e: go.InputEvent, obj: go.GraphObject) => void
  mouseLeave: (e: go.InputEvent, obj: go.GraphObject) => void
}

/** ノードテンプレート（見た目＋渡されたホバーハンドラ）を組み立てる */
export function buildNodeTemplate(handlers: GraphObjectHandlers): go.Node {
  return $(
    go.Node,
    'Auto',
    {
      locationSpot: go.Spot.Center,
      selectable: true,
      mouseEnter: handlers.mouseEnter,
      mouseLeave: handlers.mouseLeave,
    },
    new go.Binding('location', 'loc', go.Point.parse),
    $(go.Shape, 'Ellipse', {
      name: 'SHAPE',
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      fill: NODE_FILL,
      stroke: NODE_STROKE,
      strokeWidth: 1,
    }),
    $(
      go.TextBlock,
      {
        stroke: NODE_TEXT,
        font: '11px sans-serif',
        textAlign: 'center',
        margin: 4,
      },
      new go.Binding('text', 'label'),
    ),
  )
}

/** リンクテンプレート（見た目＋渡されたホバーハンドラ）を組み立てる */
export function buildLinkTemplate(handlers: GraphObjectHandlers): go.Link {
  return $(
    go.Link,
    {
      routing: go.Routing.Normal,
      curve: go.Curve.Bezier,
      selectable: false,
      mouseEnter: handlers.mouseEnter,
      mouseLeave: handlers.mouseLeave,
    },
    $(
      go.Shape,
      { name: 'PATH', stroke: LINK_STROKE, strokeWidth: 1.5 },
      new go.Binding(
        'strokeWidth',
        'value',
        (value: number) => Math.min(4, 1.2 + Math.abs(value) / 400),
      ),
    ),
    $(go.Shape, {
      toArrow: 'Standard',
      fill: LINK_STROKE,
      stroke: null,
      scale: 1.2,
    }),
    $(
      go.TextBlock,
      {
        stroke: LINK_LABEL,
        font: '11px sans-serif',
        segmentOffset: new go.Point(0, -10),
      },
      new go.Binding('text', 'label'),
    ),
  )
}
