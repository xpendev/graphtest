/**
 * 流出入差ランキング。
 * GET /api/brand-diverging?size=n&subject=ブランドA
 * size = 相手ブランド数（1〜7）
 * subject = 主語ブランド
 */

export const SIZE_MIN = 1
export const SIZE_MAX = 7
export const SIZE_DEFAULT = 7

/** 主語ブランド候補（A→H 順。API と同じ並び） */
export const SUBJECT_OPTIONS = [
  'ブランドA',
  'ブランドB',
  'ブランドC',
  'ブランドD',
  'ブランドE',
  'ブランドF',
  'ブランドG',
  'ブランドH',
] as const

export const SUBJECT_DEFAULT: string = SUBJECT_OPTIONS[0]

export type BrandDivergingRow = {
  label: string
  /** 流入（正の値） */
  inflow: number
  /** 流出（正の値。チャート側で負方向に描画） */
  outflow: number
}

export type BrandDivergingSample = {
  size: number
  /** 分析の主語ブランド */
  subject: string
  /** 主語候補一覧 */
  subjects: string[]
  meta: { title: string }
  rows: BrandDivergingRow[]
}

export function clampSize(size: number): number {
  return Math.min(SIZE_MAX, Math.max(SIZE_MIN, Math.floor(size)))
}

export async function fetchBrandDiverging(
  size: number,
  subject: string,
): Promise<BrandDivergingSample> {
  const n = clampSize(size)
  const params = new URLSearchParams({
    size: String(n),
    subject,
  })
  const response = await fetch(`/api/brand-diverging?${params}`)
  if (!response.ok) {
    throw new Error(
      `流出入差データの取得に失敗しました（HTTP ${response.status}）。`,
    )
  }
  return (await response.json()) as BrandDivergingSample
}
