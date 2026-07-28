# スクラッチ学習ガイド（担当者向けとっかかり）

遷移ネットワークの **スクラッチ実装**（`src/transitionNetworkScratch/`）を担当・引き継ぐ人向けの学習ガイドです。  
各フェーズに **概要** と **詳細** があります。上から順に進めてください。

**前提:** React / TypeScript は分かる。SVG は未習熟でも可。  
**関連:** [component-scratch.md](./component-scratch.md) / [transition-network.md](./transition-network.md)

```text
Data（何を）→ Helpers（どこに）→ Styles（何色で）→ Graph（どう描く）→ Page（組み立て）→ Png（書き出し）
```

---

## ドメイン用語（全フェーズ共通）

| 言葉 | 意味 |
| --- | --- |
| `ScratchNode` | カテゴリ1つ＝画面上の楕円1個 |
| `before` / `after` | 前期・当期の購入量（ピクセルや相対座標ではない） |
| `ScratchEdge` | カテゴリ間遷移＝有向矢印1本。`from` / `to` / `value`（件数） |
| `external` | 圏外との出入り。Edge ではなく **Node の属性** |
| `edgeMinAbs` | 表示最小値。未満は非表示ではなく **グレー** |

---

## コンポーネント関連（先に見る図）

```mermaid
flowchart TB
  main["main.tsx<br/>ルーティング"]
  page["ScratchPage.tsx<br/>ページ枠・state"]
  graph["ScratchGraph.tsx<br/>SVG描画"]
  data["scratchData.ts<br/>材料（Node/Edge）"]
  helpers["scratchHelpers.ts<br/>座標計算"]
  styles["scratchStyles.ts<br/>色定数"]
  png["scratchPng.ts<br/>PNG化"]

  main --> page
  page --> data
  page --> helpers
  page --> graph
  page --> png
  graph --> helpers
  graph --> styles
```

| ファイル | 一言 |
| --- | --- |
| `ScratchPage.tsx` | 1ページの枠。各モジュールを組み立て、状態を持つ |
| `scratchData.ts` | 表示するデータ。どこからどこへ、の情報も持つ |
| `scratchHelpers.ts` | どこに描くか（座標を return） |
| `scratchStyles.ts` | スタイル（色など） |
| `ScratchGraph.tsx` | SVG の定義・描画 |
| `scratchPng.ts` | PNG コピー／ダウンロード |

---

## フェーズ0 — 地図を掴む

### 概要

| 項目 | 内容 |
| --- | --- |
| 目的 | 6ファイルの役割と画面要素の対応を知る |
| 対象 | フォルダ全体・画面操作 |
| 所要目安 | 半日 |
| やらないこと | コード精読、SVG・数式 |

### 詳細

1. [component-scratch.md](./component-scratch.md) の構成図を読む  
2. `npm run dev` → `/transition-network` を開く  
3. 画面で指差し確認する  

| 画面 | 対応する概念 |
| --- | --- |
| 青い楕円 | Node（カテゴリ） |
| 楕円同士の矢印 | Edge（遷移） |
| 楕円の外側の短い矢印 | 圏外（`external`） |
| 薄い線 | しきい値未満（グレー） |
| 下の数値入力＋「表示」 | ノード数を確定してグラフ描画 |
| 右上のスライダー | 流入/流出線の表示最小値 |

4. 自分にクイズする  

- 描画本体は？ → `ScratchGraph.tsx`  
- 前期・当期の数字の定義は？ → `scratchData.ts`  
- 位置計算は？ → `scratchHelpers.ts`  
- 色は？ → `scratchStyles.ts`  
- state を持つのは？ → `ScratchPage.tsx`  

**完了の目安:** 「Page が状態を持ち、Data で材料、Helpers で位置、Graph が SVG、Styles は色、Png は書き出し」と言える。

---

## フェーズ1 — SVG基礎

### 概要

| 項目 | 内容 |
| --- | --- |
| 目的 | React の外で SVG の基本を体感する |
| 対象 | `svg` / `ellipse` / `line` / `defs` / `marker` / `path` |
| 所要目安 | 2〜4日 |

### 詳細

#### 必須概念

1. `<svg viewBox="0 0 W H">` … 論理座標のキャンバス（紙）  
2. 原点は **左上**。x は右、y は **下**（数学のグラフと逆）  
3. `<ellipse cx cy rx ry>` … ノード  
4. `<line x1 y1 x2 y2>` … 矢印の幹  
5. `<text>` … ラベル  
6. `<defs>` … 部品置き場（ここに書いただけでは画面に出ない）  
7. `<marker>` … 線の先端に付ける矢じりテンプレ  
8. `<path d="...">` … 矢じりの形  
9. `marker-end="url(#id)"` … 線から marker を参照  

#### `path` の `d` の読み方（矢じりの例）

```text
d="M 0 1.5 L 9 5 L 0 8.5 Z"
```

| 命令 | 意味 |
| --- | --- |
| `M 0 1.5` | (0, 1.5) へ移動（線は引かない） |
| `L 9 5` | (9, 5) まで線 |
| `L 0 8.5` | (0, 8.5) まで線 |
| `Z` | 始点に戻って閉じる → 右向き三角 |

#### 手を動かす

CodePen や HTML で、楕円2つ＋`defs`/`marker`＋`line` を描く。  
その後 `ScratchGraph.tsx` 先頭の `<defs>`〜`<marker>` だけチラ見し、同じ構造だと気づく。

**完了の目安:** `defs`・`marker`・`path`・`line` の役割を、コードを見ずに説明できる。

---

## フェーズ2 — Data（何を描くか）

### 概要

| 項目 | 内容 |
| --- | --- |
| 目的 | ノード／エッジの材料と切り出しを理解する |
| 対象 | `scratchData.ts` |
| 所要目安 | 1日 |
| やらないこと | 座標計算、SVG 描画 |

### 詳細

#### 型

- **`ScratchNode`** … `id` / `label` / `before` / `after` / `external`  
- **`ScratchEdge`** … `from` / `to` / `value`（＋任意の `muted`）

#### 倉庫

- `NODE_POOL` … ノード候補（最大30）  
- `EDGE_POOL` … 矢印候補（全部）  

常に在庫として持っており、画面に全部出すわけではない。

#### `buildScratchNetwork(count)` — 倉庫から今回分だけ取り出す

描画はしない。戻り値は材料の `{ nodes, edges }` のみ。

1. `count` を 2〜30 に丸めて `n` にする  
2. `NODE_POOL.slice(0, n)` で先頭 n ノード  
3. その id 名簿を作り、`EDGE_POOL` から **from も to も名簿にいる矢印だけ**残す  

たとえ: 名簿30人・メール全記録のうち、「会議室に入れる n 人」と「その n 人同士のメール」だけ残す。

ノード数4の例:

- 残るノード: `other`, `other-unselected`, `cat-a`, `cat-b`  
- `cat-b → cat-c` は消える（`cat-c` がいない）  

#### `isGrayEdge`

`value` の絶対値が `edgeMinAbs` 未満ならグレー対象（消さない）。

**完了の目安:** Data は材料係。座標も描画も持たない。切り出しの3手順が言える。

---

## フェーズ3 — Helpers（どこに置くか）

### 概要

| 項目 | 内容 |
| --- | --- |
| 目的 | 材料に画面座標を付けた **戻り値** を理解する |
| 対象 | `scratchHelpers.ts` |
| 所要目安 | 3〜5日（最重要） |
| やらないこと | SVG JSX の記述 |

```text
buildScratchNetwork → 材料（座標なし）
        ↓
layoutNodes / layoutEdges → 座標付き配列を return
        ↓
ScratchGraph が受け取る（描画はフェーズ5）
```

### 詳細

#### 定数

| 定数 | 役割 |
| --- | --- |
| `VIEW_W` / `VIEW_H` | SVG の紙サイズ（viewBox と揃える） |
| `CX` / `CY` | 配置の中心 |
| `NODE_W` / `NODE_H` | 楕円ノード1個の大きさ |
| `RADIUS_X` / `RADIUS_Y` | ノードを並べる大きな楕円軌道の半径 |

#### 型（戻り値）

- `LaidOutNode` = `ScratchNode` + `center: { x, y }`  
- `LaidOutEdge` = 元 Edge + `fromLabel` / `toLabel` + `geom`（`start` / `end` / `mid` / `labelPos`）

#### 読む順と役割

| 順 | 関数 | 役割 |
| --- | --- | --- |
| 1 | `nodeCenters` | 軌道上に等間隔の点を返す |
| 2 | `layoutNodes` | 各 Node に `center` を付けて return |
| 3 | `angleBetween` / `midpoint` | 向き・中点 |
| 4 | `ellipseEdgePoint` | 楕円の **縁** の点（線が中心から生えないように） |
| 5 | `buildEdgeGeometry` | 矢印1本の始終点・ラベル位置 |
| 6 | `layoutEdges` | 全矢印に `geom` を付けて return |
| 7 | `externalArrow` | 圏外矢印の始終（`external` 用） |
| 8 | `formatInt` / `formatDelta` | 表示用整形（軽い） |

#### `nodeCenters` の要点

```ts
const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count
x = CX + RADIUS_X * Math.cos(angle)
y = CY + RADIUS_Y * Math.sin(angle)
```

- `(i * 2π) / count` … 一周を等分して i 番目  
- `-Math.PI / 2` … **真上スタート**のためのずらし（円を描くこと自体には必須ではない）  
- SVG は y が下向きなので、符号と画面の上下の対応に注意  

#### 手を動かす

- ノード3〜4個のとき、上から時計回りになることを画面で確認  
- DevTools で `ellipse` の `cx`/`cy` が `center` と対応することを見る  

**完了の目安:** Data＝材料、Helpers＝場所（return）、Graph＝描画、と区別できる。配置を変えたいとき `RADIUS_*` や `nodeCenters` を見に行ける。

---

## フェーズ4 — Styles（見た目の定数）

### 概要

| 項目 | 内容 |
| --- | --- |
| 目的 | 色の定義場所を知る |
| 対象 | `scratchStyles.ts` |
| 所要目安 | 半日 |

### 詳細

- `scratchStyles` オブジェクトに、キャンバス背景・ノードグラデーション・線色・グレー・圏外色・ラベル色などがまとまっている  
- `ScratchGraph` が `scratchStyles.xxx` を参照する  
- 色を変える作業は、原則ここを触ればよい（Graph の構造は触らない）  

**手を動かす:** ノード色を1つだけ変え、画面で確認して戻す。  

**完了の目安:** 「青を変えたい → Styles」と言える。

---

## フェーズ5 — Graph（どう描くか）

### 概要

| 項目 | 内容 |
| --- | --- |
| 目的 | 座標付きデータを SVG JSX で描く |
| 対象 | `ScratchGraph.tsx` |
| 所要目安 | 4〜6日 |

### 詳細

#### 読み順

1. props（`nodes` / `edges` / `edgeMinAbs` / hover / tooltip コールバック）  
2. `<svg viewBox={...}>` が Helpers の `VIEW_*` と一致していること  
3. `<defs>` の marker（通常／muted／圏外／圏外 muted）  
4. `edges.map` … `<line>` ＋透明ヒット領域＋件数テキスト  
5. `nodes.map` … 圏外矢印 → `<ellipse>` → 中の `<text>`  
6. ツールチップ（SVG の外の HTML）  

#### 画面と JSX の対応

| 画面 | JSX |
| --- | --- |
| 青い楕円 | `<ellipse>`（`center` → `cx`/`cy`） |
| 遷移矢印 | `<line markerEnd=...>`（`geom.start`/`end`） |
| グレー線 | `edgeMinAbs` 未満の分岐（色・opacity） |
| 圏外矢印 | `externalArrow(...)` の結果を `<line>` |
| ホバー | React の `onMouseEnter` / `onMouseLeave`（jQuery ではない） |

#### 手を動かす

- `rx`/`ry` を一時変更して戻す  
- しきい値を変えてグレーを観察  
- ツールチップ文言を1行足して戻す  

**完了の目安:** ブロック単位で「何のための JSX か」を説明できる。

---

## フェーズ6 — Page（組み立て・状態）

### 概要

| 項目 | 内容 |
| --- | --- |
| 目的 | state と Data→Helpers→Graph のつなぎを理解する |
| 対象 | `ScratchPage.tsx` |
| 所要目安 | 1〜2日 |

### 詳細

現行 UI の要点:

- **ノード数:** テキストボックス＋「表示」ボタン（スライダーではない）  
- 入力値（draft）と、ボタン確定後の表示用ノード数は分ける  
- 未表示時はプレースホルダ、表示後に `ScratchGraph` を出す  
- **右上:** 流入/流出線の表示最小値スライダー（`edgeMinAbs`）  
- PNG コピー／ダウンロードは `scratchPng` を呼ぶだけ  

データの旅:

```text
表示ボタン
  → buildScratchNetwork(n)
  → layoutNodes / layoutEdges
  → <ScratchGraph ... />
```

Page はオーケストレーション役。描画ロジックは Graph、材料は Data、座標は Helpers。

**完了の目安:** 「Page は組み立て、描画は Graph」と言える。再計算のトリガ（表示確定・しきい値変更）が分かる。

---

## フェーズ7 — Png（書き出し）

### 概要

| 項目 | 内容 |
| --- | --- |
| 目的 | SVG を PNG にしてコピー／保存する流れを知る |
| 対象 | `scratchPng.ts` |
| 所要目安 | 1〜2日（後回し可） |

### 詳細

おおよその流れ:

1. 画面上の SVG DOM を取得・シリアライズ  
2. Image / Canvas に描画  
3. PNG の Blob を得る  
4. ファイルダウンロード、または `ClipboardItem` でコピー  

**完了の目安:** なぜ「SVG のまま」ではなく PNG 化するのか、貼り付け先の都合として一言で言える。

---

## フェーズ8 — 定着

### 概要

| 項目 | 内容 |
| --- | --- |
| 目的 | 小さな変更ができ、触るファイルを自分で選べる |
| 対象 | フォルダ全体 |
| 所要目安 | 2〜3日 |

### 詳細

次のうち2つ以上を自分でやる:

1. `NODE_POOL` にカテゴリを1つ足し、エッジも1本足して表示する  
2. Styles だけでノード色を変える（Graph を触らない）  
3. `RADIUS_X` を変えて輪の大きさが変わることを確認する  
4. A4 1枚で「Data→Helpers→Graph」を自分の言葉で書く  

#### 担当者としてのゴールチェック

- [ ] Node / Edge / external / before・after を混同しない  
- [ ] viewBox・楕円配置・線が縁から出る意図が分かる  
- [ ] defs/marker と line の関係が分かる  
- [ ] しきい値グレーが「非表示ではない」ことをコードで示せる  
- [ ] 機能追加時に Data / Helpers / Styles / Graph / Page のどれを触るか判断できる  

---

## 推奨スケジュール（学習時間）

| 週 | 内容 |
| --- | --- |
| 1 | フェーズ 0〜1 |
| 2 | フェーズ 2〜3（ここを厚く） |
| 3 | フェーズ 4〜5 |
| 4 | フェーズ 6〜8 |

集中なら約2〜3週間、業務の合間なら約3〜4週間が目安。  
（実装見積の工数とは別。こちらは理解のための学習時間。）

---

## つまずきやすいポイント

| 症状 | 確認すること |
| --- | --- |
| y 座標の感覚がおかしい | SVG は y が下向き |
| 線がノード中心から生えると思った | `ellipseEdgePoint` で縁に出している |
| グレーが消えたように見える | 色と opacity。`edgeMinAbs` |
| 圏外が Edge プールにない | `node.external` 由来 |
| before/after がピクセルに見える | 購入量の絶対値 |
| `-Math.PI / 2` が必須に見える | 真上スタート用のずらし |

---

## 変更したいとき（早見）

| やりたいこと | 主に触るファイル |
| --- | --- |
| カテゴリ・遷移データの追加 | `scratchData.ts` |
| 配置・線の始終・圏外の向き | `scratchHelpers.ts` |
| 色だけ変える | `scratchStyles.ts` |
| ラベル文言・ホバー・SVG構造 | `ScratchGraph.tsx` |
| 入力UI・表示タイミング・しきい値UI | `ScratchPage.tsx` |
| PNG 出力の挙動 | `scratchPng.ts` |
