import type { Connect, Plugin } from 'vite'

const SIZE_MIN = 1
const SIZE_MAX = 7

/**
 * 主語候補（A→H 順）。
 * 流入／流出は「ブランド間の有向遷移行列」から切り出す。
 *   主語S・相手P のとき
 *   inflow  = P→S（相手から主語へ）
 *   outflow = S→P（主語から相手へ）
 * したがって「主語AでBから流入 X」⇔「主語BでAへ流出 X」が常に一致する。
 */
const SUBJECTS = [
  'ブランドA',
  'ブランドB',
  'ブランドC',
  'ブランドD',
  'ブランドE',
  'ブランドF',
  'ブランドG',
  'ブランドH',
] as const

type Brand = (typeof SUBJECTS)[number]

/** from → to の遷移量（対角は使わない） */
const TRANSITION: Record<Brand, Partial<Record<Brand, number>>> = {
  ブランドA: {
    ブランドB: 25,
    ブランドC: 18,
    ブランドD: 40,
    ブランドE: 12,
    ブランドF: 22,
    ブランドG: 15,
    ブランドH: 30,
  },
  ブランドB: {
    ブランドA: 80,
    ブランドC: 28,
    ブランドD: 35,
    ブランドE: 20,
    ブランドF: 16,
    ブランドG: 24,
    ブランドH: 14,
  },
  ブランドC: {
    ブランドA: 30,
    ブランドB: 22,
    ブランドD: 45,
    ブランドE: 18,
    ブランドF: 26,
    ブランドG: 11,
    ブランドH: 19,
  },
  ブランドD: {
    ブランドA: 60,
    ブランドB: 32,
    ブランドC: 20,
    ブランドE: 28,
    ブランドF: 15,
    ブランドG: 21,
    ブランドH: 17,
  },
  ブランドE: {
    ブランドA: 12,
    ブランドB: 28,
    ブランドC: 24,
    ブランドD: 36,
    ブランドF: 19,
    ブランドG: 27,
    ブランドH: 13,
  },
  ブランドF: {
    ブランドA: 18,
    ブランドB: 14,
    ブランドC: 22,
    ブランドD: 16,
    ブランドE: 25,
    ブランドG: 33,
    ブランドH: 29,
  },
  ブランドG: {
    ブランドA: 10,
    ブランドB: 25,
    ブランドC: 17,
    ブランドD: 23,
    ブランドE: 31,
    ブランドF: 20,
    ブランドH: 27,
  },
  ブランドH: {
    ブランドA: 45,
    ブランドB: 19,
    ブランドC: 27,
    ブランドD: 21,
    ブランドE: 14,
    ブランドF: 23,
    ブランドG: 18,
  },
}

/**
 * 本番バックエンドを模した API。
 * GET /api/brand-diverging?size=7&subject=ブランドA
 */
export function brandDivergingApiPlugin(): Plugin {
  return {
    name: 'brand-diverging-api',
    configureServer(server) {
      server.middlewares.use(apiHandler())
    },
    configurePreviewServer(server) {
      server.middlewares.use(apiHandler())
    },
  }
}

function apiHandler(): Connect.NextHandleFunction {
  return (req, res, next) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    if (url.pathname !== '/api/brand-diverging') {
      next()
      return
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.statusCode = 405
      res.end()
      return
    }

    const size = clampSize(url.searchParams.get('size'))
    const subject = resolveSubject(url.searchParams.get('subject'))
    const body = JSON.stringify(buildSample(size, subject), null, 2)

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    if (req.method === 'HEAD') {
      res.end()
      return
    }
    res.end(body)
  }
}

function clampSize(raw: string | null): number {
  const n = Number(raw ?? SIZE_MAX)
  if (!Number.isFinite(n)) return SIZE_MAX
  return Math.min(SIZE_MAX, Math.max(SIZE_MIN, Math.floor(n)))
}

function resolveSubject(raw: string | null): Brand {
  if (raw && (SUBJECTS as readonly string[]).includes(raw)) {
    return raw as Brand
  }
  return SUBJECTS[0]
}

function flow(from: Brand, to: Brand): number {
  if (from === to) return 0
  return TRANSITION[from][to] ?? 0
}

function buildSample(size: number, subject: Brand) {
  const counterparts = SUBJECTS.filter((brand) => brand !== subject).slice(
    0,
    size,
  )
  const rows = counterparts.map((partner) => ({
    label: partner,
    /** 相手 → 主語 */
    inflow: flow(partner, subject),
    /** 主語 → 相手 */
    outflow: flow(subject, partner),
  }))

  return {
    size,
    subject,
    subjects: [...SUBJECTS],
    meta: { title: `${subject}（流入／流出）` },
    rows,
  }
}
