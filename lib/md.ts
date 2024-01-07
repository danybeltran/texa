import MD from 'markdown-it'
import markdownItLatex from 'markdown-it-latex'

const markdown = new MD({
  html: true,
  breaks: true
})
  .use(require('markdown-it-math'))
  .use(markdownItLatex)
  .use(require('@agoose77/markdown-it-mermaid').default)
  .use(require('markdown-it-texmath'), {
    engine: require('katex'),
    delimiters: 'dollars',
    katexOptions: {
      throwOnError: false,
      // displayMode: true,
      macros: { '\\RR': '\\mathbb{R}' }
    }
  })

export function renderMD(content?: string) {
  return markdown.render(
    (content || '')
      .replaceAll('$$$', '$$ $')
      .replaceAll('<tex>', "<div class='tex-content'>\n ")
      .replaceAll('<texc>', '</div>')
      .replaceAll('<center>', '<center>\n')
      .replaceAll('<centerc>', ' </center>')
      .replaceAll('<justify>', '<div style="text-align: justify">')
      .replaceAll('<justifyc>', '</div>')
      .replaceAll('<left>', '<div style="text-align: left">')
      .replaceAll('<leftc>', '</div>')
      .replaceAll('<right>', '<div style="text-align: right">')
      .replaceAll('<rightc>', '</div>')
  )
}
