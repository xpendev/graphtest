# コンポーネント構成図 — GoJS

提案用。実装フォルダ: [`src/transitionNetworkGoJs/`](../src/transitionNetworkGoJs/)（6 files）

ルート: `/transition-network/gojs`

## 全体構成

```mermaid
flowchart TB
  main["main.tsx<br/>ルーティング"]
  page["GoJsPage.tsx<br/>ページ枠・PNG DL・他実装へのリンク"]
  view["GoJsView.tsx<br/>状態管理・Diagram 初期化／更新"]
  frame["GoJsFrame.tsx<br/>サマリ＋スライダー枠"]
  data["goJsData.ts<br/>ダミーデータ"]
  layout["goJsLayout.ts<br/>楕円座標・ラベル・フィルタ"]
  css["goJs.css"]
  lib["gojs<br/>（外部ライブラリ・評価／有償）"]

  main --> page
  page --> view
  page --> css
  view --> frame
  view --> data
  view --> layout
  view --> lib
  frame --> layout
```

## 画面領域との対応

```mermaid
flowchart LR
  subgraph page["GoJsPage"]
    direction TB
    header["ヘッダー<br/>リンク / PNG ダウンロード"]
    subgraph view["GoJsView"]
      direction TB
      frame["GoJsFrame<br/>サマリ・しきい値・ノード数"]
      canvas["div ホスト<br/>→ GoJS Diagram が描画"]
    end
  end
  frame --- canvas
```

## データ・描画の流れ

```mermaid
sequenceDiagram
  participant Page as GoJsPage
  participant View as GoJsView
  participant Data as goJsData
  participant Layout as goJsLayout
  participant Frame as GoJsFrame
  participant Go as GoJS Diagram

  Page->>View: マウント（onReady で Handle 受領）
  View->>Frame: サマリ／スライダーを描画
  View->>Data: buildGoJsNetwork(nodeCount)
  Data-->>View: nodes / edges
  View->>Layout: filter / ellipsePositions / labels
  Layout-->>View: model 用配列
  View->>Go: GraphLinksModel + Node/Link テンプレート
  Go-->>View: ダイアグラム描画
  Page->>View: downloadPng()
  View->>Go: makeImageData()
```

## ファイル一覧

| ファイル | 役割 |
| --- | --- |
| `GoJsPage.tsx` | ページ。ナビ、PNG ダウンロード（ライブラリ API） |
| `GoJsView.tsx` | GoJS Diagram の生成・モデル更新・PNG Handle |
| `GoJsFrame.tsx` | サマリ＋しきい値／ノード数スライダー枠 |
| `goJsData.ts` | ノード／エッジのダミーデータ生成 |
| `goJsLayout.ts` | 楕円座標・ラベル整形・エッジフィルタ |
| `goJs.css` | スタイル |

## 特徴（提案メモ）

- **商用ダイアグラムライブラリ**（評価利用可、本番はライセンス必須）
- ノード／リンクをテンプレート＋データバインドで定義
- 構成は Cytoscape と同型（Page / View / Frame / Data / Layout / CSS）
- 評価版ではウォーターマークが出ることがある
