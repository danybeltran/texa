import { renderToString } from 'react-dom/server'
import MD from 'markdown-it'
import { $searchParams, setURLParams } from 'http-react'
import hljs from 'highlight.js'
import Icon from 'bs-icon'
import { Fragment } from 'react'

export const fonts = {
  pica: 'pica',
  roboto: 'roboto',
  raleway: 'raleway',
  montserrat: 'montserrat',
  courier: 'courier',
  newsreader: 'newsreader',
  poppins: 'poppins',
  geist: 'geist',
  dmsans: 'dmsans'
} as const

export const fontNames = {
  pica: 'IM Fell DW Pica',
  roboto: 'Roboto',
  raleway: 'Raleway',
  montserrat: 'Montserrat',
  courier: 'Courier Prime',
  newsreader: 'Newsreader',
  poppins: 'Poppins',
  geist: 'Geist',
  dmsans: 'DM Sans'
} as const

// Custom slugify function
function slugify(s: string) {
  const trimmedString = s.trim()
  const spacedString = trimmedString.replace(/\s+/g, '-')
  return encodeURIComponent(spacedString).toLowerCase()
}

// --- Server-Side Markdown Processor ---
const serverMarkdown = new MD({
  html: true,
  breaks: true,
  highlight: function (str, lang) {
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

// --- Client-Side Markdown Processor ---
const clientMarkdown = new MD({
  html: true,
  breaks: true,
  highlight: function (str, lang) {
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
  .use(require('@agoose77/markdown-it-mermaid').default)
  .use(require('markdown-it-texmath'), {
    engine: require('katex'),
    delimiters: 'dollars',
    katexOptions: {
      throwOnError: false,
      macros: { '\\RR': '\\mathbb{R}' }
    }
  })

// Post-processing HTML
function postProcessHtml(renderedHtml: string) {
  let finalHtml = renderedHtml.replace(
    /(<h([1-6])>)(.*?)(<\/h\2>)/g,
    (match, openTag, level, content, closeTag) => {
      const id = slugify(content)
      return `
        <div class="relative w-full">
          ${openTag}
          ${renderToString(
            <Fragment>
              <span
                id={`${id}`}
                style={{ position: 'absolute', top: '-76px' }}
              ></span>
              <a
                href={`#${id}`}
                style={{
                  textDecoration: 'none',
                  alignItems: 'center'
                }}
                className='font-bold w-full'
              >
                {content.trim()}
              </a>
            </Fragment>
          )}
          ${closeTag}
        </div>
      `
    }
  )

  finalHtml = finalHtml
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
    .replace(/<bi-([\w-]+)>/g, (match, iconName) => {
      return `<i class="bi bi-${iconName}"></i>`
    })

  const fontNames = Object.keys(fonts).join('|')
  const fontRegex = new RegExp(`<font (${fontNames})>`, 'g')

  finalHtml = finalHtml.replace(fontRegex, (match, fontName) => {
    return `<div class="${fontName}-font">`
  })
  finalHtml = finalHtml.replaceAll('</font>', '</div>')

  return finalHtml
}

// --- Helper: Convert <tbl> blocks into Markdown tables ---
function convertTables(raw: string) {
  return raw.replace(
    /<tbl\s+([^>]+)>([\s\S]*?)<\/tbl>/gi,
    (match, headers, body) => {
      const headerCells = headers
        .split(',')
        .map(h => h.trim())
        .filter(Boolean)

      const bodyRows = body
        .trim()
        .split('\n')
        .map(row =>
          row
            .split(',')
            .map(c => c.trim())
            .filter(Boolean)
        )

      const headerLine = `|${headerCells.join('|')}|`
      const dividerLine = `|${headerCells.map(() => '-').join('|')}|`
      const bodyLines = bodyRows.map(row => `|${row.join('|')}|`)

      return [headerLine, dividerLine, ...bodyLines].join('\n')
    }
  )
}

// --- Main Markdown Render Function ---
export function renderMD(content?: string) {
  try {
    let rawContent = content || ''

    // 🧩 Convert <tbl> → Markdown table
    rawContent = convertTables(rawContent)

    // Preprocessing (YouTube, images, etc.)
    let preprocessedLines = rawContent.split('\n').map(line => {
      const trimmedLine = line.trim()

      const isYoutubeLink = trimmedLine.startsWith('https://www.youtu')
      if (isYoutubeLink) {
        const id = $searchParams(trimmedLine).v

        let embedUrl = setURLParams('https://www.youtube.com/embed/:id', { id })

        return renderToString(
          <iframe
            width='100%'
            style={{ aspectRatio: '16/9' }}
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

    let markdownSource = preprocessedLines.join('\n')
    markdownSource = markdownSource
      .replaceAll('<math>', '```math\n')
      .replaceAll('</math>', '\n```')
      .replaceAll('<mermaid>', '```mermaid\n')
      .replaceAll('</mermaid>', '\n```')

    const markdownProcessor =
      typeof window !== 'undefined' ? clientMarkdown : serverMarkdown

    const renderedHtml = markdownProcessor.render(markdownSource)
    return postProcessHtml(renderedHtml)
  } catch (err) {
    console.error(err)
    return 'Failed to render preview'
  }
}

// --- Client-Side Markdown Renderer ---
export function renderClientMD(content?: string) {
  try {
    let rawContent = content || ''

    // 🧩 Convert <tbl> → Markdown table
    rawContent = convertTables(rawContent)

    let preprocessedLines = rawContent.split('\n').map(line => {
      //... (same logic as above)
      return line
    })

    let markdownSource = preprocessedLines.join('\n')
    markdownSource = markdownSource
      .replaceAll('<math>', '```math\n')
      .replaceAll('</math>', '\n```')
      .replaceAll('<mermaid>', '```mermaid\n')
      .replaceAll('</mermaid>', '\n```')

    // This uses the clientMarkdown instance with all the plugins.
    const renderedHtml = clientMarkdown.render(markdownSource)

    return postProcessHtml(renderedHtml)
  } catch (err) {
    console.error(err)
    return 'Failed to render preview on client'
  }
}
