import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  copyScratchSvgToClipboard,
  downloadScratchSvgAsPng,
} from './scratchPng'
import { ScratchView } from './ScratchView'
import './scratch.css'

export function ScratchPage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isCopying, setIsCopying] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const getSvg = () => {
    const svg = rootRef.current?.querySelector('svg.scratch-network-svg')
    if (!(svg instanceof SVGSVGElement)) {
      throw new Error('コピー対象のグラフが見つかりません。')
    }
    return svg
  }

  return (
    <main className="tn-page">
      <header className="tn-page-header">
        <div>
          <p className="tn-page-eyebrow">検証用スパイク</p>
          <h1 className="tn-page-title">遷移ネットワーク</h1>
          <p className="tn-page-subtitle">
            スクラッチ（React + SVG）
          </p>
        </div>
        <div className="tn-page-actions">
          <Link className="tn-page-link" to="/transition-network/cytoscape">
            Cytoscape 版へ
          </Link>
          <Link className="tn-page-link" to="/transition-network/gojs">
            GoJS 版へ
          </Link>
          <button
            type="button"
            className="tn-page-btn"
            disabled={isCopying}
            onClick={async () => {
              setIsCopying(true)
              setMessage(null)
              try {
                await copyScratchSvgToClipboard(getSvg())
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
            }}
          >
            {isCopying ? 'コピー中…' : 'PNGをコピー'}
          </button>
          <button
            type="button"
            className="tn-page-btn"
            disabled={isDownloading}
            onClick={async () => {
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
            }}
          >
            {isDownloading ? 'ダウンロード中…' : 'PNGをダウンロード'}
          </button>
        </div>
      </header>

      {message ? (
        <p
          className={
            message.includes('失敗') || message.includes('見つかりません')
              ? 'tn-page-message error'
              : 'tn-page-message'
          }
          role="status"
        >
          {message}
        </p>
      ) : null}

      <div ref={rootRef} className="tn-page-stage">
        <ScratchView />
      </div>
    </main>
  )
}
