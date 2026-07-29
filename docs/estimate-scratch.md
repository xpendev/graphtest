# 遷移ネットワーク可視化 — 方式別見積もり（ファイル単位比較）

**用途:** 上長向け比較表。方式ごとに独立した見積時間を並べる。  
**注意:** 3方式の時間を **合算しない**（採用はいずれか1つ想定）。  
**前提:** 要件定義・設計書あり。実装はゼロから。第三者実装。ダミーデータ。現行スパイク相当の機能。  
**単位:** 時間（h）  
**作成日:** 2026-07-29

**含まないもの:** 本番 DB 集計の詳細設計、認証、Excel 出力、本格自動テスト、AG Charts。

**API について:** スパイクは件数ごとのモック JSON（`transition-network-{n}.json`）を返す。本番は条件に合う nodes / edges を DB 集計して返す想定であり、30件プールからの切り出しではない。

---

## サマリ（1数字で比較）

| 方式 | 総計 (h) | カレンダー目安（1名・6h/日） | ライセンス |
| --- | ---: | --- | --- |
| スクラッチ（React + SVG） | 198 | 約33日（約6.5〜7週） | なし |
| Cytoscape.js | 144 | 約24日（約5週） | 無料（MIT） |
| GoJS | 152 | 約25日（約5週） | 有償 |

### 総計だけの簡易比較

| 方式 | 総計 (h) |
| --- | ---: |
| スクラッチ | **198** |
| Cytoscape.js | **144** |
| GoJS | **152** |

---

## 概要表（ファイル単位）

「スクラッチのファイル」を基準に、他方式の対応ファイルと工数を並べる。  
空欄は「その方式では作らない（ライブラリが担う／1行で足りる）」を意味する。

| スクラッチのファイル | 説明 | スクラッチ (h) | Cytoscape の対応ファイル | Cytoscape (h) | GoJS の対応ファイル | GoJS (h) |
| --- | --- | ---: | --- | ---: | --- | ---: |
| `scratchData.ts` | ノード・エッジの型定義と API 取得（`fetch`） | 12 | `cytoscapeData.ts` | 14 | `goJsData.ts` | 14 |
| API / モック層 | 件数別 JSON（2〜30）と API ルーター。本番は DB API に置換 | 8 | （共通・同内容） | 8 | （共通・同内容） | 8 |
| `scratchHelpers.ts` | 座標計算・矢印幾何・フォーマット。描画はしない | 51 | `cytoscapeHelpers.ts`（一部ライブラリが肩代わり） | 39 | `goJsHelpers.ts`（一部ライブラリが肩代わり） | 39 |
| `scratchStyles.ts` | 色・スタイル定数のみ。描画ロジックなし | 6 | `cytoscapeStyles.ts`（ライブラリ API で記述） | 16 | `goJsStyles.ts`（ライブラリ API・記述量が多い） | 22 |
| `ScratchGraph.tsx` | SVG タグで全要素を手書き描画 | 58 | ファイルなし（ライブラリが肩代わり） | 6 | ファイルなし（ライブラリが肩代わり） | 6 |
| `ScratchPage.tsx` | ページ全体の UI・スライダー・ボタン・状態管理 | 52 | `CytoscapePage.tsx`（ライブラリ初期化・イベント含む） | 61 | `GoJsPage.tsx`（ライブラリ初期化・イベント含む） | 63 |
| `scratchPng.ts` | SVG→Canvas→PNG、クリップボード、ダウンロード | 11 | ファイルなし（`cy.png()` などで完結） | 0 | ファイルなし（`makeImageData()` などで完結） | 0 |
| **総計** | | **198** | | **144** | | **152** |

---

## 読み方のメモ

- **Graph / PNG** がスクラッチで厚い。Cyto / GoJS はここが薄い（またはゼロ）。
- **Styles** はスクラッチが最も薄い。GoJS はテンプレート記述が長くなりがち。
- **Page** はライブラリ初期化・イベント結線分、Cyto / GoJS の方が厚い。
- **API / モック層** は方式によらず同工数（採用は1方式のため、比較表では各列に同じ h を載せている）。

---

## 詳細表（関数単位）

概要表の各ファイル工数を、関数（または同等の作業単位）に分解した表。  
各ファイル節の小計は概要表と一致する。

**表記**

- **不要（ライブラリで実現）** … 自前実装が不要。工数は 0。
- ライブラリ側に対応関数がある場合は関数名を書く。
- ファイルが無く Page 内の結線だけで済む場合は「Page 内」などと書く。

### `scratchData.ts` 小計 12 / 14 / 14

| スクラッチ | 説明 | スクラッチ (h) | Cytoscape | Cytoscape (h) | GoJS | GoJS (h) |
| --- | --- | ---: | --- | ---: | --- | ---: |
| 型 `ScratchNode` / `ScratchEdge` | ノード・エッジの型 | 4 | 型 `CytoscapeNetworkNode` / `Edge` | 4 | 型 `GoJsNetworkNode` / `Edge` | 4 |
| `NODE_COUNT_MIN` / `MAX` | 件数レンジ定数 | 1 | 同左 | 1 | 同左 | 1 |
| （なし） | しきい値グレー判定 | 0 | `isGrayEdge` | 2 | `isGrayEdge` | 2 |
| `fetchScratchNetwork` | API 取得 | 7 | `fetchCytoscapeNetwork` | 7 | `fetchGoJsNetwork` | 7 |
| **小計** | | **12** | | **14** | | **14** |

### API / モック層 小計 8 / 8 / 8

| スクラッチ（＝共通） | 説明 | スクラッチ (h) | Cytoscape | Cytoscape (h) | GoJS | GoJS (h) |
| --- | --- | ---: | --- | ---: | --- | ---: |
| `transition-network-{n}.json` | 件数別モックデータ整備 | 4 | （共通・同内容） | 4 | （共通・同内容） | 4 |
| `viteTransitionNetworkApiPlugin` | `GET /api/transition-network` | 4 | （共通・同内容） | 4 | （共通・同内容） | 4 |
| **小計** | | **8** | | **8** | | **8** |

### `scratchHelpers.ts` 小計 51 / 39 / 39

| スクラッチ | 説明 | スクラッチ (h) | Cytoscape | Cytoscape (h) | GoJS | GoJS (h) |
| --- | --- | ---: | --- | ---: | --- | ---: |
| 定数・型（`VIEW_*` / `Point` / `LaidOut*` 等） | レイアウト用の土台 | 5 | 定数・`NODE_SLIDER` 等 | 4 | 定数・`NODE_SLIDER` 等 | 4 |
| `formatInt` / `formatDelta` | 表示用フォーマット | 4 | 同名関数 | 4 | 同名関数 | 4 |
| `nodeCenters` / `layoutNodes` | 楕円配置の座標付け | 10 | `ellipsePositions` | 8 | `ellipsePositions` | 8 |
| `ellipseEdgePoint` / `angleBetween` / `midpoint` / `buildEdgeGeometry` / `layoutEdges` | 矢印始終点・線の幾何 | 22 | **不要（ライブラリで実現）** | 0 | **不要（ライブラリで実現）** | 0 |
| `externalArrow` | 圏外矢印の始終点 | 10 | `buildExternalElements`（ゴースト＋エッジ） | 14 | `buildExternalModels`（ゴースト＋リンク） | 14 |
| （なし） | ノード複数行ラベル | 0 | `nodeLabelLines` | 3 | `nodeLabelLines` | 3 |
| （なし） | ツールチップ文面 | 0 | `nodeTooltipContent` / `edgeTooltipContent` | 6 | 同左 | 6 |
| **小計** | | **51** | | **39** | | **39** |

### `scratchStyles.ts` 小計 6 / 16 / 22

| スクラッチ | 説明 | スクラッチ (h) | Cytoscape | Cytoscape (h) | GoJS | GoJS (h) |
| --- | --- | ---: | --- | ---: | --- | ---: |
| `scratchStyles`（色定数） | 塗り・線・ラベル色 | 6 | スタイル配列の色指定（`cytoscapeStyles` 内） | 6 | 色定数一式 | 6 |
| （なし） | 線幅のマッピング | 0 | `edgeWidthFromValue` | 4 | `linkStrokeWidthFromValue` | 2 |
| （なし） | スタイルシート／テンプレート本体 | 0 | `cytoscapeStyles` 配列 | 6 | `buildNodeTemplate` / `buildLinkTemplate` 等 | 14 |
| **小計** | | **6** | | **16** | | **22** |

### `ScratchGraph.tsx` 小計 58 / 6 / 6

| スクラッチ | 説明 | スクラッチ (h) | Cytoscape | Cytoscape (h) | GoJS | GoJS (h) |
| --- | --- | ---: | --- | ---: | --- | ---: |
| `edgeStrokeWidth` | 件数→線の太さ | 3 | **不要（ライブラリ＋Styles で実現）** | 0 | **不要（ライブラリ＋Styles で実現）** | 0 |
| `ArrowMarker` / marker defs | 矢印ヘッド定義 | 8 | **不要（ライブラリで実現）** | 0 | **不要（ライブラリで実現）** | 0 |
| ノード楕円・ラベル SVG | カテゴリノードの手書き描画 | 12 | **不要（ライブラリで実現）** | 0 | **不要（ライブラリで実現）** | 0 |
| 遷移線・件数ラベル SVG | 有向エッジの手書き描画 | 14 | **不要（ライブラリで実現）** | 0 | **不要（ライブラリで実現）** | 0 |
| 圏外矢印 SVG | 圏外流入／流出の手書き描画 | 8 | **不要（Helpers＋ライブラリで実現）** | 0 | **不要（Helpers＋ライブラリで実現）** | 0 |
| ホバー／ツールチップ描画 | SVG 上の強調と追従 UI | 7 | **不要（Page のイベント＋DOM で実現）** | 0 | **不要（Page のイベント＋DOM で実現）** | 0 |
| `ScratchGraph` まとめ・結び | props 受け渡し・再描画 | 6 | Page 内の elements 投入・表示確認 | 6 | Page 内の model 投入・表示確認 | 6 |
| **小計** | | **58** | | **6** | | **6** |

### `ScratchPage.tsx` 小計 52 / 61 / 63

| スクラッチ | 説明 | スクラッチ (h) | Cytoscape | Cytoscape (h) | GoJS | GoJS (h) |
| --- | --- | ---: | --- | ---: | --- | ---: |
| `isValidNodeCount`＋件数 UI | ノード数入力／スライダー | 6 | 件数スライダー | 4 | 件数スライダー | 4 |
| しきい値スライダー | 流入／流出線の最小値 | 4 | 同左 | 4 | 同左 | 4 |
| ヘッダ・サマリ・データソース UI | ページ枠の文言・レイアウト | 8 | 同左 | 8 | 同左 | 8 |
| API 取得・loading／error | `fetch` と状態 | 8 | 同左 | 8 | 同左 | 8 |
| Helpers 結線（`layoutNodes` 等） | Data→座標付きへの変換 | 6 | elements 組み立て（一部） | 4 | modelData 組み立て（一部） | 4 |
| ホバー／ツールチップ state | 画面上の tip 表示 | 8 | `cy.on` 系イベント結線 | 12 | `mouseEnter` / `Leave` 結線 | 14 |
| PNG ボタン結線 | コピー／ダウンロード呼び出し | 4 | `cy.png()` 呼び出し | 6 | `makeImageData` 等の呼び出し | 6 |
| メッセージ表示 | 成功／失敗の通知 | 2 | 同左 | 2 | 同左 | 2 |
| （なし） | ライブラリ本体の初期化 | 0 | `cytoscape({...})` 生成・破棄 | 13 | `go.Diagram` 生成・破棄 | 13 |
| **小計** | | **52** | | **61** | | **63** |

### `scratchPng.ts` 小計 11 / 0 / 0

| スクラッチ | 説明 | スクラッチ (h) | Cytoscape | Cytoscape (h) | GoJS | GoJS (h) |
| --- | --- | ---: | --- | ---: | --- | ---: |
| `loadImage` / `buildPngFilename` / `downloadBlob` | 変換・保存の下ごしらえ | 3 | **不要（ライブラリで実現）** | 0 | **不要（ライブラリで実現）** | 0 |
| `copyPngToClipboard` | Clipboard API 書き込み | 2 | **不要（ライブラリ＋ Page で実現）** | 0 | **不要（ライブラリ＋ Page で実現）** | 0 |
| `drawSvgOnCanvas` / `renderSvgToPngBlob` | SVG→Canvas→PNG | 4 | **不要（ライブラリで実現）** | 0 | **不要（ライブラリで実現）** | 0 |
| `copyScratchSvgToClipboard` / `downloadScratchSvgAsPng` | 公開 API | 2 | **不要（`cy.png()` 等）** | 0 | **不要（`makeImageData()` 等）** | 0 |
| **小計** | | **11** | | **0** | | **0** |

### 詳細表の総計チェック

| 方式 | 各ファイル小計の合計 | サマリ総計 |
| --- | ---: | ---: |
| スクラッチ | 12+8+51+6+58+52+11 = **198** | **198** |
| Cytoscape.js | 14+8+39+16+6+61+0 = **144** | **144** |
| GoJS | 14+8+39+22+6+63+0 = **152** | **152** |
