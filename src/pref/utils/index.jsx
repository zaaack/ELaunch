export function stopEvent(e) {
  e.stopPropagation()
  e.preventDefault()
}

export function loadCss() {
  window.addEventListener('load', () => {
    const csses = [
      'https://fonts.googleapis.com/css?family=Roboto',
      'https://fonts.googleapis.com/icon?family=Material+Icons',
    ]
    if (navigator.language === 'zh-CN') {
      csses.push('https://cdn.bootcss.com/material-design-icons/3.0.1/iconfont/material-icons.min.css')
    }
    csses.forEach(css => {
      const link = document.createElement('link')
      link.href = css
      link.rel = 'stylesheet'
      link.charset = 'utf-8'
      document.head.appendChild(link)
    })
  })
}
