import MD from 'markdown-it'
import { headers } from 'next/headers'
import 'markdown-it-latex/dist/index.css'

import { cn } from '@/lib/utils'
import { prisma } from '@/server'

const markdown = new MD()
  .use(require('markdown-it-math'))
  .use(require('markdown-it-texmath'), {
    engine: require('katex'),
    delimiters: 'dollars',
    katexOptions: { macros: { '\\RR': '\\mathbb{R}' } }
  })

export default async function DocumentPage({
  params
}: {
  params: { id: string }
}) {
  headers()

  const [doc] = await prisma.doc.findMany({
    where: {
      publicId: params.id
    }
  })

  if (!doc)
    return (
      <div className='flex items-center justify-center pt-24'>
        <p>Document not found</p>
      </div>
    )

  return (
    <main className='w-full'>
      <title>{doc.name}</title>
      <div className={'flex border-white w-full gap-x-4 py-8 justify-center'}>
        <div
          className={cn(
            'md-editor-preview w-full border-neutral-500 rounded-lg p-6 prose text-black'
          )}
          dangerouslySetInnerHTML={{
            __html: markdown.render(doc?.content || '')
          }}
        ></div>
      </div>
    </main>
  )
}
