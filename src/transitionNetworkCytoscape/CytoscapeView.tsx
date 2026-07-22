import cytoscape, { type Core } from 'cytoscape'
import { useEffect, useMemo, useRef, useState } from 'react'
import { buildCytoscapeNetwork } from './cytoscapeData'
import { CytoscapeFrame } from './CytoscapeFrame'
import {
  EDGE_MIN_DEFAULT,
  edgeTooltipContent,
  ellipsePositions,
  filterCytoscapeEdges,
  formatInt,
  nodeLabelLines,
  nodeTooltipContent,
} from './cytoscapeLayout'
import './cytoscape.css'

export type CytoscapeGraphHandle = {
  downloadPng: () => void
}

type CytoscapeViewProps = {
  onReady?: (handle: CytoscapeGraphHandle) => void
}

type TooltipState = {
  xPct: number
  yPct: number
  title: string
  lines: string[]
}

export function CytoscapeView({ onReady }: CytoscapeViewProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)
  const [nodeCount, setNodeCount] = useState(6)
  const [edgeMinAbs, setEdgeMinAbs] = useState(EDGE_MIN_DEFAULT)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const setTooltipRef = useRef(setTooltip)
  setTooltipRef.current = setTooltip

  const network = useMemo(
    () => buildCytoscapeNetwork(nodeCount),
    [nodeCount],
  )
  const visibleEdges = useMemo(
    () => filterCytoscapeEdges(network.edges, edgeMinAbs),
    [network.edges, edgeMinAbs],
  )
  const nodeById = useMemo(
    () => new Map(network.nodes.map((node) => [node.id, node])),
    [network.nodes],
  )

  useEffect(() => {
    if (!hostRef.current) return

    const positions = ellipsePositions(network.nodes.length)
    const elements: cytoscape.ElementDefinition[] = [
      ...network.nodes.map((node, index) => ({
        group: 'nodes' as const,
        data: {
          id: node.id,
          label: nodeLabelLines(node),
          name: node.label,
          before: node.before,
          after: node.after,
          external: node.external,
        },
        position: positions[index],
      })),
      ...visibleEdges.map((edge) => {
        const fromLabel = nodeById.get(edge.from)?.label ?? edge.from
        const toLabel = nodeById.get(edge.to)?.label ?? edge.to
        return {
          group: 'edges' as const,
          data: {
            id: `${edge.from}->${edge.to}`,
            source: edge.from,
            target: edge.to,
            label: formatInt(edge.value),
            value: edge.value,
            fromLabel,
            toLabel,
          },
        }
      }),
    ]

    if (!cyRef.current) {
      const cy = cytoscape({
        container: hostRef.current,
        elements,
        layout: { name: 'preset' },
        style: [
          {
            selector: 'node',
            style: {
              shape: 'ellipse',
              width: 168,
              height: 64,
              'background-color': '#3d7fa8',
              'border-width': 1,
              'border-color': '#9fd0ef',
              label: 'data(label)',
              color: '#ffffff',
              'text-wrap': 'wrap',
              'text-valign': 'center',
              'text-halign': 'center',
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
              width: (ele: cytoscape.EdgeSingular) =>
                Math.min(4, 1.2 + Math.abs(Number(ele.data('value'))) / 400),
              'line-color': '#5b9fd4',
              'target-arrow-color': '#5b9fd4',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
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
              width: (ele: cytoscape.EdgeSingular) =>
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
        ],
        userZoomingEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: false,
      })
      cyRef.current = cy
      cy.fit(undefined, 40)

      cy.on('mouseover', 'node', (evt) => {
        const ele = evt.target
        const container = cy.container()
        if (!container) return
        ele.addClass('hover')
        const pos = ele.renderedPosition()
        const tip = nodeTooltipContent({
          id: String(ele.id()),
          label: String(ele.data('name') ?? ''),
          before: Number(ele.data('before') ?? 0),
          after: Number(ele.data('after') ?? 0),
          external: Number(ele.data('external') ?? 0),
        })
        setTooltipRef.current({
          xPct: (pos.x / container.clientWidth) * 100,
          yPct: (pos.y / container.clientHeight) * 100,
          title: tip.title,
          lines: tip.lines,
        })
      })
      cy.on('mouseout', 'node', (evt) => {
        evt.target.removeClass('hover')
        setTooltipRef.current(null)
      })
      cy.on('mouseover', 'edge', (evt) => {
        const ele = evt.target
        const container = cy.container()
        if (!container) return
        ele.addClass('hover')
        const sourcePos = ele.source().renderedPosition()
        const targetPos = ele.target().renderedPosition()
        const tip = edgeTooltipContent(
          String(ele.data('fromLabel') ?? ''),
          String(ele.data('toLabel') ?? ''),
          Number(ele.data('value') ?? 0),
        )
        setTooltipRef.current({
          xPct: ((sourcePos.x + targetPos.x) / 2 / container.clientWidth) * 100,
          yPct: ((sourcePos.y + targetPos.y) / 2 / container.clientHeight) * 100,
          title: tip.title,
          lines: tip.lines,
        })
      })
      cy.on('mouseout', 'edge', (evt) => {
        evt.target.removeClass('hover')
        setTooltipRef.current(null)
      })

      onReady?.({
        downloadPng: () => {
          const png = cy.png({
            output: 'blob',
            bg: '#1a1f24',
            full: true,
            scale: 2,
          })
          const url = URL.createObjectURL(png as Blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `transition-network-cytoscape-${Date.now()}.png`
          a.click()
          URL.revokeObjectURL(url)
        },
      })
    } else {
      const cy = cyRef.current
      setTooltip(null)
      cy.json({ elements })
      cy.layout({ name: 'preset' }).run()
      cy.fit(undefined, 40)
    }
  }, [network.nodes, visibleEdges, nodeById, onReady])

  useEffect(() => {
    return () => {
      cyRef.current?.destroy()
      cyRef.current = null
    }
  }, [])

  return (
    <CytoscapeFrame
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
      <div className="tn-lib-badge">Cytoscape.js（無料）</div>
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
    </CytoscapeFrame>
  )
}
