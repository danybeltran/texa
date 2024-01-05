import { headers } from 'next/headers'
import { Fragment } from 'react'
import 'markdown-it-latex/dist/index.css'

import { cn } from '@/lib/utils'
import { prisma } from '@/server'
import { renderMD } from '@/lib/md'

export const metadata = {
  title: ''
}

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

  let docName = doc.name || 'Unnamed document'
  let docDescription = doc.description || 'No description'

  return (
    <main className='w-full'>
      <Fragment>
        <title>{docName}</title>
        <meta property='og:title' content={docName} />
        <meta name='twitter:title' content={docName} />

        <meta name='description' content={docDescription} />
        <meta name='og:description' content={docDescription} />
        <meta name='twitter:description' content={docDescription} />

        <meta name='twitter:card' content='summary_large_image' />
      </Fragment>
      <div className={'flex border-white w-full gap-x-4 py-8 justify-center'}>
        <div
          className={cn(
            'md-editor-preview w-full md:w-1/2 border-neutral-500 rounded-lg p-3 prose text-black'
          )}
          dangerouslySetInnerHTML={{
            __html: renderMD(doc?.content!)
          }}
        ></div>
      </div>
    </main>
  )
}
