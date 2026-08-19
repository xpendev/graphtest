import go from 'gojs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchGoJsNetwork,
  isGrayEdge,
  type GoJsNetworkEdge,
  type GoJsNetworkNode,
} from './goJsData'
import {
  EDGE_MIN_DEFAULT,
  EDGE_MIN_MAX,
  buildExternalModels,
  edgeTooltipContent,
  ellipsePositions,
  formatInt,
  NODE_SLIDER,
  nodeLabelLines,
  nodeTooltipContent,
} from './goJsHelpers'
import {
  buildExternalLinkTemplate,
  buildGhostNodeTemplate,
  buildLinkTemplate,
  buildNodeTemplate,
  EXTERNAL_LINK_STROKE,
  EXTERNAL_LINK_STROKE_MUTED,
  GOJS_DIAGRAM_BG,
  LINK_STROKE,
  LINK_STROKE_MUTED,
  NODE_FILL,
  NODE_STROKE,
} from './goJsStyles'

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
  category?: string
}

type LinkModel = {
  key: string
  from: string
  to: string
  label: string
  value: number
  fromLabel: string
  toLabel: string
  category?: string
  kind?: string
  muted?: boolean
}

/**
 * GoJS 版ページ。
 * state を持ち、API → Helpers → Diagram モデルをつなぐ司令塔。
 */
export function GoJsPage() {
  const hostRef = useRef<HTMLDivElement>(null)
  const diagramRef = useRef<go.Diagram | null>(null)
  const flowTimerRef = useRef<number | null>(null)
  const focusedNodeKeyRef = useRef<string | null>(null)
  /** グラフに渡すノード数（スライダー確定値） */
  const [nodeCount, setNodeCount] = useState(8)
  /** 流入/流出線をグレーにするしきい値（絶対値） */
  const [edgeMinAbs, setEdgeMinAbs] = useState(EDGE_MIN_DEFAULT)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [network, setNetwork] = useState<{
    nodes: GoJsNetworkNode[]
    edges: GoJsNetworkEdge[]
  } | null>(null)
  // React の setState を GoJS GraphObject コールバックから呼ぶための最新参照。
  // mouseEnter / mouseLeave はテンプレート生成時に一度だけ登録するため、
  // クロージャに古い setTooltip が残らないよう ref 経由にする。
  const setTooltipRef = useRef(setTooltip)
  setTooltipRef.current = setTooltip

  const stopFlowAnimation = () => {
    if (flowTimerRef.current != null) {
      window.clearInterval(flowTimerRef.current)
      flowTimerRef.current = null
    }
  }

  // --- API ---
  useEffect(() => {
    let cancelled = false
    setMessage(null)

    void fetchGoJsNetwork(nodeCount)
      .then((next) => {
        if (cancelled) return
        setNetwork(next)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setNetwork(null)
        setMessage(
          error instanceof Error
            ? error.message
            : '曼荼羅チャートの取得に失敗しました。',
        )
      })

    return () => {
      cancelled = true
    }
  }, [nodeCount])

  const nodeById = useMemo(
    () => new Map((network?.nodes ?? []).map((node) => [node.id, node])),
    [network],
  )

  // --- Helpers（座標・圏外モデル）→ GoJS モデル ---
  const modelData = useMemo(() => {
    if (!network) {
      return { nodes: [] as NodeModel[], links: [] as LinkModel[] }
    }
    const maxEdgeValue =
      network.edges.length > 0
        ? Math.max(...network.edges.map((edge) => edge.value))
        : null
    const positions = ellipsePositions(network.nodes.length)
    const external = buildExternalModels(
      network.nodes,
      positions,
      edgeMinAbs,
    )
    return {
      nodes: [
        ...network.nodes.map(
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
        ...external.ghosts,
      ],
      links: [
        ...network.edges.map(
          (edge): LinkModel => ({
            key: `${edge.from}->${edge.to}`,
            from: edge.from,
            to: edge.to,
            label: edge.value === maxEdgeValue ? formatInt(edge.value) : '',
            value: edge.value,
            fromLabel: nodeById.get(edge.from)?.label ?? edge.from,
            toLabel: nodeById.get(edge.to)?.label ?? edge.to,
            muted: isGrayEdge(edge, edgeMinAbs),
          }),
        ),
        ...external.links,
      ],
    }
  }, [network, nodeById, edgeMinAbs])

  useEffect(() => {
    if (!hostRef.current) return
    // 空モデルで作ると zoomToFit 後のビューが壊れ、後続データでも真っ黒になる
    if (modelData.nodes.length === 0) return

    const resetFocusStyles = (diagram: go.Diagram) => {
      stopFlowAnimation()
      diagram.nodes.each((node) => {
        const data = node.data as NodeModel
        if (data.category === 'ghost') return
        const shape = node.findObject('SHAPE') as go.Shape | null
        if (!shape) return
        shape.fill = NODE_FILL
        shape.stroke = NODE_STROKE
        shape.strokeWidth = 1
      })
      diagram.links.each((link) => {
        const data = link.data as LinkModel
        const path = link.findObject('PATH') as go.Shape | null
        const arrow = link.findObject('ARROW') as go.Shape | null
        const baseStroke =
          data.kind === 'external'
            ? data.muted
              ? EXTERNAL_LINK_STROKE_MUTED
              : EXTERNAL_LINK_STROKE
            : data.muted
              ? LINK_STROKE_MUTED
              : LINK_STROKE
        if (path) {
          path.stroke = baseStroke
          path.opacity = data.muted ? 0.55 : 1
          path.strokeDashArray = null
          path.strokeDashOffset = 0
        }
        if (arrow) {
          arrow.fill = baseStroke
          arrow.opacity = data.muted ? 0.55 : 1
        }
      })
    }

    const applyFlowFocus = (diagram: go.Diagram, focusKey: string) => {
      const focusNode = diagram.findNodeForKey(focusKey)
      if (!focusNode) {
        focusedNodeKeyRef.current = null
        return
      }
      resetFocusStyles(diagram)
      focusedNodeKeyRef.current = focusKey

      const relatedNodeKeys = new Set<string>()
      const incomingLinks: go.Link[] = []
      const outgoingLinks: go.Link[] = []
      const highlightedLinks: go.Link[] = []

      diagram.links.each((link) => {
        const from = String(link.data.from ?? '')
        const to = String(link.data.to ?? '')
        if (to === focusKey) {
          incomingLinks.push(link)
          highlightedLinks.push(link)
          if (!from.startsWith('ext-ghost-')) relatedNodeKeys.add(from)
        } else if (from === focusKey) {
          outgoingLinks.push(link)
          highlightedLinks.push(link)
          if (!to.startsWith('ext-ghost-')) relatedNodeKeys.add(to)
        }
      })

      diagram.nodes.each((node) => {
        const data = node.data as NodeModel
        if (data.category === 'ghost') return
        const key = String(data.key)
        const shape = node.findObject('SHAPE') as go.Shape | null
        if (!shape) return

        if (key === focusKey) {
          shape.fill = data.after > data.before ? '#3f8d52' : '#b85656'
          shape.stroke = '#f1d16f'
          shape.strokeWidth = 6
          return
        }
        if (relatedNodeKeys.has(key)) {
          shape.fill = data.after > data.before ? '#3f8d52' : '#b85656'
          shape.stroke = data.after > data.before ? '#9ad89a' : '#e6a3a3'
          shape.strokeWidth = 2
          return
        }
        shape.fill = '#6f7782'
        shape.stroke = '#000000'
        shape.strokeWidth = 6
      })

      const highlightedSet = new Set(highlightedLinks)
      diagram.links.each((link) => {
        if (highlightedSet.has(link)) return
        const path = link.findObject('PATH') as go.Shape | null
        const arrow = link.findObject('ARROW') as go.Shape | null
        if (path) {
          path.opacity = 0.18
        }
        if (arrow) {
          arrow.opacity = 0.18
        }
      })

      const styleFlowLinks = (links: go.Link[], color: string) => {
        links.forEach((link) => {
          const path = link.findObject('PATH') as go.Shape | null
          const arrow = link.findObject('ARROW') as go.Shape | null
          if (path) {
            path.stroke = color
            path.opacity = 0.95
            path.strokeDashArray = [10, 7]
            path.strokeDashOffset = 0
          }
          if (arrow) {
            arrow.fill = color
            arrow.opacity = 0.95
          }
        })
      }
      styleFlowLinks(incomingLinks, '#8ff5ab')
      styleFlowLinks(outgoingLinks, '#ff8f8f')

      // GoJS の strokeDashOffset は 0 以上のみ。負数は無視されるため、
      // 流出は周期を折り返して逆方向に見せる。
      const dashPeriod = 10 + 7
      let phase = 0
      flowTimerRef.current = window.setInterval(() => {
        phase = (phase + 2) % dashPeriod
        incomingLinks.forEach((link) => {
          const path = link.findObject('PATH') as go.Shape | null
          if (path) path.strokeDashOffset = phase
        })
        outgoingLinks.forEach((link) => {
          const path = link.findObject('PATH') as go.Shape | null
          if (path) path.strokeDashOffset = (dashPeriod - phase) % dashPeriod
        })
      }, 45)
    }

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
      // 初回のみ Diagram インスタンスを生成する。
      const diagram = new go.Diagram(hostRef.current, {
        'animationManager.isEnabled': false,
        allowCopy: false,
        allowDelete: false,
        allowMove: false, // ノードのドラッグ移動を禁止（背景パンは可）
        padding: 40,
        contentAlignment: go.Spot.Center,
      })
      diagram.div!.style.backgroundColor = GOJS_DIAGRAM_BG

      // ------------------------------------------------------------
      // インタラクション（ホバー／ツールチップ）
      //
      // ※ これは jQuery ではありません。
      //    GoJS の GraphObject.mouseEnter / mouseLeave API です。
      //    テンプレート定義時にコールバックを渡し、ノード／リンク上での
      //    マウス進入・離脱を受け取ります。依存に jQuery はありません。
      //
      // 形式: GraphObject プロパティ mouseEnter / mouseLeave
      //   - 第1引数 e … go.InputEvent
      //   - 第2引数 obj … イベント対象の GraphObject（part で Node/Link を取得）
      //   - transformDocToView … ドキュメント座標 → ビュー座標（ホスト上の位置）
      //   - 色のホバー変更／Leave 時の色戻しは行わない（クリック強調を維持するため）
      //
      // ツールチップ本体は React の state（画面上の .tn-tooltip）で描画する。
      // 位置はコンテナに対する % で渡し、CSS の absolute 配置に合わせる。
      // ------------------------------------------------------------

      // ノード: ホバーではツールチップのみ（色は変更しない）
      diagram.nodeTemplate = buildNodeTemplate({
        mouseEnter: (_e, obj) => {
          const node = obj.part as go.Node
          const data = node.data as NodeModel
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
        mouseLeave: () => {
          setTooltipRef.current(null)
        },
      })
      diagram.nodeTemplateMap.add('ghost', buildGhostNodeTemplate())

      const linkHover = {
        mouseEnter: (_e: go.InputEvent, obj: go.GraphObject) => {
          const link = obj.part as go.Link
          const data = link.data as LinkModel
          const fromNode = link.fromNode
          const toNode = link.toNode
          if (!fromNode || !toNode) return
          const a = fromNode.getDocumentPoint(go.Spot.Center)
          const b = toNode.getDocumentPoint(go.Spot.Center)
          const mid = new go.Point((a.x + b.x) / 2, (a.y + b.y) / 2)
          const viewPoint = diagram.transformDocToView(mid)
          const tip =
            data.kind === 'external'
              ? {
                  title:
                    data.fromLabel === '圏外'
                      ? `→${data.toLabel}`
                      : `${data.fromLabel}→`,
                  lines: [`件数: ${formatInt(data.value)}`],
                }
              : edgeTooltipContent(data.fromLabel, data.toLabel, data.value)
          showAtViewPoint(viewPoint, tip)
        },
        mouseLeave: () => {
          setTooltipRef.current(null)
        },
      }

      // リンク: ホバーで線色を強調し、遷移件数ツールチップを表示
      diagram.linkTemplate = buildLinkTemplate(linkHover)
      diagram.linkTemplateMap.add(
        'external',
        buildExternalLinkTemplate(linkHover),
      )

      diagram.model = new go.GraphLinksModel({
        nodeDataArray: modelData.nodes,
        linkDataArray: modelData.links,
      })

      diagram.addDiagramListener('ObjectSingleClicked', (evt) => {
        const part = evt.subject.part
        if (!(part instanceof go.Node)) return
        const data = part.data as NodeModel
        if (data.category === 'ghost') return
        applyFlowFocus(diagram, String(data.key))
      })

      diagram.addDiagramListener('BackgroundSingleClicked', () => {
        focusedNodeKeyRef.current = null
        resetFocusStyles(diagram)
      })

      diagramRef.current = diagram
      // レイアウト確定後にフィット（即時 zoomToFit だと寸法未確定で外れることがある）
      requestAnimationFrame(() => {
        diagram.commandHandler.zoomToFit()
      })
    } else {
      // 2回目以降: インスタンスは再利用し、モデルだけ差し替える
      const diagram = diagramRef.current
      const keepScale = diagram.scale
      const keepPos = diagram.position.copy()
      const hadNodes = diagram.nodes.count > 0
      setTooltip(null)
      diagram.model = new go.GraphLinksModel({
        nodeDataArray: modelData.nodes,
        linkDataArray: modelData.links,
      })
      if (hadNodes) {
        diagram.scale = keepScale
        diagram.position = keepPos
      } else {
        requestAnimationFrame(() => {
          diagram.commandHandler.zoomToFit()
        })
      }
      if (focusedNodeKeyRef.current) {
        applyFlowFocus(diagram, focusedNodeKeyRef.current)
      } else {
        resetFocusStyles(diagram)
      }
    }
  }, [modelData])

  useEffect(() => {
    return () => {
      stopFlowAnimation()
      diagramRef.current?.div && (diagramRef.current.div = null)
      diagramRef.current = null
    }
  }, [])

  const downloadPng = () => {
    setIsDownloading(true)
    setMessage(null)
    try {
      const diagram = diagramRef.current
      if (!diagram) {
        throw new Error('グラフの準備ができていません。')
      }
      const dataUrl = diagram.makeImageData({
        background: GOJS_DIAGRAM_BG,
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
      setMessage('PNGをダウンロードしました（GoJS makeImageData）。')
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'PNGダウンロードに失敗しました。',
      )
    } finally {
      setIsDownloading(false)
    }
  }

  const copyPng = async () => {
    setIsCopying(true)
    setMessage(null)
    try {
      const diagram = diagramRef.current
      if (!diagram) {
        throw new Error('グラフの準備ができていません。')
      }
      if (!navigator.clipboard?.write) {
        throw new Error(
          'このブラウザではクリップボードへの画像コピーに対応していません。',
        )
      }
      const dataUrl = diagram.makeImageData({
        background: GOJS_DIAGRAM_BG,
        scale: 2,
        type: 'image/png',
      })
      if (typeof dataUrl !== 'string') {
        throw new Error('画像の生成に失敗しました。')
      }
      const blob = await (await fetch(dataUrl)).blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
      setMessage('PNGをコピーしました。Ctrl+V で貼り付けできます。')
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'PNGコピーに失敗しました。',
      )
    } finally {
      setIsCopying(false)
    }
  }

  return (
    <main className="tn-page">
      <header className="tn-page-header">
        <div>
          <p className="tn-page-eyebrow">ライブラリ検証</p>
          <h1 className="tn-page-title">曼荼羅チャート — GoJS</h1>
        </div>
        <div className="tn-page-actions">
          <Link className="tn-page-link" to="/">
            トップ
          </Link>
          <Link className="tn-page-link" to="/transition-network">
            スクラッチ版へ
          </Link>
          <Link className="tn-page-link" to="/transition-network/cytoscape">
            Cytoscape 版へ
          </Link>
          <Link className="tn-page-link" to="/transition-network/agcharts">
            AG Charts 版へ
          </Link>
          <button
            type="button"
            className="tn-page-btn"
            disabled={isCopying}
            onClick={() => {
              void copyPng()
            }}
          >
            {isCopying ? 'コピー中…' : 'PNGをコピー'}
          </button>
          <button
            type="button"
            className="tn-page-btn"
            disabled={isDownloading}
            onClick={downloadPng}
          >
            {isDownloading ? 'ダウンロード中…' : 'PNGをダウンロード'}
          </button>
        </div>
      </header>

      {message ? (
        <p
          className={
            message.includes('失敗') || message.includes('できていません')
              ? 'tn-page-message error'
              : 'tn-page-message'
          }
          role="status"
        >
          {message}
        </p>
      ) : null}

      <div className="tn-page-stage">
        <div className="transition-network">
          <div className="tn-top-row">
            <aside className="tn-summary" aria-label="サマリ">
              <div className="tn-summary-badge">
                <div className="tn-summary-badge-title">集計項目</div>
                <div className="tn-summary-badge-line">
                  前期購入量 → 当期購入量
                </div>
                <div className="tn-summary-badge-line">購入量差, 購入量比</div>
              </div>
              <div className="tn-summary-base">
                <div className="tn-summary-base-title">ベース金額</div>
                <div className="tn-summary-base-line">前期 26/01-26/06</div>
                <div className="tn-summary-base-line">当期 26/01-26/03</div>
              </div>
            </aside>

            <aside className="tn-top-control" aria-label="表示制御">
              <div className="tn-top-control-source">
                [データソース] 消費者購買系: CIPS
              </div>
              <label className="tn-top-control-label" htmlFor="tn-gojs-edge-min">
                流入/流出線表示最小値(絶対値)
              </label>
              <div className="tn-top-control-value">
                {edgeMinAbs.toLocaleString('ja-JP')}
              </div>
              <input
                id="tn-gojs-edge-min"
                className="tn-slider"
                type="range"
                min={0}
                max={EDGE_MIN_MAX}
                step={1}
                value={edgeMinAbs}
                onChange={(e) => {
                  setTooltip(null)
                  setEdgeMinAbs(Number(e.target.value))
                }}
              />
            </aside>
          </div>

          <div className="tn-graph-area">
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
          </div>

          <div className="tn-bottom-control">
            <label
              className="tn-bottom-control-label"
              htmlFor="tn-gojs-node-count"
            >
              ノード数: {nodeCount}
            </label>
            <input
              id="tn-gojs-node-count"
              className="tn-slider tn-slider-bottom"
              type="range"
              min={NODE_SLIDER.min}
              max={NODE_SLIDER.max}
              step={1}
              value={nodeCount}
              onChange={(e) => {
                setTooltip(null)
                setNodeCount(Number(e.target.value))
              }}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
