import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  buildScratchNetwork,
  NODE_COUNT_MAX,
  NODE_COUNT_MIN,
} from './scratchData'
import {
  EDGE_MIN_DEFAULT,
  EDGE_MIN_MAX,
  layoutEdges,
  layoutNodes,
  type TooltipState,
} from './scratchHelpers'
import { ScratchGraph } from './ScratchGraph'
import {
  copyScratchSvgToClipboard,
  downloadScratchSvgAsPng,
} from './scratchPng'

/** 入力値が 2〜30 の整数かどうか */
function isValidNodeCount(value: number): boolean {
  return (
    Number.isInteger(value) &&
    value >= NODE_COUNT_MIN &&
    value <= NODE_COUNT_MAX
  )
}

/**
 * スクラッチ版ページ。
 * state を持ち、Data → Helpers → Graph をつなぐ司令塔。
 */
export function ScratchPage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isCopying, setIsCopying] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  /** テキストボックスの入力（まだ確定していない値） */
  const [draftNodeCount, setDraftNodeCount] = useState(String(NODE_COUNT_MIN))
  /** 「表示」押下後にグラフへ渡すノード数 */
  const [nodeCount, setNodeCount] = useState<number | null>(NODE_COUNT_MIN)
  /** 流入/流出線をグレーにするしきい値（絶対値） */
  const [edgeMinAbs, setEdgeMinAbs] = useState(EDGE_MIN_DEFAULT)

  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [hoverEdgeKey, setHoverEdgeKey] = useState<string | null>(null)
  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null)

  // --- Data → Helpers（座標付き） ---
  const network = useMemo(
    () => (nodeCount == null ? null : buildScratchNetwork(nodeCount)),
    [nodeCount],
  )
  const nodes = useMemo(
    () => (network ? layoutNodes(network.nodes) : []),
    [network],
  )
  const edges = useMemo(
    () => (network ? layoutEdges(network.edges, nodes) : []),
    [network, nodes],
  )

  const clearHover = () => {
    setTooltip(null)
    setHoverEdgeKey(null)
    setHoverNodeId(null)
  }

  /** 入力値を検証し、問題なければグラフ用ノード数を確定する */
  const showGraph = () => {
    setMessage(null)
    clearHover()

    const parsed = Number(draftNodeCount.trim())
    if (!isValidNodeCount(parsed)) {
      setMessage(
        `ノード数は ${NODE_COUNT_MIN} 〜 ${NODE_COUNT_MAX} の整数を入力してください。`,
      )
      return
    }
    setNodeCount(parsed)
  }

  const getSvg = () => {
    const svg = rootRef.current?.querySelector('svg.scratch-network-svg')
    if (!(svg instanceof SVGSVGElement)) {
      throw new Error('コピー対象のグラフが見つかりません。')
    }
    return svg
  }

  const handleCopyPng = async () => {
    setIsCopying(true)
    setMessage(null)
    try {
      await copyScratchSvgToClipboard(getSvg())
      setMessage('PNGをコピーしました。Ctrl+V で貼り付けできます。')
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'PNGコピーに失敗しました。',
      )
    } finally {
      setIsCopying(false)
    }
  }

  const handleDownloadPng = async () => {
    setIsDownloading(true)
    setMessage(null)
    try {
      await downloadScratchSvgAsPng(getSvg(), 'transition-network')
      setMessage('PNGをダウンロードしました。')
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

  const isErrorMessage =
    !!message &&
    (message.includes('失敗') ||
      message.includes('見つかりません') ||
      message.includes('入力してください'))

  return (
    <main className="tn-page">
      <header className="tn-page-header">
        <div>
          <p className="tn-page-eyebrow">検証用スパイク</p>
          <h1 className="tn-page-title">遷移ネットワーク</h1>
          <p className="tn-page-subtitle">スクラッチ（React + SVG）</p>
        </div>
        <div className="tn-page-actions">
          <Link className="tn-page-link" to="/">
            トップ
          </Link>
          <Link className="tn-page-link" to="/transition-network/cytoscape">
            Cytoscape 版へ
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
              void handleCopyPng()
            }}
          >
            {isCopying ? 'コピー中…' : 'PNGをコピー'}
          </button>
          <button
            type="button"
            className="tn-page-btn"
            disabled={isDownloading}
            onClick={() => {
              void handleDownloadPng()
            }}
          >
            {isDownloading ? 'ダウンロード中…' : 'PNGをダウンロード'}
          </button>
        </div>
      </header>

      {message ? (
        <p
          className={isErrorMessage ? 'tn-page-message error' : 'tn-page-message'}
          role="status"
        >
          {message}
        </p>
      ) : null}

      <div ref={rootRef} className="tn-page-stage">
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
              <label className="tn-top-control-label" htmlFor="tn-edge-min">
                流入/流出線表示最小値(絶対値)
              </label>
              <div className="tn-top-control-value">
                {edgeMinAbs.toLocaleString('ja-JP')}
              </div>
              <input
                id="tn-edge-min"
                className="tn-slider"
                type="range"
                min={0}
                max={EDGE_MIN_MAX}
                step={1}
                value={edgeMinAbs}
                onChange={(e) => {
                  clearHover()
                  setEdgeMinAbs(Number(e.target.value))
                }}
              />
            </aside>
          </div>

          {network ? (
            <ScratchGraph
              nodes={nodes}
              edges={edges}
              edgeMinAbs={edgeMinAbs}
              tooltip={tooltip}
              hoverEdgeKey={hoverEdgeKey}
              hoverNodeId={hoverNodeId}
              onHoverEdge={(key, nextTooltip) => {
                setHoverEdgeKey(key)
                setTooltip(nextTooltip)
              }}
              onHoverNode={(id, nextTooltip) => {
                setHoverNodeId(id)
                setTooltip(nextTooltip)
              }}
            />
          ) : (
            <div className="tn-graph-placeholder" role="status">
              ノード数を入力し、「表示」を押すとグラフを描画します（
              {NODE_COUNT_MIN}〜{NODE_COUNT_MAX}）。
            </div>
          )}

          <div className="tn-bottom-control">
            <label className="tn-bottom-control-label" htmlFor="tn-node-count">
              ノード数
              {nodeCount != null ? `（表示中: ${nodeCount}）` : ''}
            </label>
            <div className="tn-node-count-row">
              <input
                id="tn-node-count"
                className="tn-node-count-input"
                type="number"
                min={NODE_COUNT_MIN}
                max={NODE_COUNT_MAX}
                step={1}
                value={draftNodeCount}
                onChange={(e) => setDraftNodeCount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') showGraph()
                }}
              />
              <button type="button" className="tn-page-btn" onClick={showGraph}>
                表示
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
