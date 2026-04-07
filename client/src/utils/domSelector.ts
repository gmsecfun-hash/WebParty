/**
 * 生成 DOM 元素的唯一 CSS 选择器路径
 */
export function generateUniqueSelector(element: Element): string {
  if (element.id) {
    return `#${element.id}`
  }

  const path: string[] = []
  let current: Element | null = element

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase()

    // 如果有唯一类名，添加第一个类
    if (current.className && typeof current.className === 'string') {
      const classes = current.className.trim().split(/\s+/).filter(c => c)
      if (classes.length > 0) {
        selector += `.${classes[0]}`
      }
    }

    // 计算同级元素中的索引
    const parent = current.parentElement
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        child => child.tagName === current!.tagName
      )
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1
        selector += `:nth-of-type(${index})`
      }
    }

    path.unshift(selector)
    current = current.parentElement
  }

  return path.join(' > ')
}

/**
 * 根据 CSS 选择器查找元素
 */
export function findElementBySelector(selector: string): Element | null {
  try {
    return document.querySelector(selector)
  } catch (e) {
    console.error('Invalid selector:', selector, e)
    return null
  }
}

/**
 * 计算元素相对于文档的偏移量
 */
export function getElementOffset(element: Element): { top: number; left: number } {
  const rect = element.getBoundingClientRect()
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
  }
}