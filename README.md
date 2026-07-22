# AG Grid / AG Charts Enterprise スパイク

Vite + React + TypeScript で AG Grid / AG Charts **Enterprise（トライアル）** を使ったテーブル＋グラフ切替のサンプルです。

## 前提

- [Node.js](https://nodejs.org/) 18 以上（LTS 推奨）
- npm
- AG Enterprise の評価用ライセンスキー（本番利用不可）

## ライセンスキー設定

1. [`.env.example`](.env.example) をコピーして `.env` を作成する
2. `VITE_AG_LICENSE_KEY=` にトライアルキーを貼り付ける
3. `.env` は Git にコミットしない（`.gitignore` 済み）

キー未設定でも起動はできますが、コンソール警告やウォーターマークが出ることがあります。

## セットアップと実行

```bash
npm install
npm run dev
```

通常は [http://localhost:5173](http://localhost:5173) を開きます。

| URL | 内容 |
| --- | --- |
| `/` | AG Grid / AG Charts デモ（本線） |
| `/transition-network` | 遷移ネットワーク検証ページ（React + SVG） |

## その他のコマンド

| コマンド | 説明 |
| --- | --- |
| `npm run build` | 本番用ビルド |
| `npm run preview` | ビルド結果のプレビュー |

## テーブル

| 列 | field | 内容 |
| --- | --- | --- |
| 製品名 | `product` | 文字列 |
| 売上 | `sales` | 数値 |
| 在庫 | `stock` | 数値 |

固定データ: [`src/data/sampleData.ts`](src/data/sampleData.ts)

## グラフ切替

テーブル下の **プルダウン** で AG Charts のシリーズを切り替えます。

- **Community:** 棒 / 折れ線 / 面 / 散布 / バブル / 円 / ドーナツ / 組み合わせ
- **Enterprise:** Box Plot / Candlestick / OHLC / Heatmap / Histogram / Nightingale / Radar Line / Radar Area / Radial Column / Radial Bar / Range Bar / Range Area / Waterfall / Sunburst / Treemap / Sankey / Chord / Funnel / Cone Funnel / Pyramid
- **検証（同一ページ内）:**
  - **Multi Chord** — Chord を 3 インスタンス横並び
  - **Pentagon Chord** — Chord を 5 枚、正五角形配置＋各ノード間の SVG 直線

定義: [`src/chart/chartOptions.ts`](src/chart/chartOptions.ts)  
Enterprise 用ダミーデータ: [`src/data/enterpriseChartData.ts`](src/data/enterpriseChartData.ts)

### 遷移ネットワーク（別ページ）

AG Charts ではなく React + SVG で独自実装したカテゴリ間遷移図です。  
**検証用に `/transition-network` へ切り出し**ています（本線のプルダウンには含まれません）。

- 詳細ドキュメント: [`docs/transition-network.md`](docs/transition-network.md)
- ページ: [`src/pages/TransitionNetworkPage.tsx`](src/pages/TransitionNetworkPage.tsx)
- 分割コンポーネント: [`src/transitionNetwork/`](src/transitionNetwork/)
- データ: [`src/data/transitionNetworkData.ts`](src/data/transitionNetworkData.ts)

※ Maps / Org Chart / Financial Charts ラッパー / Gauge は対象外です。  
※ Integrated Charts（グリッドからチャート作成）は未実装です。
※ Chord の複数表示は、1 キャンバスに series を重ねるのではなく、**チャートインスタンスを複数マウント**する方式です。
※ Pentagon Chord の線は Canvas 等でも描けるが、今回はレイアウト上に重ねた SVG オーバーレイで実装しています。

## 注意

- トライアルキーは評価専用です。本番利用は許可されていません。
- 本キーの有効期限はライセンス文言に記載されています（例: 2026-08-20 失効）。
