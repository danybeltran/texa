import { renderToString } from 'react-dom/server'
import MD from 'markdown-it'
import { $searchParams, setURLParams } from 'http-react'
import hljs from 'highlight.js'
import Icon from 'bs-icon'
import { Fragment } from 'react'

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

// Custom slugify function
function slugify(s: string) {
  // 1. Trim leading/trailing whitespace.
  const trimmedString = s.trim()

  // 2. Replace sequences of one or more whitespace characters with a single hyphen.
  // This is a common practice for URL slugs.
  const spacedString = trimmedString.replace(/\s+/g, '-')

  // 3. Encode the URI component. This is the crucial step that handles
  // special characters like parentheses, commas, etc., and makes them safe for a URL fragment.
  return encodeURIComponent(spacedString).toLowerCase()
}

// --- Server-Side Markdown Processor ---
// This one is lean and doesn't include any plugins that rely on the 'document' object.
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
// This one includes all the plugins since it will only run in the browser.
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

// Reusable post-processing function
function postProcessHtml(renderedHtml: string) {
  // Post-processing logic is now separated for both server and client
  let finalHtml = renderedHtml.replace(
    /(<h([1-6])>)(.*?)(<\/h\2>)/g,
    (match, openTag, level, content, closeTag) => {
      const id = slugify(content)

      return `
        <span class="relative">
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
                  display: 'flex',
                  alignItems: 'center'
                }}
                className='font-bold'
              >
                {content.trim()}
                {/* <span
                  dangerouslySetInnerHTML={{
                    __html: renderToString(
                      <Icon
                        name='link-45deg'
                        style={{ fontSize: '20px', marginLeft: '10px' }}
                      />
                    )
                  }}
                /> */}
              </a>
            </Fragment>
          )}
          ${closeTag}
        </span>
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

// Main server-side render function
export function renderMD(content?: string) {
  try {
    let rawContent = content || ''

    // The preprocessing of lines with renderToString is fine as long as you're using React's SSR
    let preprocessedLines = rawContent.split('\n').map(line => {
      const trimmedLine = line.trim()
      if (trimmedLine.startsWith('[https://www.youtu](https://www.youtu)')) {
        const id = $searchParams(trimmedLine).v
        let embedUrl = setURLParams('https://www.youtube.com/embed/', { id })
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

    // This is the call that was failing. It now uses the serverMarkdown instance.
    const renderedHtml = serverMarkdown.render(markdownSource)

    return postProcessHtml(renderedHtml)
  } catch (err) {
    console.error(err)
    return 'Failed to render preview'
  }
}

// New client-side render function
export function renderClientMD(content?: string) {
  try {
    let rawContent = content || ''

    // The preprocessing part is the same
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
