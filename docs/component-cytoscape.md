# コンポーネント構成図 — Cytoscape.js

提案用。実装フォルダ: [`src/transitionNetworkCytoscape/`](../src/transitionNetworkCytoscape/)（6 files）

ルート: `/transition-network/cytoscape`

## 全体構成

```mermaid
flowchart TB
  main["main.tsx<br/>ルーティング"]
  page["CytoscapePage.tsx<br/>ページ枠・PNG DL・他実装へのリンク"]
  view["CytoscapeView.tsx<br/>状態管理・Cytoscape 初期化／更新"]
  frame["CytoscapeFrame.tsx<br/>サマリ＋スライダー枠"]
  data["cytoscapeData.ts<br/>ダミーデータ"]
  layout["cytoscapeLayout.ts<br/>楕円座標・ラベル・フィルタ"]
  css["cytoscape.css"]
  lib["cytoscape<br/>（外部ライブラリ）"]

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
  subgraph page["CytoscapePage"]
    direction TB
    header["ヘッダー<br/>リンク / PNG ダウンロード"]
    subgraph view["CytoscapeView"]
      direction TB
      frame["CytoscapeFrame<br/>サマリ・しきい値・ノード数"]
      canvas["div ホスト<br/>→ Cytoscape.js が描画"]
    end
  end
  frame --- canvas
```

## データ・描画の流れ

```mermaid
sequenceDiagram
  participant Page as CytoscapePage
  participant View as CytoscapeView
  participant Data as cytoscapeData
  participant Layout as cytoscapeLayout
  participant Frame as CytoscapeFrame
  participant Cy as Cytoscape.js

  Page->>View: マウント（onReady で Handle 受領）
  View->>Frame: サマリ／スライダーを描画
  View->>Data: buildCytoscapeNetwork(nodeCount)
  Data-->>View: nodes / edges
  View->>Layout: filter / ellipsePositions / labels
  Layout-->>View: 表示用要素
  View->>Cy: elements + style + preset layout
  Cy-->>View: キャンバス描画
  Page->>View: downloadPng()
  View->>Cy: cy.png()
```

## ファイル一覧

| ファイル | 役割 |
| --- | --- |
| `CytoscapePage.tsx` | ページ。ナビ、PNG ダウンロード（ライブラリ API） |
| `CytoscapeView.tsx` | Cytoscape インスタンスの生成・データ更新・PNG Handle |
| `CytoscapeFrame.tsx` | サマリ＋しきい値／ノード数スライダー枠 |
| `cytoscapeData.ts` | ノード／エッジのダミーデータ生成 |
| `cytoscapeLayout.ts` | 楕円座標・ラベル整形・エッジフィルタ |
| `cytoscape.css` | スタイル |

## 特徴（提案メモ）

- **無料**のグラフ可視化ライブラリ
- ノード／エッジをデータとして渡し、描画は Cytoscape に委譲
- スクラッチよりファイル数が少なく、グラフ操作（ズーム等）をライブラリに寄せやすい
- 楕円ノード内の細かい複数行レイアウトは、スクラッチほど自由ではない
