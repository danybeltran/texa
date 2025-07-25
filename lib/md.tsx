import { renderToString } from 'react-dom/server'
import MD from 'markdown-it'
import markdownItLatex from 'markdown-it-latex'
import { $searchParams, setURLParams } from 'http-react'
import hljs from 'highlight.js' // Import highlight.js

// You might need to adjust your build system (webpack/rollup) to handle CSS imports for server-side rendering.
// For client-side rendering, you would typically import a theme like this:
// import 'highlight.js/styles/github.css';
// For SSR, ensure the necessary CSS is included in your HTML template when serving the page.

const markdown = new MD({
  html: true,
  breaks: true,
  highlight: function (str, lang) {
    // Custom highlight function for markdown-it
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (__) {
        // Fallback if there's an issue with the specific language highlighting
      }
    }

    // Try to auto-detect the language if a specific one wasn't provided or failed
    try {
      return hljs.highlightAuto(str).value
    } catch (__) {
      // Fallback if auto-detection also fails
    }

    return '' // Return empty string if no highlighting is possible, markdown-it will escape it
  }
})
  // You no longer need markdown-it-highlightjs since you're using markdown-it's built-in highlight option
  // .use(require('markdown-it-highlightjs'), {
  //   register: {
  //     cypher: require('highlightjs-cypher')
  //   }
  // })
  .use(require('@traptitech/markdown-it-katex'))
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
  try {
    return markdown.render(
      (content || '')
        .split('\n')
        .map(line => {
          const trimmedLine = line.trim()
          if (trimmedLine.startsWith('https://www.youtu')) {
            const id = $searchParams(trimmedLine).v
            let embedUrl = setURLParams('https://www.youtube.com/embed/[id]', {
              id
            })

            const embedded = renderToString(
              <iframe
                width='100%'
                style={{
                  aspectRatio: '16/9'
                }}
                src={embedUrl}
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                allowFullScreen
              ></iframe>
            )

            return embedded
          }

          if (
            trimmedLine.endsWith('.jpg') ||
            trimmedLine.endsWith('.png') ||
            trimmedLine.endsWith('.jpeg') ||
            trimmedLine.endsWith('.svg') ||
            trimmedLine.endsWith('.webp')
          ) {
            return renderToString(<img src={trimmedLine} alt='' />)
          }

          return line
        })
        .join('\n')
        .replaceAll('$$$', '$$ $')
        .replaceAll('<tex>', "<div class='tex-content'>\n ")
        .replaceAll('</tex>', '</div>')
        .replaceAll('<center>', '<center>\n')
        .replaceAll('</center>', ' </center>')
        .replaceAll('<justify>', '<div style="text-align: justify">')
        .replaceAll('</justify>', '</div>')
        .replaceAll('<left>', '<div style="text-align: left">')
        .replaceAll('</left>', '</div>')
        .replaceAll('<right>', '<div style="text-align: right">')
        .replaceAll('</right>', '</div>')
        .replaceAll('<mermaid>', '```mermaid')
        .replaceAll('</mermaid>', '```')
        .replaceAll('<math>', '```math')
        .replaceAll('</math>', '```')
        .replace(
          /\<(newpage |newpage)\/\>/gi,
          '<div class="code-page-break"><p style="page-break-after: always;"> </p><p style="page-break-before: always;"> </p></div>'
        )
    )
  } catch (err) {
    console.log(err)
    return 'Failed to render preview'
  }
}
