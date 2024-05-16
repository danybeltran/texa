'use client'

import { renderMD } from '@/lib/md'
import { cn } from '@/lib/utils'
import { useSecondRender } from 'react-kuh'

export default function PublicMdContent({ content }) {
  const render = useSecondRender()

  return (
    <div
      className={cn(
        'mx-auto self-center mb-32 md-editor-preview w-full border-neutral-500 rounded-lg p-3 print:py-0 prose max-w-3xl text-black'
      )}
      dangerouslySetInnerHTML={{
        __html: render ? renderMD(content!) : ''
      }}
    />
  )
}
