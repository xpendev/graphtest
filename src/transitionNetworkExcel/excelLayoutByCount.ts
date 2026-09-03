/**
 * Excel マクロ描画用の配置中心（ドキュメント座標 / pt）。
 * GoJS 画面側の固定中心 (600, 280) からの差分だけをここで管理する。
 *
 * 人間が調整する欄: cx / cy（1〜50）
 * 目安: 左上はみ出しを避けるなら
 *   cx ≧ GoJS の radiusX + 84（ノード半幅）+ 余白
 *   cy ≧ GoJS の radiusY + 32 + 56（圏外）+ 余白
 */

/** goJsHelpers の CX / CY と揃える（ずらす基準） */
export const GOJS_LAYOUT_CENTER = { x: 600, y: 280 } as const

type ExcelCenter = { cx: number; cy: number }

const EXCEL_CENTER_FALLBACK: ExcelCenter = { cx: 1064, cy: 518 }

/**
 * ノード数ごとの Excel 描画中心。
 * 位置を変えたいときは該当件数の cx / cy だけ書き換える。
 */
const EXCEL_CENTER_BY_COUNT: Record<number, ExcelCenter> = {
  1: { cx: 600, cy: 280 },
  2: { cx: 600, cy: 280 },
  3: { cx: 600, cy: 280 },
  4: { cx: 600, cy: 280 },
  5: { cx: 600, cy: 280 },
  6: { cx: 600, cy: 280 },
  7: { cx: 600, cy: 280 },
  8: { cx: 600, cy: 298 },
  9: { cx: 600, cy: 318 },
  10: { cx: 600, cy: 318 },
  11: { cx: 600, cy: 328 },
  12: { cx: 600, cy: 348 },
  13: { cx: 600, cy: 368 },
  14: { cx: 600, cy: 388 },
  15: { cx: 614, cy: 408 },
  16: { cx: 664, cy: 428 },
  17: { cx: 714, cy: 448 },
  18: { cx: 764, cy: 468 },
  19: { cx: 794, cy: 498 },
  20: { cx: 814, cy: 518 },
  21: { cx: 844, cy: 518 },
  22: { cx: 874, cy: 518 },
  23: { cx: 894, cy: 518 },
  24: { cx: 914, cy: 518 },
  25: { cx: 944, cy: 518 },
  26: { cx: 974, cy: 518 },
  27: { cx: 994, cy: 518 },
  28: { cx: 1014, cy: 518 },
  29: { cx: 1034, cy: 518 },
  30: { cx: 1064, cy: 518 },
  31: { cx: 1094, cy: 568 },
  32: { cx: 1124, cy: 618 },
  33: { cx: 1154, cy: 618 },
  34: { cx: 1184, cy: 618 },
  35: { cx: 1214, cy: 618 },
  36: { cx: 1244, cy: 668 },
  37: { cx: 1274, cy: 668 },
  38: { cx: 1304, cy: 668 },
  39: { cx: 1334, cy: 668 },
  40: { cx: 1364, cy: 668 },
  41: { cx: 1394, cy: 718 },
  42: { cx: 1424, cy: 718 },
  43: { cx: 1454, cy: 718 },
  44: { cx: 1484, cy: 718 },
  45: { cx: 1514, cy: 718 },
  46: { cx: 1544, cy: 768 },
  47: { cx: 1574, cy: 768 },
  48: { cx: 1604, cy: 768 },
  49: { cx: 1634, cy: 768 },
  50: { cx: 1664, cy: 768 },
}

/** 件数に応じた Excel 中心への平行移動量（dx, dy） */
export function excelLayoutOffset(nodeCount: number): { dx: number; dy: number } {
  const n = Math.max(1, Math.floor(nodeCount))
  const center = EXCEL_CENTER_BY_COUNT[n] ?? EXCEL_CENTER_FALLBACK
  return {
    dx: center.cx - GOJS_LAYOUT_CENTER.x,
    dy: center.cy - GOJS_LAYOUT_CENTER.y,
  }
}

/** 点を (dx, dy) だけずらす */
export function shiftPoint(
  point: { x: number; y: number },
  dx: number,
  dy: number,
): { x: number; y: number } {
  return { x: point.x + dx, y: point.y + dy }
}
