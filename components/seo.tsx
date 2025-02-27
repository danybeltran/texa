'use client'

import { renderMD } from '@/lib/md'

export default function SeoContent({ content }: { content: string }) {
  return (
    <div
      className='prose prose-headings hidden'
      dangerouslySetInnerHTML={{
        __html: renderMD(content)
      }}
    ></div>
  )
}
