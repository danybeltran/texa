import { renderToString } from 'react-dom/server'
import MD from 'markdown-it'
import { $searchParams, setURLParams } from 'http-react'
import hljs from 'highlight.js' // Import highlight.js

const fonts = {
  pica: 'pica',
  roboto: 'roboto',
  raleway: 'raleway',
  montserrat: 'montserrat',
  courier: 'courier',
  newsreader: 'newsreader',
  poppins: 'poppins',
  geist: 'geist',
  dmsans: 'dmsans'
}

// Custom slugify function to replace the markdown-it-slugify package
function slugify(s) {
  // Convert to lowercase, remove non-word characters and spaces,
  // and replace spaces with hyphens.
  return encodeURIComponent(String(s).trim().toLowerCase().replace(/\s+/g, '-'))
}

const markdown = new MD({
  html: true, // Crucial: allow HTML in source
  breaks: true,
  highlight: function (str, lang) {
    // Custom highlight function for markdown-it
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (__) {}
    }

    try {
      return hljs.highlightAuto(str).value
    } catch (__) {}

    return ''
  }
})
  // We are no longer using markdown-it-anchor, so this line is removed.
  // ---------------------------------------
  .use(require('@agoose77/markdown-it-mermaid').default)
  .use(require('markdown-it-texmath'), {
    engine: require('katex'), // Specify KaTeX as the rendering engine
    delimiters: 'dollars',
    katexOptions: {
      throwOnError: false,
      macros: { '\\RR': '\\mathbb{R}' }
    }
  })

export function renderMD(content?: string) {
  try {
    let rawContent = content || ''

    // Step 1: Handle YouTube and Image URLs *before* Markdown-It, as these are line-based
    // and might interfere with Markdown-It's block parsing if not converted early.
    // They are unique in that they replace the *entire line*.
    let preprocessedLines = rawContent.split('\n').map(line => {
      const trimmedLine = line.trim()
      if (trimmedLine.startsWith('[https://www.youtu](https://www.youtu)')) {
        const id = $searchParams(trimmedLine).v
        let embedUrl = setURLParams(
          '[https://www.youtube.com/embed/](https://www.youtube.com/embed/)[id]',
          {
            id
          }
        )
        return renderToString(
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

    // Join back for Markdown-It processing
    let markdownSource = preprocessedLines.join('\n')

    markdownSource = markdownSource
      .replaceAll('<math>', '```math\n')
      .replaceAll('</math>', '\n```')
      .replaceAll('<mermaid>', '```mermaid\n')
      .replaceAll('</mermaid>', '\n```')

    let renderedHtml = markdown.render(markdownSource)

    renderedHtml = renderedHtml.replace(
      /(<h([1-6])>)(.*?)(<\/h\2>)/g,
      (match, openTag, level, content, closeTag) => {
        const id = slugify(content)

        return `
          <span class="relative">
            ${openTag}
            <span id="${id}" style="position: absolute; top: -76px"></span>
            <a href="#${id}" style="text-decoration:none; displa: flex; align-items: center" class="font-bold">
              ${content.trim()}
            </a>
            ${closeTag}
          </span>
        `
      }
    )

    renderedHtml = renderedHtml
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
      .replace(
        /\<(newpage |newpage)\/\>/gi,
        '<div class="code-page-break"><p style="page-break-after: always;"> </p><p style="page-break-before: always;"> </p></div>'
      )
      // Icons: Apply after markdown.render
      .replace(/<bi-([\w-]+)>/g, (match, iconName) => {
        return `<i class="bi bi-${iconName}"></i>`
      })

    // Fonts: Apply after markdown.render
    // Dynamically create a regex pattern from the 'fonts' object keys
    const fontNames = Object.keys(fonts).join('|')
    const fontRegex = new RegExp(`<font (${fontNames})>`, 'g')

    renderedHtml = renderedHtml.replace(fontRegex, (match, fontName) => {
      return `<div class="${fontName}-font">`
    })
    renderedHtml = renderedHtml.replaceAll('</font>', '</div>')

    return renderedHtml
  } catch (err) {
    console.log(err)
    return 'Failed to render preview'
  }
}
