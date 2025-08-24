'use client'

import { renderMD } from '@/lib/md'
import { cn } from '@/lib/utils'
import { useSecondRender } from 'react-kuh'
import { useToast } from './ui/use-toast'
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import copy from 'copy-to-clipboard'

export default function PublicMdContent({ content }) {
  // const render = useSecondRender()

  const { toast } = useToast()

  useLayoutEffect(() => {
    let tm2: any
    const tm = setTimeout(() => {
      if (content) {
        const codeBlocks = document.querySelectorAll('pre')
        codeBlocks.forEach(pre => {
          // Check if a copy button already exists to prevent duplicates
          if (!pre.querySelector('.copy-button')) {
            const button = document.createElement('button')
            button.innerText = 'Copy'
            button.className =
              'copy-button absolute top-2 right-2 p-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity'

            // Wrap the pre content in a div to properly position the button
            const wrapper = document.createElement('div')
            wrapper.style.position = 'relative'
            wrapper.className = 'group' // Add group class for hover effect
            pre.parentNode?.insertBefore(wrapper, pre)
            wrapper.appendChild(pre)
            wrapper.appendChild(button)

            button.onclick = () => {
              const code = pre.querySelector('code')?.innerText || pre.innerText
              copy(code)

              toast({
                title: 'Copied!',
                description: 'Code snippet copied to clipboard.'
              })
              button.innerText = 'Copied!'

              tm2 = setTimeout(() => {
                button.innerText = 'Copy'
              }, 2000)
            }
          }
        })
      }
    }, 200)

    return () => {
      clearTimeout(tm)
      clearTimeout(tm2)
    }
  }, [content, toast])

  const secondRender = useSecondRender()

  useEffect(() => {}, [])

  const renderedContent = useMemo(
    () => (
      <div
        className={cn(
          'mx-auto self-center mb-32 md-editor-preview w-full border-neutral-500 rounded-lg p-3 print:py-0 prose max-w-3xl text-black'
        )}
        dangerouslySetInnerHTML={{
          __html: renderMD(content!)
        }}
      />
    ),
    [content, secondRender]
  )

  return renderedContent
}
