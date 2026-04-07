import html2canvas from 'html2canvas'

export async function takeScreenshot(): Promise<void> {
  try {
    // 截取整个页面
    const canvas = await html2canvas(document.body, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scale: window.devicePixelRatio || 1,
    })

    // 添加水印
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const watermarkText = 'WebParty'
      const fontSize = 20
      const padding = 10

      ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'

      // 右下角位置
      const textWidth = ctx.measureText(watermarkText).width
      const x = canvas.width - textWidth - padding * 2
      const y = canvas.height - padding * 2

      // 绘制半透明背景
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.fillRect(x - padding, y - fontSize - padding, textWidth + padding * 2, fontSize + padding * 2)

      // 绘制文字
      ctx.fillStyle = 'rgba(59, 130, 246, 0.8)'
      ctx.fillText(watermarkText, x, y)
    }

    // 转换为图片并下载
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `webparty-screenshot-${Date.now()}.png`
    link.click()
  } catch (error) {
    console.error('Screenshot failed:', error)
  }
}