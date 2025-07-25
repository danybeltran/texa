'use client'

import { storage } from 'atomic-state'
import useFetch, { SSRSuspense } from 'http-react'
import { Doc, Folder } from '@prisma/client'

import SingleFolder from '@/components/SingleFolder'
import SingleDocument from '@/components/SingleDocument'

export default function RootFolders() {
  const { data: mainFolders, hasData: hasCachedFolders } = useFetch<Folder[]>(
    '/folders',
    {
      id: 'parent',
      cacheProvider: storage,
      default: []
    }
  )

  const { data: files, hasData: hasCachedFiles } = useFetch<Doc[]>(
    '/documents',
    {
      default: [],
      cacheProvider: storage
    }
  )

  return (
    <SSRSuspense>
      {mainFolders.map(folder => (
        <SingleFolder folder={folder} key={'folder' + folder.id} />
      ))}
      {files.map(doc => (
        <SingleDocument doc={doc} key={'document' + doc.id} />
      ))}
    </SSRSuspense>
  )
}
