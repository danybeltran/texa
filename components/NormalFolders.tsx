'use client'

import Link from 'next/link'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6'
import useFetch, { SSRSuspense } from 'http-react'
import { BrowserOnly } from 'react-kuh'
import { storage } from 'atomic-state'
import { Doc, Folder } from '@prisma/client'

import { cn } from '@/lib/utils'
import CreateForm from '@/components/CreateForm'
import SingleFolder from '@/components/SingleFolder'
import SingleDocument from '@/components/SingleDocument'
import { useParams } from 'next/navigation'
import { Button } from './ui/button'
import MoveHandler from './MoveHandler'

export default function NormalFolders() {
  const params: { folderId: string } = useParams()

  const { data: parentFolder, error: folderNotFound } = useFetch<{
    folderSegments: Folder[]
    folder: Folder
  }>('/folders/previous', {
    id: `folder-${params.folderId}`,
    revalidateOnMount: false,
    cacheProvider: storage,
    query: {
      folderId: params.folderId
    },
    default: {
      folder: {
        parentFolderId: '',
        name: '',
        color: '',
        created: new Date(),
        id: '',
        owner: ''
      },
      folderSegments: []
    }
  })

  const { data: folders } = useFetch<Folder[]>('/folders', {
    default: [],
    id: `subfolders-${params.folderId}`,
    cacheProvider: storage,
    query: {
      parentFolderId: params.folderId
    }
  })

  const { data: files } = useFetch<Doc[]>('/documents', {
    default: [],
    id: `folder-documents-${params.folderId}`,
    cacheProvider: storage,
    query: {
      parentFolderId: params.folderId
    }
  })

  return (
    <>
      <div className='flex items-center gap-x-4 h-10 max-w-full overflow-x-auto'>
        <Link href={'/personal/'}>Home</Link>
        {parentFolder.folderSegments?.map((folder, folderIndex) => (
          <Link
            key={'foldernav' + folder.id}
            className={cn(
              'flex items-center gap-x-2',
              folderIndex === parentFolder.folderSegments.length
                ? 'border'
                : 'text-neutral-400 whitespace-nowrap'
            )}
            href={
              '/personal/' +
              (parentFolder.folder?.parentFolderId ? folder.id : '')
            }
          >
            <FaChevronRight /> {folder.name.trim() || 'Unnamed folder'}
          </Link>
        ))}
        {folderNotFound ? null : (
          <div className='flex items-center gap-x-2 whitespace-nowrap'>
            <FaChevronRight />
            <p>{parentFolder.folder?.name.trim() || 'Unnamed folder'}</p>
          </div>
        )}
      </div>
      <div className='pt-2 gap-x-2 flex py-2'>
        <Link
          replace
          href={
            '/personal/' +
            (parentFolder.folder.parentFolderId
              ? parentFolder.folder.parentFolderId
              : '')
          }
        >
          <Button variant='secondary' size='sm' className='gap-x-2'>
            <FaChevronLeft /> Back
          </Button>
        </Link>
        <MoveHandler />
      </div>
      {folderNotFound ? (
        <div className='flex items-center justify-center pt-24'>
          <p>Folder not found</p>
        </div>
      ) : (
        <div className='h-[78vh] overflow-y-auto border'>
          <div className='flex flex-wrap gap-10 '>
            <CreateForm folder={parentFolder.folder} />
            <SSRSuspense>
              {folders.map(folder => (
                <SingleFolder folder={folder} key={'folder' + folder.id} />
              ))}
              {files.map(doc => (
                <SingleDocument doc={doc} key={'document' + doc.id} />
              ))}
            </SSRSuspense>
          </div>
        </div>
      )}
    </>
  )
}
