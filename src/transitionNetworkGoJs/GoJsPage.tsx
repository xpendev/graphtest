import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { GoJsView, type GoJsGraphHandle } from './GoJsView'
import './goJs.css'

export function GoJsPage() {
  const handleRef = useRef<GoJsGraphHandle | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const onReady = useCallback((handle: GoJsGraphHandle) => {
    handleRef.current = handle
  }, [])

  return (
    <main className="tn-page">
      <header className="tn-page-header">
        <div>
          <p className="tn-page-eyebrow">ライブラリ検証</p>
          <h1 className="tn-page-title">遷移ネットワーク — GoJS</h1>
          <p className="tn-page-subtitle">
            商用ダイアグラムライブラリ GoJS（評価版）による実装です。ノード／リンクを
            テンプレート＋データバインドで定義します。ウォーターマークが出ることがあります。
          </p>
        </div>
        <div className="tn-page-actions">
          <Link className="tn-page-link" to="/transition-network">
            スクラッチ版へ
          </Link>
          <Link className="tn-page-link" to="/transition-network/cytoscape">
            Cytoscape 版へ
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
        <GoJsView onReady={onReady} />
      </div>
    </main>
  )
}
