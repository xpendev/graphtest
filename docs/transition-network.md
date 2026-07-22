# 遷移ネットワーク

カテゴリ間の流入・流出を、有向ネットワークとして可視化する **検証専用ページ** です。

## AG Charts との関係（重要）

**遷移ネットワークは AG Charts を使っていません。**

| 項目 | 遷移ネットワーク | AG Charts デモ（本線 `/`） |
| --- | --- | --- |
| 描画 | React + SVG（独自実装） | `<AgCharts />` + options |
| グラフ種別 | AG Charts の series ではない（カスタム有向ネットワーク図） | `bar` / `line` / `chord` など |
| PNG ダウンロード | **AG Charts API 未使用**（自前） | `getImageDataURL()` などを使用 |
| PNG コピー | **AG Charts API 未使用**（自前） | 同上 |

使っていないものの例:

- `<AgCharts />` / `AgChartInstance`
- `getImageDataURL()`
- `download()`（AG Charts のチャート画像ダウンロード API）
- `buildChartOptions()` による series 定義

描画・画像出力とも、ブラウザ標準技術（SVG / Canvas / Blob / `<a download>`）で実装しています。

## 開き方

```bash
npm run dev
```

- 検証ページ: [http://localhost:5173/transition-network](http://localhost:5173/transition-network)
- AG Charts デモ（本線）: [http://localhost:5173/](http://localhost:5173/)  
  → 上部リンク「遷移ネットワーク検証ページへ」からも遷移できます

遷移ネットワークは AG Charts 切替プルダウンからは **削除** 済みです（検証用に切り出したため）。

## 目的

- Excel / AG Charts 標準シリーズでは表現しにくい **カテゴリ間遷移** を単独で検証する
- サマリ・表示制御・グラフ本体を領域分割して配置する
- AG Charts デモ本体と混ぜず、コンポーネント分割して読みやすくする

## フォルダ・ファイル構成

遷移ネットワーク関連は、次のフォルダにまとめています。

```
src/
├── main.tsx                              # ルーティング（/ と /transition-network）
├── App.tsx                               # 本線デモ（検証ページへのリンクのみ）
├── pages/
│   └── TransitionNetworkPage.tsx         # 検証ページ本体
├── transitionNetwork/                    # 遷移ネットワーク専用モジュール
│   ├── TransitionNetworkView.tsx         # 状態管理 + 各領域の組み立て
│   ├── TransitionNetworkSummary.tsx      # 左上サマリ
│   ├── TransitionNetworkEdgeControl.tsx  # 右上しきい値スライダー
│   ├── TransitionNetworkNodeControl.tsx  # 下ノード数スライダー
│   ├── TransitionNetworkGraph.tsx        # 中央 SVG グラフ描画
│   ├── layout.ts                         # 楕円配置・幾何計算・定数
│   └── transitionNetwork.css             # ページ／グラフ用スタイル
├── data/
│   └── transitionNetworkData.ts          # 型・ダミーデータ・buildTransitionNetwork
└── utils/
    └── copyChartImage.ts                 # PNG コピー／ダウンロード（SVG→Canvas）
```

### 各ファイルの役割

| パス | 役割 |
| --- | --- |
| [`src/pages/TransitionNetworkPage.tsx`](../src/pages/TransitionNetworkPage.tsx) | ページ枠。ヘッダー、戻るリンク、PNG コピー／ダウンロード、`TransitionNetworkView` の配置 |
| [`src/transitionNetwork/TransitionNetworkView.tsx`](../src/transitionNetwork/TransitionNetworkView.tsx) | `nodeCount` / `edgeMinAbs` / ホバー状態を持ち、サマリ・制御・グラフを組み合わせる |
| [`src/transitionNetwork/TransitionNetworkSummary.tsx`](../src/transitionNetwork/TransitionNetworkSummary.tsx) | 左上サマリ（集計項目・ベース金額） |
| [`src/transitionNetwork/TransitionNetworkEdgeControl.tsx`](../src/transitionNetwork/TransitionNetworkEdgeControl.tsx) | 右上：流入/流出線の表示最小値スライダー |
| [`src/transitionNetwork/TransitionNetworkNodeControl.tsx`](../src/transitionNetwork/TransitionNetworkNodeControl.tsx) | 下：ノード数スライダー |
| [`src/transitionNetwork/TransitionNetworkGraph.tsx`](../src/transitionNetwork/TransitionNetworkGraph.tsx) | 中央 SVG（ノード・遷移線・圏外矢印・ツールチップ） |
| [`src/transitionNetwork/layout.ts`](../src/transitionNetwork/layout.ts) | `VIEW_W` / `RADIUS_X` などの定数、楕円配置、エッジ幾何 |
| [`src/transitionNetwork/transitionNetwork.css`](../src/transitionNetwork/transitionNetwork.css) | 検証ページ専用スタイル |
| [`src/data/transitionNetworkData.ts`](../src/data/transitionNetworkData.ts) | `TransitionNode` / `TransitionEdge` 型、ダミーデータ、`buildTransitionNetwork` |
| [`src/utils/copyChartImage.ts`](../src/utils/copyChartImage.ts) | SVG を PNG 化してコピー／ダウンロード（AG Charts API は未使用） |
| [`src/main.tsx`](../src/main.tsx) | `BrowserRouter` で `/transition-network` を登録 |
| [`src/App.tsx`](../src/App.tsx) | 本線から検証ページへの導線リンク |

### 依存関係（概略）

```
main.tsx
  └── TransitionNetworkPage.tsx
        ├── copyChartImage.ts          （PNG 操作）
        └── TransitionNetworkView.tsx
              ├── TransitionNetworkSummary.tsx
              ├── TransitionNetworkEdgeControl.tsx
              ├── TransitionNetworkNodeControl.tsx
              ├── TransitionNetworkGraph.tsx
              │     └── layout.ts
              └── transitionNetworkData.ts
                    （buildTransitionNetwork）
```

ルーティングは [`src/main.tsx`](../src/main.tsx) で `/` と `/transition-network` を定義しています。

## 画面構成

```
┌──────────────────────────────┬─────────────────────────────┐
│ 左上: サマリ                  │ 右上: 流入/流出線の最小値    │
│ （集計項目・ベース金額）       │ （絶対値スライダー）         │
├──────────────────────────────┴─────────────────────────────┤
│                                                             │
│                    中央: ネットワークグラフ（SVG）            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    下: ノード数スライダー（2〜8）             │
└─────────────────────────────────────────────────────────────┘
```

| 領域 | コンポーネント | 役割 |
| --- | --- | --- |
| 左上サマリ | `TransitionNetworkSummary` | 集計の説明（固定テキスト） |
| 右上スライダー | `TransitionNetworkEdgeControl` | 線・圏外矢印の表示最小値 |
| 中央グラフ | `TransitionNetworkGraph` | ノード・遷移線・圏外矢印 |
| 下スライダー | `TransitionNetworkNodeControl` | 表示ノード数（2〜8） |

## データの意味

### ノード（カテゴリ）

| フィールド | 意味 |
| --- | --- |
| `id` | 一意 ID |
| `label` | 表示名 |
| `before` | 前期の値 |
| `after` | 当期の値 |
| `external` | 圏外との純増減（正=流入、負=流出） |

### エッジ（カテゴリ間遷移）

| フィールド | 意味 |
| --- | --- |
| `from` / `to` | 遷移元 / 遷移先ノード ID |
| `value` | 遷移件数 |
| `muted` | （任意）グレー表示用。現状 UI は主にしきい値で非表示 |

### 圏外矢印

- `external > 0` … 圏外から流入
- `external < 0` … 圏外へ流出
- 絶対値が右上しきい値未満なら非表示

## 操作

### 右上: 流入/流出線表示最小値（絶対値）

- 範囲: `0` 〜 `500`（初期値 `50`）
- 絶対値がしきい値未満の遷移線・圏外矢印を非表示

### 下: ノード数

- 範囲: `2` 〜 `8`
- マスタ先頭から指定個数を使い、両端が揃うエッジだけ描画

### PNG コピー／ダウンロード（AG Charts API は未使用）

ページ上部のボタンで:

- **PNGをコピー** … 中央 SVG を PNG 化してクリップボードへ
- **PNGをダウンロード** … 同様にファイルとして保存

**ここでも AG Charts の API（`getImageDataURL` / `download`）は使いません。**  
AG Charts のチャートインスタンスが存在しないため、次の自前処理で PNG 化しています。

```
1. 画面上の svg.transition-network-svg を取得
2. XMLSerializer で SVG 文字列化
3. 画像として読み込み、Canvas に描画
4. canvas.toBlob('image/png') で PNG 化
5. クリップボードへ書き込み、または <a download> で保存
```

実装箇所:

- ページ操作: [`src/pages/TransitionNetworkPage.tsx`](../src/pages/TransitionNetworkPage.tsx)
- 変換処理: [`src/utils/copyChartImage.ts`](../src/utils/copyChartImage.ts) の `copySvgToClipboard` / `downloadSvgAsPng`

## 作成方法（実装の流れ）

```
1. buildTransitionNetwork(nodeCount) でデータ生成
2. layoutNodes / layoutEdges で楕円配置
3. しきい値で visibleEdges をフィルタ
4. TransitionNetworkGraph が SVG 描画
5. Summary / EdgeControl / NodeControl を別領域に配置
```

横に広く見せるため、正円ではなく楕円配置です（`RADIUS_X` / `RADIUS_Y`）。

## AG Charts を使わない理由

描画にもダウンロードにも AG Charts を使わない理由は次のとおりです。

| 観点 | 説明 |
| --- | --- |
| 表現 | 有向遷移＋圏外流入出＋ノード内の前期/当期表示が標準シリーズでは足りない |
| レイアウト | 楕円配置・領域分割 UI を細かく制御したい |
| 検証 | 「Excel ネイティブにできないグラフ」を単独スパイクとして切り出す |
| 画像出力 | AG Charts インスタンスがないため、`getImageDataURL` / `download` は利用不可。SVG→Canvas の自前変換を使う |

## カスタム時のポイント

- 横に広げる: `layout.ts` の `RADIUS_X` / `VIEW_W` を調整
- 実データ: `transitionNetworkData.ts` のプール、または API 結果を同じ型で渡す
- しきい値: `EDGE_MIN_DEFAULT` / `EDGE_MIN_MAX`

## 既知の制約

- データは固定ダミー
- 双方向遷移は線が重なりやすい
- ノード数を増やすと可読性が下がる（しきい値で緩和）
- Excel ネイティブグラフオブジェクト出力は対象外（画像コピーのみ）
