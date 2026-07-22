import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CytoscapeView, type CytoscapeGraphHandle } from './CytoscapeView'

export function CytoscapePage() {
  const handleRef = useRef<CytoscapeGraphHandle | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const onReady = useCallback((handle: CytoscapeGraphHandle) => {
    handleRef.current = handle
  }, [])

  return (
    <main className="tn-page">
      <header className="tn-page-header">
        <div>
          <p className="tn-page-eyebrow">ライブラリ検証</p>
          <h1 className="tn-page-title">遷移ネットワーク — Cytoscape.js</h1>
          <p className="tn-page-subtitle">
            無料のグラフ可視化ライブラリ Cytoscape.js による実装です。生 SVG
            手書きではなく、ノード／エッジをデータとして渡します。
          </p>
        </div>
        <div className="tn-page-actions">
          <Link className="tn-page-link" to="/transition-network">
            スクラッチ版へ
          </Link>
          <Link className="tn-page-link" to="/transition-network/gojs">
            GoJS 版へ
          </Link>
          <button
            type="button"
            className="tn-page-btn"
            disabled={isDownloading}
            onClick={() => {
              setIsDownloading(true)
              setMessage(null)
              try {
                if (!handleRef.current) {
                  throw new Error('グラフの準備ができていません。')
                }
                handleRef.current.downloadPng()
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
            }}
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
        <CytoscapeView onReady={onReady} />
      </div>
    </main>
  )
}
