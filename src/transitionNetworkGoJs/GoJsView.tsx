import go from 'gojs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { GoJsFrame } from './GoJsFrame'
import { buildGoJsNetwork } from './goJsData'
import {
  EDGE_MIN_DEFAULT,
  edgeTooltipContent,
  ellipsePositions,
  filterGoJsEdges,
  formatInt,
  nodeLabelLines,
  nodeTooltipContent,
} from './goJsLayout'
import './goJs.css'

const $ = go.GraphObject.make

export type GoJsGraphHandle = {
  downloadPng: () => void
}

type GoJsViewProps = {
  onReady?: (handle: GoJsGraphHandle) => void
}

type TooltipState = {
  xPct: number
  yPct: number
  title: string
  lines: string[]
}

type NodeModel = {
  key: string
  label: string
  name: string
  before: number
  after: number
  external: number
  loc: string
}

type LinkModel = {
  key: string
  from: string
  to: string
  label: string
  value: number
  fromLabel: string
  toLabel: string
}

export function GoJsView({ onReady }: GoJsViewProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const diagramRef = useRef<go.Diagram | null>(null)
  const [nodeCount, setNodeCount] = useState(6)
  const [edgeMinAbs, setEdgeMinAbs] = useState(EDGE_MIN_DEFAULT)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const setTooltipRef = useRef(setTooltip)
  setTooltipRef.current = setTooltip

  const network = useMemo(() => buildGoJsNetwork(nodeCount), [nodeCount])
  const visibleEdges = useMemo(
    () => filterGoJsEdges(network.edges, edgeMinAbs),
    [network.edges, edgeMinAbs],
  )
  const nodeById = useMemo(
    () => new Map(network.nodes.map((node) => [node.id, node])),
    [network.nodes],
  )

  const modelData = useMemo(() => {
    const positions = ellipsePositions(network.nodes.length)
    return {
      nodes: network.nodes.map(
        (node, index): NodeModel => ({
          key: node.id,
          label: nodeLabelLines(node),
          name: node.label,
          before: node.before,
          after: node.after,
          external: node.external,
          loc: `${positions[index].x} ${positions[index].y}`,
        }),
      ),
      links: visibleEdges.map(
        (edge): LinkModel => ({
          key: `${edge.from}->${edge.to}`,
          from: edge.from,
          to: edge.to,
          label: formatInt(edge.value),
          value: edge.value,
          fromLabel: nodeById.get(edge.from)?.label ?? edge.from,
          toLabel: nodeById.get(edge.to)?.label ?? edge.to,
        }),
      ),
    }
  }, [network.nodes, visibleEdges, nodeById])

  useEffect(() => {
    if (!hostRef.current) return

    const showAtViewPoint = (
      viewPoint: go.Point,
      tip: { title: string; lines: string[] },
    ) => {
      const host = hostRef.current
      if (!host) return
      setTooltipRef.current({
        xPct: (viewPoint.x / host.clientWidth) * 100,
        yPct: (viewPoint.y / host.clientHeight) * 100,
        title: tip.title,
        lines: tip.lines,
      })
    }

    if (!diagramRef.current) {
      const diagram = new go.Diagram(hostRef.current, {
        'animationManager.isEnabled': false,
        allowCopy: false,
        allowDelete: false,
        padding: 40,
        contentAlignment: go.Spot.Center,
      })

      diagram.nodeTemplate = $(
        go.Node,
        'Auto',
        {
          locationSpot: go.Spot.Center,
          selectable: true,
          mouseEnter: (_e, obj) => {
            const node = obj.part as go.Node
            const data = node.data as NodeModel
            const shape = node.findObject('SHAPE') as go.Shape | null
            if (shape) {
              shape.stroke = '#c5e6f8'
              shape.strokeWidth = 2
              shape.fill = '#4f96bd'
            }
            const docPoint = node.getDocumentPoint(go.Spot.Top)
            const viewPoint = diagram.transformDocToView(docPoint)
            showAtViewPoint(
              viewPoint,
              nodeTooltipContent({
                id: data.key,
                label: data.name,
                before: data.before,
                after: data.after,
                external: data.external,
              }),
            )
          },
          mouseLeave: (_e, obj) => {
            const node = obj.part as go.Node
            const shape = node.findObject('SHAPE') as go.Shape | null
            if (shape) {
              shape.stroke = '#9fd0ef'
              shape.strokeWidth = 1
              shape.fill = '#3d7fa8'
            }
            setTooltipRef.current(null)
          },
        },
        new go.Binding('location', 'loc', go.Point.parse),
        $(go.Shape, 'Ellipse', {
          name: 'SHAPE',
          width: 168,
          height: 64,
          fill: '#3d7fa8',
          stroke: '#9fd0ef',
          strokeWidth: 1,
        }),
        $(
          go.TextBlock,
          {
            stroke: '#ffffff',
            font: '11px sans-serif',
            textAlign: 'center',
            margin: 4,
          },
          new go.Binding('text', 'label'),
        ),
      )

      diagram.linkTemplate = $(
        go.Link,
        {
          routing: go.Routing.Normal,
          curve: go.Curve.Bezier,
          selectable: false,
          mouseEnter: (_e, obj) => {
            const link = obj.part as go.Link
            const data = link.data as LinkModel
            const path = link.findObject('PATH') as go.Shape | null
            if (path) path.stroke = '#9fd0ef'
            const fromNode = link.fromNode
            const toNode = link.toNode
            if (!fromNode || !toNode) return
            const a = fromNode.getDocumentPoint(go.Spot.Center)
            const b = toNode.getDocumentPoint(go.Spot.Center)
            const mid = new go.Point((a.x + b.x) / 2, (a.y + b.y) / 2)
            const viewPoint = diagram.transformDocToView(mid)
            showAtViewPoint(
              viewPoint,
              edgeTooltipContent(data.fromLabel, data.toLabel, data.value),
            )
          },
          mouseLeave: (_e, obj) => {
            const link = obj.part as go.Link
            const path = link.findObject('PATH') as go.Shape | null
            if (path) path.stroke = '#5b9fd4'
            setTooltipRef.current(null)
          },
        },
        $(
          go.Shape,
          { name: 'PATH', stroke: '#5b9fd4', strokeWidth: 1.5 },
          new go.Binding(
            'strokeWidth',
            'value',
            (value: number) => Math.min(4, 1.2 + Math.abs(value) / 400),
          ),
        ),
        $(go.Shape, {
          toArrow: 'Standard',
          fill: '#5b9fd4',
          stroke: null,
          scale: 1.2,
        }),
        $(
          go.TextBlock,
          {
            stroke: '#e8eef3',
            font: '11px sans-serif',
            segmentOffset: new go.Point(0, -10),
          },
          new go.Binding('text', 'label'),
        ),
      )

      diagram.model = new go.GraphLinksModel({
        nodeDataArray: modelData.nodes,
        linkDataArray: modelData.links,
      })

      diagramRef.current = diagram
      diagram.commandHandler.zoomToFit()

      onReady?.({
        downloadPng: () => {
          const dataUrl = diagram.makeImageData({
            background: '#1a1f24',
            scale: 2,
            type: 'image/png',
          })
          if (typeof dataUrl !== 'string') {
            throw new Error('画像の生成に失敗しました。')
          }
          const a = document.createElement('a')
          a.href = dataUrl
          a.download = `transition-network-gojs-${Date.now()}.png`
          a.click()
        },
      })
    } else {
      const diagram = diagramRef.current
      setTooltip(null)
      diagram.model = new go.GraphLinksModel({
        nodeDataArray: modelData.nodes,
        linkDataArray: modelData.links,
      })
      diagram.commandHandler.zoomToFit()
    }
  }, [modelData, onReady])

  useEffect(() => {
    return () => {
      diagramRef.current?.div && (diagramRef.current.div = null)
      diagramRef.current = null
    }
  }, [])

  return (
    <GoJsFrame
      edgeMinAbs={edgeMinAbs}
      nodeCount={nodeCount}
      onEdgeMinChange={(value) => {
        setTooltip(null)
        setEdgeMinAbs(value)
      }}
      onNodeCountChange={(value) => {
        setTooltip(null)
        setNodeCount(value)
      }}
    >
      <div className="tn-lib-badge">GoJS（評価版・有償製品）</div>
      <div ref={hostRef} className="tn-lib-canvas-host" />
      {tooltip ? (
        <div
          className="tn-tooltip"
          style={{
            left: `${tooltip.xPct}%`,
            top: `${tooltip.yPct}%`,
          }}
        >
          <div className="tn-tooltip-title">{tooltip.title}</div>
          {tooltip.lines.map((line) => (
            <div key={line} className="tn-tooltip-line">
              {line}
            </div>
          ))}
        </div>
      ) : null}
    </GoJsFrame>
  )
}
