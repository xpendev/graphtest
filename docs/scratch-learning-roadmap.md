# スクラッチ実装 — 完全理解ロードマップ

**担当者向けの本編（概要＋全フェーズ詳細）は次を使ってください。**

→ [scratch-learning-phases-overview.md](./scratch-learning-phases-overview.md)

このファイルは短い入口用です。手順・完了条件・つまずきポイントの詳細は上記に集約しています。

## 全体の流れ（超要約）

```text
Data（何を）→ Helpers（どこに）→ Styles（何色で）→ Graph（どう描く）→ Page（組み立て）→ Png（書き出し）
```

| フェーズ | 内容 |
| --- | --- |
| 0 | 地図（ファイル関係・画面） |
| 1 | SVG 基礎 |
| 2 | `scratchData.ts` |
| 3 | `scratchHelpers.ts`（最重要） |
| 4 | `scratchStyles.ts` |
| 5 | `ScratchGraph.tsx` |
| 6 | `ScratchPage.tsx` |
| 7 | `scratchPng.ts` |
| 8 | 定着課題 |

構成図: [component-scratch.md](./component-scratch.md)
