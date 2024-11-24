import { headers } from 'next/headers'
import { Fragment } from 'react'
import 'markdown-it-latex/dist/index.css'

import { cn } from '@/lib/utils'
import { prisma } from '@/server'
import { renderMD } from '@/lib/md'

import PublicViewContent from '@/components/PublicViewContent'
import { Button } from '@/components/ui/button'
import { FaCode } from 'react-icons/fa6'
import Link from 'next/link'
import PublicCodePreview from '@/components/PublicCodePreview'
import PublicPrintButton from '@/components/CodePreviewPrint'
import PublicMdContent from '@/components/PublicMdContent'
import { BrowserOnly, ClientOnly } from 'react-kuh'
import { SSRSuspense } from 'http-react'

export const metadata = {
  title: ''
}

export default async function DocumentPage({
  params: $params,
  searchParams: $searchParams
}: {
  params: { id: string }
  searchParams: { sourceCode: 'true' }
}) {
  headers()

  const params = await $params
  const searchParams = await $searchParams

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

  const showSource = searchParams.sourceCode === 'true'

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
      <div
        className={'flex border-white w-full gap-x-4 print:py-0 justify-center'}
      >
        {doc.code ? (
          <div className='w-full flex flex-col'>
            <div className='pb-4 space-x-2 print:hidden'>
              <Link
                href={`/public-view/${doc.publicId}${
                  showSource ? '' : '?sourceCode=true'
                }`}
              >
                <Button
                  className='gap-x-2 opacity-50 hover:opacity-90'
                  size='sm'
                  variant='secondary'
                >
                  <FaCode />{' '}
                  {searchParams.sourceCode
                    ? 'View document'
                    : 'View source code'}
                </Button>
              </Link>
              {showSource ? null : <PublicPrintButton />}
            </div>
            {searchParams.sourceCode === 'true' ? (
              <PublicCodePreview content={doc.content!} />
            ) : (
              <ClientOnly>
                <PublicMdContent content={doc?.content} />
              </ClientOnly>
            )}
          </div>
        ) : (
          <div className='w-full'>
            <div className='space-x-2 print:hidden'>
              <PublicPrintButton />
            </div>
            <div className='md-editor-preview mx-auto w-full max-w-3xl border-neutral-500 rounded-lg p-3 print:py-0 prose  text-black mb-48 print:mb-0'>
              <SSRSuspense fallback={<p>Loading content...</p>}>
                <PublicViewContent content={doc.content!} />
              </SSRSuspense>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
