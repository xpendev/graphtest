import { Link } from 'react-router-dom'

const links = [
  {
    to: '/transition-network',
    title: 'スクラッチ',
    note: 'React + SVG（見た目の基準）',
  },
  {
    to: '/transition-network/cytoscape',
    title: 'Cytoscape.js',
    note: '無料ライブラリ',
  },
  {
    to: '/transition-network/gojs',
    title: 'GoJS',
    note: '評価版・有償',
  },
] as const

export function HomePage() {
  return (
    <main className="tn-home">
      <h1 className="tn-home-title">遷移ネットワーク検証</h1>
      <p className="tn-home-lead">実装を選択してください</p>
      <nav className="tn-home-nav" aria-label="実装一覧">
        {links.map((item) => (
          <Link key={item.to} className="tn-home-link" to={item.to}>
            <span className="tn-home-link-title">{item.title}</span>
            <span className="tn-home-link-note">{item.note}</span>
          </Link>
        ))}
      </nav>
    </main>
  )
}
