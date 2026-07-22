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

async function copyPngToClipboard(blob: Blob): Promise<void> {
  if (!navigator.clipboard?.write) {
    throw new Error(
      'このブラウザではクリップボードへの画像コピーに対応していません。',
    )
  }

  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
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

async function renderSvgToPngBlob(svg: SVGSVGElement): Promise<Blob> {
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

export async function copyScratchSvgToClipboard(
  svg: SVGSVGElement,
): Promise<void> {
  const blob = await renderSvgToPngBlob(svg)
  await copyPngToClipboard(blob)
}

export async function downloadScratchSvgAsPng(
  svg: SVGSVGElement,
  filenamePrefix = 'chart',
): Promise<void> {
  const blob = await renderSvgToPngBlob(svg)
  downloadBlob(blob, buildPngFilename(filenamePrefix))
}
