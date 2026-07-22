# 遷移ネットワーク検証スパイク

Vite + React + TypeScript で、カテゴリ間遷移ネットワークの実装方式を比較するサンプルです。

## 前提

- [Node.js](https://nodejs.org/) 18 以上（LTS 推奨）
- npm

## セットアップと実行

```bash
npm install
npm run dev
```

通常は [http://localhost:5173](http://localhost:5173) を開きます（`/` はスクラッチ版へリダイレクト）。

| URL | 内容 |
| --- | --- |
| `/transition-network` | スクラッチ（React + SVG） |
| `/transition-network/cytoscape` | Cytoscape.js（無料） |
| `/transition-network/gojs` | GoJS（評価版・有償） |

詳細: [`docs/transition-network.md`](docs/transition-network.md)

## その他のコマンド

| コマンド | 説明 |
| --- | --- |
| `npm run build` | 本番用ビルド |
| `npm run preview` | ビルド結果のプレビュー |

## 実装フォルダ

- スクラッチ（10 files）: [`src/transitionNetworkScratch/`](src/transitionNetworkScratch/)
- Cytoscape（6 files）: [`src/transitionNetworkCytoscape/`](src/transitionNetworkCytoscape/)
- GoJS（6 files）: [`src/transitionNetworkGoJs/`](src/transitionNetworkGoJs/)

共通コンポーネントは使わず、実装ごとにフォルダを分離しています。

## 注意

- GoJS は評価版のためウォーターマークが出ることがあります。本番利用にはライセンスが必要です。
