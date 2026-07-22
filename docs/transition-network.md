# 遷移ネットワーク

カテゴリ間の流入・流出を、有向ネットワークとして可視化する **検証専用** アプリです。

実装ごとに **フォルダを完全分離** しています（共通コンポーネントなし）。  
各フォルダのファイル一覧が、そのまま「その方式で作る必要があるもの」の目安になります。

## 開き方

```bash
npm run dev
```

| URL | フォルダ | 実装 |
| --- | --- | --- |
| `/transition-network` | [`src/transitionNetworkScratch/`](../src/transitionNetworkScratch/) | スクラッチ（React + SVG）・見た目の基準 |
| `/transition-network/cytoscape` | [`src/transitionNetworkCytoscape/`](../src/transitionNetworkCytoscape/) | [Cytoscape.js](https://js.cytoscape.org/)（無料） |
| `/transition-network/gojs` | [`src/transitionNetworkGoJs/`](../src/transitionNetworkGoJs/) | [GoJS](https://gojs.net/)（評価版・有償） |

`/` はスクラッチ版へリダイレクトします。

## フォルダ構成（作成量の目安）

```
src/
├── main.tsx                         # ルーティングのみ
├── transitionNetworkScratch/        # スクラッチ（10 files）
│   ├── ScratchPage.tsx
│   ├── ScratchView.tsx
│   ├── ScratchGraph.tsx
│   ├── ScratchSummary.tsx
│   ├── ScratchEdgeControl.tsx
│   ├── ScratchNodeControl.tsx
│   ├── scratchLayout.ts
│   ├── scratchData.ts
│   ├── scratchPng.ts
│   └── scratch.css
├── transitionNetworkCytoscape/      # Cytoscape（6 files）
│   ├── CytoscapePage.tsx
│   ├── CytoscapeView.tsx
│   ├── CytoscapeFrame.tsx
│   ├── cytoscapeLayout.ts
│   ├── cytoscapeData.ts
│   └── cytoscape.css
└── transitionNetworkGoJs/           # GoJS（6 files）
    ├── GoJsPage.tsx
    ├── GoJsView.tsx
    ├── GoJsFrame.tsx
    ├── goJsLayout.ts
    ├── goJsData.ts
    └── goJs.css
```

### 方針

- **共通コンポーネントは使わない**
- データ・レイアウト・Frame（サマリ／スライダー枠）も各フォルダに複製し、名前を分けている
  - 例: `buildScratchNetwork` / `buildCytoscapeNetwork` / `buildGoJsNetwork`
- フォルダを見れば、その方式の実装量とファイル構成が一目で分かる

### スクラッチ（見た目の基準）

| ファイル | 役割 |
| --- | --- |
| `ScratchPage.tsx` | ページ・PNG 操作 |
| `ScratchView.tsx` | 状態管理と組み立て |
| `ScratchGraph.tsx` | 中央 SVG（ノード・線・圏外矢印・ツールチップ） |
| `ScratchSummary.tsx` | 左上サマリ |
| `ScratchEdgeControl.tsx` | 右上：表示最小値スライダー |
| `ScratchNodeControl.tsx` | 下：ノード数スライダー |
| `scratchLayout.ts` | 楕円配置・エッジ幾何 |
| `scratchData.ts` | ダミーデータ |
| `scratchPng.ts` | SVG → PNG |
| `scratch.css` | スタイル |

### Cytoscape / GoJS（各 6 ファイル）

| ファイル | 役割 |
| --- | --- |
| `*Page.tsx` | ページ・PNG ダウンロード |
| `*View.tsx` | ライブラリによるグラフ描画 |
| `*Frame.tsx` | サマリ＋スライダー枠 |
| `*Layout.ts` | 楕円座標・ラベル整形・フィルタ |
| `*Data.ts` | ダミーデータ（各フォルダ用にリネーム） |
| `*.css` | ページ＋キャンバス用スタイル |

## 画面構成

```
┌──────────────────────────────┬─────────────────────────────┐
│ 左上: サマリ                  │ 右上: 流入/流出線の最小値    │
│ （集計項目・ベース金額）       │ （絶対値スライダー）         │
├──────────────────────────────┴─────────────────────────────┤
│                                                             │
│                    中央: ネットワークグラフ                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    下: ノード数スライダー（2〜8）             │
└─────────────────────────────────────────────────────────────┘
```

## 操作

### 右上: 流入/流出線表示最小値（絶対値）

- 範囲: `0` 〜 `500`（初期値 `50`）
- 絶対値がしきい値未満の遷移線・圏外矢印を非表示

### 下: ノード数

- 範囲: `2` 〜 `8`

## 既知の制約

- データは固定ダミー
- 双方向遷移は線が重なりやすい
- GoJS は評価版でウォーターマークが出ることがある
- Excel ネイティブグラフオブジェクト出力は対象外
