'use client'

import { storage } from 'atomic-state'
import useFetch from 'http-react'
import { Doc, Folder } from '@prisma/client'
import { BrowserOnly } from 'react-kuh'

import SingleFolder from '@/components/SingleFolder'
import CreateForm from '@/components/CreateForm'
import SingleDocument from '@/components/SingleDocument'

export default function PersonalPage() {
  const { data: mainFolders } = useFetch<Folder[]>('/folders', {
    id: 'parent',
    cacheProvider: storage,
    default: []
  })

  const { data: files } = useFetch<Doc[]>('/documents', {
    default: [],
    cacheProvider: storage
  })

  return (
    <main>
      <div className='flex items-center gap-x-4 h-10'>
        <h2>Home</h2>
      </div>
      <div className='flex flex-wrap py-8 gap-8'>
        <CreateForm folder={{} as any} />
        <BrowserOnly>
          {mainFolders.map(folder => (
            <SingleFolder folder={folder} key={'folder' + folder.id} />
          ))}
          {files.map(folder => (
            <SingleDocument doc={folder} key={'doc' + folder.id} />
          ))}
        </BrowserOnly>
      </div>
    </main>
  )
}
