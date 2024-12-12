import 'markdown-it-latex/dist/index.css'

import DocumentView from '@/components/DocumentView'
import { prisma } from '@/server'
import { FetchConfig } from 'http-react'

export default async function DocumentPage({ params: $params }) {
  const params = await $params
  const { id } = params

  const doc = await prisma.doc.findFirst({
    where: {
      id
    }
  })

  return (
    <FetchConfig
      value={{
        [`doc-${id}`]: doc
      }}
    >
      <DocumentView />
    </FetchConfig>
  )
}
