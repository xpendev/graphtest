import cytoscape, { type Core } from 'cytoscape'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchCytoscapeNetwork,
  isGrayEdge,
  type CytoscapeNetworkEdge,
  type CytoscapeNetworkNode,
} from './cytoscapeData'
import {
  EDGE_MIN_DEFAULT,
  EDGE_MIN_MAX,
  buildExternalElements,
  edgeTooltipContent,
  ellipsePositions,
  formatInt,
  NODE_SLIDER,
  nodeLabelLines,
  nodeTooltipContent,
} from './cytoscapeHelpers'
import { cytoscapeStyles } from './cytoscapeStyles'

type TooltipState = {
  xPct: number
  yPct: number
  title: string
  lines: string[]
}

/**
 * Cytoscape 版ページ。
 * state を持ち、API → Helpers → Cytoscape インスタンスをつなぐ司令塔。
 */
export function CytoscapePage() {
  const hostRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)
  /** グラフに渡すノード数（スライダー確定値） */
  const [nodeCount, setNodeCount] = useState(8)
  /** 流入/流出線をグレーにするしきい値（絶対値） */
  const [edgeMinAbs, setEdgeMinAbs] = useState(EDGE_MIN_DEFAULT)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [network, setNetwork] = useState<{
    nodes: CytoscapeNetworkNode[]
    edges: CytoscapeNetworkEdge[]
  } | null>(null)
  // React の setState を Cytoscape イベントから呼ぶための最新参照。
  // cy.on(...) はインスタンス生成時に一度だけ登録するため、
  // クロージャに古い setTooltip が残らないよう ref 経由にする。
  const setTooltipRef = useRef(setTooltip)
  setTooltipRef.current = setTooltip
  // [アニメーション] 流入/流出の破線を動かすタイマー。再開時にコメントを外す。
  // const flowTimerRef = useRef<number | null>(null)
  const focusedNodeIdRef = useRef<string | null>(null)

  // --- API ---
  useEffect(() => {
    let cancelled = false
    setMessage(null)

    void fetchCytoscapeNetwork(nodeCount)
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

  // [アニメーション] 破線の動きを止める。再開時にコメントを外す。
  // const stopFlowAnimation = () => {
  //   if (flowTimerRef.current != null) {
  //     window.clearInterval(flowTimerRef.current)
  //     flowTimerRef.current = null
  //   }
  // }

  const clearFlowFocus = (cy: Core) => {
    // [アニメーション] stopFlowAnimation()
    cy.nodes().removeClass('focus related faded up down flow-in flow-out')
    cy.edges().removeClass('flow-in flow-out faded')
    // [アニメーション] 破線の位相データをクリアする。再開時にコメントを外す。
    // cy.edges().forEach((edge) => {
    //   edge.removeData('flowPhase')
    // })
  }

  const applyFlowFocus = (cy: Core, nodeId: string) => {
    const target = cy.getElementById(nodeId)
    if (!target || target.empty()) {
      focusedNodeIdRef.current = null
      return
    }

    clearFlowFocus(cy)
    focusedNodeIdRef.current = nodeId

    const incoming = target.incomers('edge')
    const outgoing = target.outgoers('edge')
    const ghostNodes = cy.nodes('.external-ghost')
    const relatedNodes = incoming
      .sources()
      .union(outgoing.targets())
      .difference(target)
      .difference(ghostNodes)
    const activeNodes = target.union(relatedNodes)

    target.addClass('focus')
    relatedNodes.addClass('related')
    activeNodes.forEach((node: cytoscape.NodeSingular) => {
      const before = Number(node.data('before') ?? 0)
      const after = Number(node.data('after') ?? 0)
      node.addClass(after > before ? 'up' : 'down')
    })

    const highlightedEdges = incoming.union(outgoing)
    const fadedNodes = cy.nodes().difference(activeNodes).difference(ghostNodes)
    const fadedEdges = cy.edges().difference(highlightedEdges)
    fadedNodes.addClass('faded')
    fadedEdges.addClass('faded')

    incoming.addClass('flow-in')
    outgoing.addClass('flow-out')

    // [アニメーション] 流入/流出の破線を動かして流れを見せる。再開時にコメントを外す。
    // let phase = 0
    // flowTimerRef.current = window.setInterval(() => {
    //   phase += 2
    //   incoming.forEach((edge: cytoscape.EdgeSingular) => {
    //     edge.data('flowPhase', phase)
    //   })
    //   outgoing.forEach((edge: cytoscape.EdgeSingular) => {
    //     edge.data('flowPhase', -phase)
    //   })
    // }, 45)
  }

  useEffect(() => {
    if (!hostRef.current || !network) return

    // Cytoscape に渡す要素（ノード／エッジ）。見た目は cytoscapeStyles.ts。
    // 圏外は透明ゴースト＋短い直線エッジ。
    const maxEdgeValue =
      network.edges.length > 0
        ? Math.max(...network.edges.map((edge) => edge.value))
        : null
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
      ...network.edges.map((edge) => {
        const fromLabel = nodeById.get(edge.from)?.label ?? edge.from
        const toLabel = nodeById.get(edge.to)?.label ?? edge.to
        const muted = isGrayEdge(edge, edgeMinAbs)
        return {
          group: 'edges' as const,
          // muted 解除時にクラス残留しないよう、常にクラス文字列を明示する
          classes: muted ? 'muted' : '',
          data: {
            id: `${edge.from}->${edge.to}`,
            source: edge.from,
            target: edge.to,
            label: edge.value === maxEdgeValue ? formatInt(edge.value) : '',
            value: edge.value,
            fromLabel,
            toLabel,
          },
        }
      }),
      ...buildExternalElements(network.nodes, positions, edgeMinAbs),
    ]

    if (!cyRef.current) {
      // 初回のみ Graph インスタンスを生成する。
      const cy = cytoscape({
        container: hostRef.current,
        elements,
        layout: { name: 'preset' }, // 座標は elements の position を使う
        style: cytoscapeStyles,
        userZoomingEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: false,
        autoungrabify: true, // ノードのドラッグ移動を禁止（背景パンは可）
      })
      cyRef.current = cy
      cy.fit(undefined, 40)
      // ------------------------------------------------------------
      // インタラクション（ホバー／ツールチップ）
      //
      // ※ これは jQuery ではありません。
      //    Cytoscape.js 独自のイベント API で、書き味が jQuery の
      //    .on(event, selector, handler) に似ているだけです。
      //    依存パッケージに jQuery は含まれていません。
      //
      // 形式: cy.on(イベント名, 対象セレクタ, ハンドラ)
      //   - 'node' / 'edge' … Cytoscape 要素セレクタ
      //   - evt.target     … 対象の NodeSingular / EdgeSingular
      //   - addClass('hover') … cytoscapeStyles の node.hover / edge.hover を適用
      //
      // ツールチップ本体は React の state（画面上の .tn-tooltip）で描画する。
      // 位置はコンテナに対する % で渡し、CSS の absolute 配置に合わせる。
      // ------------------------------------------------------------

      // ノードにマウス進入: ハイライト + KPI ツールチップ
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

      // ノードからマウス離脱: ハイライト解除 + ツールチップ非表示
      cy.on('mouseout', 'node', (evt) => {
        evt.target.removeClass('hover')
        setTooltipRef.current(null)
      })

      // エッジにマウス進入: ハイライト + 遷移件数ツールチップ
      // 位置は始点・終点ノードの中点を使う（エッジ中央の近似）
      cy.on('mouseover', 'edge', (evt) => {
        const ele = evt.target
        const container = cy.container()
        if (!container) return

        // cytoscapeStyles の selector: 'edge.hover' に対応
        ele.addClass('hover')

        const sourcePos = ele.source().renderedPosition()
        const targetPos = ele.target().renderedPosition()
        const fromLabel = String(ele.data('fromLabel') ?? '')
        const toLabel = String(ele.data('toLabel') ?? '')
        const kind = String(ele.data('kind') ?? '')
        const tip =
          kind === 'external'
            ? {
                title: fromLabel === '圏外' ? `→${toLabel}` : `${fromLabel}→`,
                lines: [`件数: ${formatInt(Number(ele.data('value') ?? 0))}`],
              }
            : edgeTooltipContent(
                fromLabel,
                toLabel,
                Number(ele.data('value') ?? 0),
              )
        setTooltipRef.current({
          xPct: ((sourcePos.x + targetPos.x) / 2 / container.clientWidth) * 100,
          yPct: ((sourcePos.y + targetPos.y) / 2 / container.clientHeight) * 100,
          title: tip.title,
          lines: tip.lines,
        })
      })

      // エッジからマウス離脱
      cy.on('mouseout', 'edge', (evt) => {
        evt.target.removeClass('hover')
        setTooltipRef.current(null)
      })

      // ノードクリック: 関連ノード・関連エッジを強調し、
      // 流入/流出方向ごとに流れる矢印アニメーションを再生する。
      cy.on('tap', 'node', (evt) => {
        applyFlowFocus(cy, String(evt.target.id()))
      })

      // 背景クリックで強調解除
      cy.on('tap', (evt) => {
        if (evt.target === cy) {
          clearFlowFocus(cy)
          focusedNodeIdRef.current = null
        }
      })
    } else {
      // 2回目以降: インスタンスは再利用し、データだけ差し替える
      const cy = cyRef.current
      const currentZoom = cy.zoom()
      const currentPan = cy.pan()
      setTooltip(null)
      clearFlowFocus(cy)
      cy.json({ elements })
      cy.layout({ name: 'preset' }).run()
      // 閾値スライダー変更時に表示位置が戻らないよう、現在のビューを維持する。
      cy.zoom(currentZoom)
      cy.pan(currentPan)
      if (focusedNodeIdRef.current) {
        applyFlowFocus(cy, focusedNodeIdRef.current)
      }
    }
  }, [network, nodeById, edgeMinAbs])

  useEffect(() => {
    return () => {
      // [アニメーション] stopFlowAnimation()
      cyRef.current?.destroy()
      cyRef.current = null
    }
  }, [])

  const downloadPng = () => {
    setIsDownloading(true)
    setMessage(null)
    try {
      const cy = cyRef.current
      if (!cy) {
        throw new Error('グラフの準備ができていません。')
      }
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
      setMessage('PNGをダウンロードしました（Cytoscape API）。')
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
      const cy = cyRef.current
      if (!cy) {
        throw new Error('グラフの準備ができていません。')
      }
      if (!navigator.clipboard?.write) {
        throw new Error(
          'このブラウザではクリップボードへの画像コピーに対応していません。',
        )
      }
      const png = cy.png({
        output: 'blob',
        bg: '#1a1f24',
        full: true,
        scale: 2,
      }) as Blob
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': png }),
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
          <h1 className="tn-page-title">曼荼羅チャート — Cytoscape.js</h1>
        </div>
        <div className="tn-page-actions">
          <Link className="tn-page-link" to="/">
            トップ
          </Link>
          <Link className="tn-page-link" to="/transition-network">
            スクラッチ版へ
          </Link>
          <Link className="tn-page-link" to="/transition-network/gojs">
            GoJS 版へ
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
              <label className="tn-top-control-label" htmlFor="tn-cy-edge-min">
                流入/流出線表示最小値(絶対値)
              </label>
              <div className="tn-top-control-value">
                {edgeMinAbs.toLocaleString('ja-JP')}
              </div>
              <input
                id="tn-cy-edge-min"
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
              htmlFor="tn-cy-node-count"
            >
              ノード数: {nodeCount}
            </label>
            <input
              id="tn-cy-node-count"
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
