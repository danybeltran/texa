'use client'

import Link from 'next/link'
import { FaChevronRight } from 'react-icons/fa6'
import useFetch from 'http-react'
import { BrowserOnly } from 'react-kuh'
import { storage } from 'atomic-state'
import { Doc, Folder } from '@prisma/client'

import { cn } from '@/lib/utils'
import CreateForm from '@/components/CreateForm'
import SingleFolder from '@/components/SingleFolder'
import SingleDocument from '@/components/SingleDocument'
import { useParams } from 'next/navigation'

export default function NormalFolders() {
  const params: { folderId: string } = useParams()

  const { data: folders } = useFetch<Folder[]>('/folders', {
    default: [],
    id: params,
    suspense: true,
    cacheProvider: storage,
    query: {
      parentFolderId: params.folderId
    }
  })

  const { data: parentFolder } = useFetch<{
    folderSegments: Folder[]
    folder: Folder
  }>('/folders/previous', {
    suspense: true,
    revalidateOnMount: false,
    query: {
      folderId: params.folderId
    },
    default: {
      folder: {} as any,
      folderSegments: []
    }
  })

  const { data: files } = useFetch<Doc[]>('/documents', {
    default: [],
    suspense: true,
    cacheProvider: storage,
    query: {
      parentFolderId: params.folderId
    }
  })

  return (
    <>
      <div className='flex items-center gap-x-4 h-10'>
        <Link href={'/personal/'}>Home</Link>
        {parentFolder.folderSegments?.map((folder, folderIndex) => (
          <Link
            key={'foldernav' + folder.id}
            className={cn(
              'flex items-center gap-x-2',
              folderIndex === parentFolder.folderSegments.length
                ? 'border'
                : 'text-neutral-400'
            )}
            href={
              '/personal/' +
              (parentFolder.folder?.parentFolderId ? folder.id : '')
            }
          >
            <FaChevronRight /> {folder.name}
          </Link>
        ))}
        <div className='flex items-center gap-x-2'>
          <FaChevronRight />
          <p>{parentFolder.folder?.name}</p>
        </div>
      </div>
      <div className='flex flex-wrap items-center py-8 gap-8'>
        <CreateForm folder={parentFolder.folder} />
        <BrowserOnly>
          {folders.map(folder => (
            <SingleFolder folder={folder} key={'folder' + folder.id} />
          ))}
          {files.map(doc => (
            <SingleDocument doc={doc} key={'document' + doc.id} />
          ))}
        </BrowserOnly>
      </div>
    </>
  )
}
