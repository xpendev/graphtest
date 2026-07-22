import type { AgChartInstance } from 'ag-charts-community'

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('画像の読み込みに失敗しました。'))
    img.src = src
  })
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl)
  return response.blob()
}

function buildPngFilename(prefix: string): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  return `${prefix}-${stamp}.png`
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function copyPngToClipboard(blob: Blob): Promise<void> {
  if (!navigator.clipboard?.write) {
    throw new Error(
      'このブラウザではクリップボードへの画像コピーに対応していません。',
    )
  }

  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
}

export async function copyPngAndTextToClipboard(
  blob: Blob,
  text: string,
): Promise<void> {
  if (!navigator.clipboard?.write) {
    throw new Error(
      'このブラウザではクリップボードへの画像コピーに対応していません。',
    )
  }

  const textBlob = new Blob([text], { type: 'text/plain' })
  // MIME の登録順を PNG -> テキスト で固定
  const clipboardItemData: Record<string, Blob> = {
    'image/png': blob,
    'text/plain': textBlob,
  }
  await navigator.clipboard.write([new ClipboardItem(clipboardItemData)])
}

export async function copyAgChartToClipboard(
  chart: AgChartInstance,
): Promise<void> {
  const dataUrl = await chart.getImageDataURL({ fileFormat: 'image/png' })
  const blob = await dataUrlToBlob(dataUrl)
  await copyPngToClipboard(blob)
}

async function drawSvgOnCanvas(
  ctx: CanvasRenderingContext2D,
  svg: SVGSVGElement,
  containerRect: DOMRect,
): Promise<void> {
  const svgRect = svg.getBoundingClientRect()
  if (svgRect.width === 0 || svgRect.height === 0) return

  const clone = svg.cloneNode(true) as SVGSVGElement
  if (!clone.getAttribute('width')) {
    clone.setAttribute('width', String(svgRect.width))
  }
  if (!clone.getAttribute('height')) {
    clone.setAttribute('height', String(svgRect.height))
  }

  const svgString = new XMLSerializer().serializeToString(clone)
  const svgBlob = new Blob([svgString], {
    type: 'image/svg+xml;charset=utf-8',
  })
  const url = URL.createObjectURL(svgBlob)

  try {
    const img = await loadImage(url)
    ctx.drawImage(
      img,
      svgRect.left - containerRect.left,
      svgRect.top - containerRect.top,
      svgRect.width,
      svgRect.height,
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function renderElementGraphicsToPngBlob(
  element: HTMLElement,
): Promise<Blob> {
  const rect = element.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) {
    throw new Error('コピー対象のグラフが表示されていません。')
  }

  const dpr = window.devicePixelRatio || 1
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(rect.width * dpr)
  canvas.height = Math.round(rect.height * dpr)

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas が利用できません。')
  }

  ctx.scale(dpr, dpr)

  const bg = getComputedStyle(element).backgroundColor
  if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
    ctx.fillStyle = bg
  } else {
    ctx.fillStyle = '#ffffff'
  }
  ctx.fillRect(0, 0, rect.width, rect.height)

  for (const svg of element.querySelectorAll('svg')) {
    await drawSvgOnCanvas(ctx, svg, rect)
  }

  for (const chartCanvas of element.querySelectorAll('canvas')) {
    const chartRect = chartCanvas.getBoundingClientRect()
    ctx.drawImage(
      chartCanvas,
      chartRect.left - rect.left,
      chartRect.top - rect.top,
      chartRect.width,
      chartRect.height,
    )
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error('画像の生成に失敗しました。')),
      'image/png',
    )
  })
}

export async function copyElementGraphicsToClipboard(
  element: HTMLElement,
): Promise<void> {
  const blob = await renderElementGraphicsToPngBlob(element)
  await copyPngToClipboard(blob)
}

export async function downloadElementGraphicsAsPng(
  element: HTMLElement,
  filenamePrefix = 'chart',
): Promise<void> {
  const blob = await renderElementGraphicsToPngBlob(element)
  downloadBlob(blob, buildPngFilename(filenamePrefix))
}

export async function renderSvgToPngBlob(svg: SVGSVGElement): Promise<Blob> {
  const rect = svg.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) {
    throw new Error('コピー対象のグラフが表示されていません。')
  }

  const dpr = window.devicePixelRatio || 1
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(rect.width * dpr)
  canvas.height = Math.round(rect.height * dpr)

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas が利用できません。')
  }

  ctx.scale(dpr, dpr)

  const bg = getComputedStyle(svg).backgroundColor
  if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, rect.width, rect.height)
  }

  await drawSvgOnCanvas(ctx, svg, rect)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error('画像の生成に失敗しました。')),
      'image/png',
    )
  })
}

export async function copySvgToClipboard(svg: SVGSVGElement): Promise<void> {
  const blob = await renderSvgToPngBlob(svg)
  await copyPngToClipboard(blob)
}

export async function downloadSvgAsPng(
  svg: SVGSVGElement,
  filenamePrefix = 'chart',
): Promise<void> {
  const blob = await renderSvgToPngBlob(svg)
  downloadBlob(blob, buildPngFilename(filenamePrefix))
}

export async function downloadAgChartAsPng(
  chart: AgChartInstance,
  filenamePrefix = 'chart',
): Promise<void> {
  const dataUrl = await chart.getImageDataURL({ fileFormat: 'image/png' })
  const blob = await dataUrlToBlob(dataUrl)
  downloadBlob(blob, buildPngFilename(filenamePrefix))
}
