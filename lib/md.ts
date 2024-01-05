import MD from 'markdown-it'
import 'markdown-it-latex/dist/index.css'

const markdown = new MD({
  html: true,
  breaks: true
})
  .use(require('markdown-it-math'))
  .use(require('markdown-it-texmath'), {
    engine: require('katex'),
    delimiters: 'dollars',
    katexOptions: {
      throwOnError: false,
      displayMode: true,
      macros: { '\\RR': '\\mathbb{R}' }
    }
  })

export function renderMD(content?: string) {
  return markdown.render((content || '').replaceAll('$$$', '$$ $'))
}
