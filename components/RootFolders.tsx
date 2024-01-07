'use client'

import { storage, useAtom } from 'atomic-state'
import useFetch from 'http-react'
import { Doc, Folder } from '@prisma/client'
import { BrowserOnly } from 'react-kuh'

import SingleFolder from '@/components/SingleFolder'
import SingleDocument from '@/components/SingleDocument'
import { itemsToMoveState } from '@/states'

export default function RootFolders() {
  const { data: mainFolders } = useFetch<Folder[]>('/folders', {
    id: 'parent',
    suspense: true,
    cacheProvider: storage,
    default: []
  })

  const { data: files } = useFetch<Doc[]>('/documents', {
    default: [],
    suspense: true,
    cacheProvider: storage
  })

  const [itemsToMove, setItemsToMove] = useAtom(itemsToMoveState)

  return (
    <BrowserOnly>
      {mainFolders.map(folder => (
        <SingleFolder folder={folder} key={'folder' + folder.id} />
      ))}
      {files.map(doc => (
        <SingleDocument doc={doc} key={'document' + doc.id} />
      ))}
    </BrowserOnly>
  )
}
