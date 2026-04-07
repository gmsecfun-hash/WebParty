import ReactDOM from 'react-dom/client'
import { App } from '../components/App'
import cssText from '../index.css?inline'
import stylesText from '../styles.css?inline'

// 创建 Shadow DOM 容器（用于贴纸面板）
const panelContainer = document.createElement('div')
panelContainer.id = 'webparty-panel-root'
document.body.appendChild(panelContainer)

// 创建 Shadow DOM
const shadowRoot = panelContainer.attachShadow({ mode: 'open' })

// 注入样式
const style = document.createElement('style')
style.textContent = cssText + '\n' + stylesText
shadowRoot.appendChild(style)

// 创建应用容器
const appContainer = document.createElement('div')
shadowRoot.appendChild(appContainer)

// 创建贴纸渲染容器（在 body 下，不在 Shadow DOM 内）
const stickerContainer = document.createElement('div')
stickerContainer.id = 'webparty-stickers-root'
document.body.appendChild(stickerContainer)

// 渲染 React 应用
ReactDOM.createRoot(appContainer).render(
  <App stickerContainer={stickerContainer} />
)