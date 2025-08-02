import 'markdown-it-latex/dist/index.css'

import DocumentView from '@/components/DocumentView'
import { prisma } from '@/server'
import { FetchConfig, SSRSuspense } from 'http-react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Document editor - Texa',
  description: 'An online LaTeX document editor powered by Next.js.'
}

export default async function DocumentPage({ params: $params }) {
  const params = await $params
  const { id } = params

  const session = await getServerSession()!

  const doc = await prisma.doc.findFirst({
    where: {
      id
    }
  })

  if (session?.user?.email !== doc?.owner) {
    redirect(`/public-view/${doc?.publicId}`)
  }

  return (
    <FetchConfig
      value={{
        [`doc-${id}`]: doc
      }}
    >
      <SSRSuspense>
        <DocumentView />
      </SSRSuspense>
    </FetchConfig>
  )
}
