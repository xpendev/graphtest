# 遷移ネットワーク可視化 方式別見積もり

単位: 時間（h）／1名あたり 6h/日換算／採用はいずれか1方式（列の合算はしない）

## 1. サマリ

| 方式 | 総計 (h) | カレンダー目安 | ライセンス |
| --- | ---: | --- | --- |
| スクラッチ（React + SVG） | 198 | 約33日（約6.5〜7週） | なし |
| Cytoscape.js | 144 | 約24日（約5週） | 無料（MIT） |
| GoJS | 152 | 約25日（約5週） | 有償 |

## 2. 概要表（ファイル単位）

| スクラッチのファイル | 説明 | スクラッチ (h) | Cytoscape | Cytoscape (h) | GoJS | GoJS (h) |
| --- | --- | ---: | --- | ---: | --- | ---: |
| `scratchData.ts` | 型定義・API 取得 | 12 | `cytoscapeData.ts` | 14 | `goJsData.ts` | 14 |
| API / モック層 | 件数別 JSON・API（本番は DB API） | 8 | 同左 | 8 | 同左 | 8 |
| `scratchHelpers.ts` | 座標・矢印幾何・フォーマット | 51 | `cytoscapeHelpers.ts` | 39 | `goJsHelpers.ts` | 39 |
| `scratchStyles.ts` | 色・スタイル定数 | 6 | `cytoscapeStyles.ts` | 16 | `goJsStyles.ts` | 22 |
| `ScratchGraph.tsx` | SVG によるグラフ描画 | 58 | 不要（ライブラリで実現）※結線のみ | 6 | 不要（ライブラリで実現）※結線のみ | 6 |
| `ScratchPage.tsx` | 画面 UI・状態管理 | 52 | `CytoscapePage.tsx` | 61 | `GoJsPage.tsx` | 63 |
| `scratchPng.ts` | PNG コピー／ダウンロード | 11 | 不要（ライブラリで実現） | 0 | 不要（ライブラリで実現） | 0 |
| **総計** | | **198** | | **144** | | **152** |

## 3. 詳細表（関数単位）

各節の小計は概要表と一致。「不要（ライブラリで実現）」は自前実装なし（0h）。

### 3.1 Data（12 / 14 / 14）

| スクラッチ | 説明 | スクラッチ (h) | Cytoscape | Cytoscape (h) | GoJS | GoJS (h) |
| --- | --- | ---: | --- | ---: | --- | ---: |
| 型 `ScratchNode` / `ScratchEdge` | ノード・エッジ型 | 4 | 型定義 | 4 | 型定義 | 4 |
| `NODE_COUNT_MIN` / `MAX` | 件数レンジ | 1 | 同左 | 1 | 同左 | 1 |
| — | しきい値グレー判定 | 0 | `isGrayEdge` | 2 | `isGrayEdge` | 2 |
| `fetchScratchNetwork` | API 取得 | 7 | `fetchCytoscapeNetwork` | 7 | `fetchGoJsNetwork` | 7 |
| **小計** | | **12** | | **14** | | **14** |

### 3.2 API / モック層（8 / 8 / 8）

| 作業 | 説明 | スクラッチ (h) | Cytoscape (h) | GoJS (h) |
| --- | --- | ---: | ---: | ---: |
| 件数別 JSON | `transition-network-{n}.json` | 4 | 4 | 4 |
| API ルーター | `GET /api/transition-network` | 4 | 4 | 4 |
| **小計** | | **8** | **8** | **8** |

### 3.3 Helpers（51 / 39 / 39）

| スクラッチ | 説明 | スクラッチ (h) | Cytoscape | Cytoscape (h) | GoJS | GoJS (h) |
| --- | --- | ---: | --- | ---: | --- | ---: |
| 定数・型 | レイアウト土台 | 5 | 定数等 | 4 | 定数等 | 4 |
| `formatInt` / `formatDelta` | 表示フォーマット | 4 | 同左 | 4 | 同左 | 4 |
| `nodeCenters` / `layoutNodes` | 楕円配置 | 10 | `ellipsePositions` | 8 | `ellipsePositions` | 8 |
| `ellipseEdgePoint` 等 / `layoutEdges` | 矢印始終点・線の幾何 | 22 | 不要（ライブラリで実現） | 0 | 不要（ライブラリで実現） | 0 |
| `externalArrow` | 圏外矢印の始終点 | 10 | `buildExternalElements` | 14 | `buildExternalModels` | 14 |
| — | ノード複数行ラベル | 0 | `nodeLabelLines` | 3 | `nodeLabelLines` | 3 |
| — | ツールチップ文面 | 0 | tooltip 関数 | 6 | tooltip 関数 | 6 |
| **小計** | | **51** | | **39** | | **39** |

### 3.4 Styles（6 / 16 / 22）

| スクラッチ | 説明 | スクラッチ (h) | Cytoscape | Cytoscape (h) | GoJS | GoJS (h) |
| --- | --- | ---: | --- | ---: | --- | ---: |
| `scratchStyles` | 色定数 | 6 | 色指定 | 6 | 色定数 | 6 |
| — | 線幅マッピング | 0 | `edgeWidthFromValue` | 4 | `linkStrokeWidthFromValue` | 2 |
| — | スタイル／テンプレート本体 | 0 | `cytoscapeStyles` | 6 | `build*Template` 等 | 14 |
| **小計** | | **6** | | **16** | | **22** |

### 3.5 Graph（58 / 6 / 6）

| スクラッチ | 説明 | スクラッチ (h) | Cytoscape | Cytoscape (h) | GoJS | GoJS (h) |
| --- | --- | ---: | --- | ---: | --- | ---: |
| `edgeStrokeWidth` | 件数→線幅 | 3 | 不要（ライブラリで実現） | 0 | 不要（ライブラリで実現） | 0 |
| `ArrowMarker` / marker | 矢印ヘッド | 8 | 不要（ライブラリで実現） | 0 | 不要（ライブラリで実現） | 0 |
| ノード楕円・ラベル SVG | ノード描画 | 12 | 不要（ライブラリで実現） | 0 | 不要（ライブラリで実現） | 0 |
| 遷移線・件数ラベル SVG | エッジ描画 | 14 | 不要（ライブラリで実現） | 0 | 不要（ライブラリで実現） | 0 |
| 圏外矢印 SVG | 圏外描画 | 8 | 不要（ライブラリで実現） | 0 | 不要（ライブラリで実現） | 0 |
| ホバー／ツールチップ描画 | インタラクション見た目 | 7 | 不要（Page 側で実現） | 0 | 不要（Page 側で実現） | 0 |
| `ScratchGraph` 結線 | 部品の結合 | 6 | elements 投入・確認 | 6 | model 投入・確認 | 6 |
| **小計** | | **58** | | **6** | | **6** |

### 3.6 Page（52 / 61 / 63）

| スクラッチ | 説明 | スクラッチ (h) | Cytoscape | Cytoscape (h) | GoJS | GoJS (h) |
| --- | --- | ---: | --- | ---: | --- | ---: |
| 件数 UI | ノード数操作 | 6 | スライダー | 4 | スライダー | 4 |
| しきい値スライダー | 線の表示最小値 | 4 | 同左 | 4 | 同左 | 4 |
| ヘッダ・サマリ UI | 画面枠 | 8 | 同左 | 8 | 同左 | 8 |
| API 取得・状態 | loading / error | 8 | 同左 | 8 | 同左 | 8 |
| Helpers 結線 | 座標変換の接続 | 6 | elements 組立 | 4 | model 組立 | 4 |
| ホバー／ツールチップ | 画面 tip | 8 | `cy.on` 結線 | 12 | mouse イベント結線 | 14 |
| PNG ボタン | 出力操作 | 4 | `cy.png()` 呼出 | 6 | 画像 API 呼出 | 6 |
| メッセージ表示 | 通知 | 2 | 同左 | 2 | 同左 | 2 |
| — | ライブラリ初期化 | 0 | `cytoscape` 生成 | 13 | `Diagram` 生成 | 13 |
| **小計** | | **52** | | **61** | | **63** |

### 3.7 PNG（11 / 0 / 0）

| スクラッチ | 説明 | スクラッチ (h) | Cytoscape | Cytoscape (h) | GoJS | GoJS (h) |
| --- | --- | ---: | --- | ---: | --- | ---: |
| 変換・保存下ごしらえ | ファイル名等 | 3 | 不要（ライブラリで実現） | 0 | 不要（ライブラリで実現） | 0 |
| クリップボード書込 | PNG コピー | 2 | 不要（ライブラリで実現） | 0 | 不要（ライブラリで実現） | 0 |
| SVG→Canvas→PNG | 画像化本体 | 4 | 不要（ライブラリで実現） | 0 | 不要（ライブラリで実現） | 0 |
| 公開関数 | コピー／DL API | 2 | 不要（ライブラリで実現） | 0 | 不要（ライブラリで実現） | 0 |
| **小計** | | **11** | | **0** | | **0** |

### 詳細表の総計

| 方式 | 総計 (h) |
| --- | ---: |
| スクラッチ | 198 |
| Cytoscape.js | 144 |
| GoJS | 152 |
