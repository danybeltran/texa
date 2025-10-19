import { headers } from 'next/headers'
import 'markdown-it-latex/dist/index.css'

import { prisma } from '@/server'

import PublicViewContent from '@/components/PublicViewContent'
import { Button } from '@/components/ui/button'
import { FaCode } from 'react-icons/fa6'
import Link from 'next/link'
import PublicCodePreview from '@/components/PublicCodePreview'
import PublicPrintButton from '@/components/CodePreviewPrint'
import PublicMdContent from '@/components/PublicMdContent'
import { SSRSuspense } from 'http-react'
import { Metadata } from 'next'
import SeoContent from '@/components/seo'
import { ArrowLeft } from 'lucide-react' // Use Lucide for consistent icon styling

export async function generateMetadata({
  params: $params,
  searchParams: $searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ sourceCode: 'true'; from: string }> // Added 'from' to the promise
}) {
  const params = await $params

  const [doc] = await prisma.doc.findMany({
    where: {
      publicId: params.id
    }
  })

  let docName = doc.name || 'Unnamed document'
  let docDescription = doc.description || 'No description'

  return {
    title: docName,
    openGraph: {
      title: docName,
      description: docDescription
    },
    twitter: {
      title: docName,
      description: docDescription,
      card: 'summary_large_image'
    },
    description: docDescription
  } as Metadata
}

export default async function DocumentPage({
  params: $params,
  searchParams: $searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ sourceCode: 'true'; from: string }> // Added 'from' to the promise
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

  const showSource = searchParams.sourceCode === 'true'
  const fromFolderId = searchParams.from

  // LOGIC ADDED HERE: Check if the 'from' parameter matches the document's parent folder ID
  const showBackButton = fromFolderId && doc.parentFolderId === fromFolderId

  const BackButton = showBackButton ? (
    <Link href={`/public-folder/${doc.parentFolderId}`}>
      <Button variant='secondary' size='sm' className='gap-x-2'>
        <ArrowLeft className='w-4 h-4' /> Back to folder
      </Button>
    </Link>
  ) : null

  return (
    <main className='w-full'>
      <div
        className={'flex border-white w-full gap-x-4 print:py-0 justify-center'}
      >
        {doc.code ? (
          <div className='w-full flex flex-col'>
            <div className='pb-4 space-x-2 print:hidden'>
              {BackButton} {/* Render Back button here */}
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
              <PublicMdContent content={doc?.content} />
            )}
          </div>
        ) : (
          <div className='w-full'>
            <div className='space-x-2 print:hidden'>
              {BackButton} {/* Render Back button here */}
              <PublicPrintButton />
            </div>
            <div className='md-editor-preview mx-auto w-full max-w-3xl border-neutral-500 rounded-lg p-3 print:py-0 prose  text-black mb-48 print:mb-0'>
              <SeoContent content={doc.content!} />
              <SSRSuspense
                fallback={
                  <div className={`${doc.font}-font`}>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: doc.content!
                      }}
                    ></div>
                  </div>
                }
              >
                <PublicViewContent
                  content={doc.content!}
                  font={doc.font || 'inter'}
                />
              </SSRSuspense>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
