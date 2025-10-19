'use client'

import Link from 'next/link'
import useFetch, { SSRSuspense } from 'http-react'
import { storage } from 'atomic-state'
import { Doc, Folder } from '@prisma/client'
import copy from 'copy-to-clipboard' // <-- PACKAGE IMPORTED

import { cn } from '@/lib/utils'
import CreateForm from '@/components/CreateForm'
import SingleFolder from '@/components/SingleFolder'
import SingleDocument from '@/components/SingleDocument'
import { useParams } from 'next/navigation'
import { Button } from './ui/button'
import MoveHandler from './MoveHandler'
// Importing Lucide icons
import { ChevronRight, ChevronLeft, Home, Share2, Copy } from 'lucide-react' // Added Share2 and Copy
// Assuming useToast is from '@/components/ui/use-toast'
import { useToast } from '@/components/ui/use-toast'

export default function NormalFolders() {
  const params: { folderId: string } = useParams()
  const { toast } = useToast() // <-- HOOK USED

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

  const hasFolders = folders.length > 0
  const hasFiles = files.length > 0
  const segments = parentFolder.folderSegments || []
  const currentFolder = parentFolder.folder

  const currentFolderId = params.folderId

  // --- NEW HANDLER FUNCTION ---
  const handleCopyPublicId = () => {
    const publicUrl = `${window.location.origin}/public-folder/${currentFolderId}`
    copy(publicUrl)

    toast({
      title: 'Link Copied',
      description: `Public URL for "${
        currentFolder?.name || 'Folder'
      }" copied to clipboard.`
    })
  }

  return (
    <>
      {/* ------------------- IMPROVED BREADCRUMBS (Unchanged) ------------------- */}
      <div className='flex items-center h-10 max-w-full overflow-x-auto whitespace-nowrap pt-2'>
        <Link
          href={'/personal/'}
          className='flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors'
        >
          <Home className='w-4 h-4 mr-1' />
          Home
        </Link>
        {segments.map(folder => (
          <div key={'foldernav' + folder.id} className='flex items-center'>
            <ChevronRight className='w-4 h-4 mx-2 text-muted-foreground' />
            <Link
              className='text-sm font-medium text-muted-foreground hover:text-primary transition-colors'
              href={`/personal/${folder.id}`}
            >
              {folder.name.trim() || 'Unnamed folder'}
            </Link>
          </div>
        ))}
        {!folderNotFound && currentFolder && (
          <div className='flex items-center'>
            <ChevronRight className='w-4 h-4 mx-2 text-muted-foreground' />
            <p className='text-sm font-semibold text-foreground line-clamp-1'>
              {currentFolder.name.trim() || 'Unnamed folder'}
            </p>
          </div>
        )}
      </div>

      {/* ------------------- Action Bar with Copy Button ------------------- */}
      <div className='pt-2 gap-x-2 flex py-2'>
        {/* Back Button */}
        <Link
          replace
          href={
            '/personal/' +
            (currentFolder?.parentFolderId ? currentFolder.parentFolderId : '')
          }
        >
          <Button variant='secondary' size='sm' className='gap-x-2'>
            <ChevronLeft className='w-4 h-4' /> Back
          </Button>
        </Link>

        {/* Share Button (Link to public page) */}
        <Link
          href={'/public-folder/' + currentFolderId}
          target='_blank'
          title='Share this folder publicly'
        >
          <Button variant='secondary' size='sm' className='gap-x-2'>
            <Share2 className='w-4 h-4' /> Share
          </Button>
        </Link>

        {/* New Copy Public ID Button */}
        <Button
          variant='secondary'
          size='sm'
          className='gap-x-2'
          onClick={handleCopyPublicId} // <-- HANDLER ATTACHED
          title='Copy public folder URL'
        >
          <Copy className='w-4 h-4' /> Copy Link
        </Button>

        {/* Move Handler */}
        <MoveHandler />
      </div>

      {/* ------------------- Content Area (Unchanged) ------------------- */}
      {folderNotFound ? (
        <div className='flex items-center justify-center pt-24'>
          <p>Folder not found</p>
        </div>
      ) : (
        <div className='h-[78vh] overflow-y-auto p-2'>
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
            <SSRSuspense>
              {/* 1. Folders */}
              {hasFolders && (
                <h3 className='col-span-full text-lg font-semibold text-foreground/80 pt-4 pb-2 border-b border-border/60 mb-2'>
                  Folders
                </h3>
              )}
              {folders.map(folder => (
                <SingleFolder folder={folder} key={'folder' + folder.id} />
              ))}

              {/* 2. Documents */}
              {hasFiles && hasFolders && (
                <h3 className='col-span-full text-lg font-semibold text-foreground/80 pt-4 pb-2 border-b border-border/60 mb-2'>
                  Documents
                </h3>
              )}
              {files.map(doc => (
                <SingleDocument doc={doc} key={'document' + doc.id} />
              ))}

              {/* Display message if folder is empty */}
              {!hasFolders && !hasFiles && (
                <p className='col-span-full text-center py-12 text-gray-500 dark:text-gray-400'>
                  This folder is empty. Create a new folder or document to get
                  started.
                </p>
              )}
            </SSRSuspense>
          </div>
        </div>
      )}
      <CreateForm folder={currentFolder!} />
    </>
  )
}
