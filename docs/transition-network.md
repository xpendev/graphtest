# 遷移ネットワーク

カテゴリ間の流入・流出を、有向ネットワークとして可視化する **検証専用** アプリです。

実装ごとに **フォルダを完全分離** しています（共通コンポーネントなし）。  
各フォルダのファイル一覧が、そのまま「その方式で作る必要があるもの」の目安になります。

## 開き方

```bash
npm run dev
```

| URL | フォルダ | 実装 | 詳細 |
| --- | --- | --- | --- |
| `/` | [`src/HomePage.tsx`](../src/HomePage.tsx) | トップ（実装へのリンクのみ） | — |
| `/transition-network` | [`src/transitionNetworkScratch/`](../src/transitionNetworkScratch/) | スクラッチ（React + SVG）・見た目の基準 | [component-scratch.md](./component-scratch.md) |
| `/transition-network/cytoscape` | [`src/transitionNetworkCytoscape/`](../src/transitionNetworkCytoscape/) | [Cytoscape.js](https://js.cytoscape.org/)（無料） | [component-cytoscape.md](./component-cytoscape.md) |
| `/transition-network/gojs` | [`src/transitionNetworkGoJs/`](../src/transitionNetworkGoJs/) | [GoJS](https://gojs.net/)（評価版・有償） | [component-gojs.md](./component-gojs.md) |
| `/transition-network/agcharts` | [`src/transitionNetworkAgCharts/`](../src/transitionNetworkAgCharts/) | [AG Charts Chord](https://www.ag-grid.com/charts/react/chord-series/)（Enterprise） | [component-agcharts.md](./component-agcharts.md) |

## フォルダ構成（作成量の目安）

```
src/
├── main.tsx                         # ルーティングのみ
├── HomePage.tsx                     # トップ（リンク選択）
├── index.css                        # ページ枠の共通 tn-*（導入先では不要想定）
├── transitionNetworkScratch/        # スクラッチ（6 files）
│   ├── ScratchPage.tsx
│   ├── ScratchGraph.tsx
│   ├── scratchStyles.ts
│   ├── scratchHelpers.ts
│   ├── scratchData.ts
│   └── scratchPng.ts
├── transitionNetworkCytoscape/      # Cytoscape（4 files）
│   ├── CytoscapePage.tsx
│   ├── cytoscapeStyles.ts
│   ├── cytoscapeHelpers.ts
│   └── cytoscapeData.ts
├── transitionNetworkGoJs/           # GoJS（4 files）
│   ├── GoJsPage.tsx
│   ├── goJsStyles.ts
│   ├── goJsHelpers.ts
│   └── goJsData.ts
└── transitionNetworkAgCharts/       # AG Charts Chord（4 files）
    ├── AgChartsPage.tsx
    ├── agChartsStyles.ts
    ├── agChartsHelpers.ts
    └── agChartsData.ts
```

| 実装 | 構成 |
| --- | --- |
| スクラッチ | `Page` + `Graph`（SVG）+ `Styles` / `Helpers` / `Data` / `Png` |
| Cytoscape | `Page` + `Styles` / `Helpers` / `Data` |
| GoJS | `Page` + `Styles` / `Helpers` / `Data` |
| AG Charts | `Page` + `Styles` / `Helpers` / `Data`（Chord・圏外なし） |

### 方針（3実装共通）

- **共通コンポーネントは使わない**（データ・Helpers・Styles も各フォルダに複製）
- UI は各 `*Page.tsx` に集約（必要になったら後から分割）
- グラフ見た目は `*Styles.ts`（専用 CSS なし）
- ページ枠は導入先の Tailwind / Emotion に寄せる想定（スパイクでは `index.css` の `tn-*`）

## 画面構成（3実装共通）

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

- 範囲: `0` 〜 `1000`（初期値 `50`）
- 絶対値がしきい値未満の遷移線・圏外矢印は **非表示ではなくグレー表示**（Scratch / Cytoscape / GoJS）
- AG Charts Chord はしきい値未満を非表示（Chord 上でグレー個別制御は未対応）

### 下: ノード数

- スクラッチ / Cytoscape / GoJS / AG Charts（試し）: `2` 〜 `30`（ネットワーク系は初期 30、AG Charts も最大 30）
- ※ Scratch / GoJS / Cytoscape は楕円配置の可変計算。AG Charts は Chord（圏外なし）

## 既知の制約

- データは固定ダミー
- 双方向遷移は線が重なりやすい
- GoJS は評価版でウォーターマークが出ることがある
- AG Charts Chord は Enterprise（評価時ウォーターマークの可能性）
- Excel ネイティブグラフオブジェクト出力は対象外
