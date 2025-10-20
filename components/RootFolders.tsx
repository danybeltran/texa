'use client'

import { storage } from 'atomic-state'
import useFetch, { SSRSuspense } from 'http-react'
import { Doc, Folder } from '@prisma/client'

import SingleFolder from '@/components/SingleFolder'
import SingleDocument from '@/components/SingleDocument'

export default function RootFolders() {
  const { data: mainFolders } = useFetch<Folder[]>('/folders', {
    id: 'parent',
    cacheProvider: storage,
    default: []
  })

  const { data: files } = useFetch<Doc[]>('/documents', {
    default: [],
    cacheProvider: storage
  })

  const hasFolders = mainFolders.length > 0
  const hasFiles = files.length > 0
  const allItemsEmpty = !hasFolders && !hasFiles

  return (
    // FIX: Wrapping the grid in a container to limit its overall width.
    // This stabilizes the card aspect ratio when there are few items on a wide screen.
    // max-w-7xl is just an example; choose the width that best matches your design.
    <div className='mx-auto max-w-7xl w-full p-2'>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
        <SSRSuspense>
          {allItemsEmpty ? (
            <p className='col-span-full text-center py-12 text-gray-500 dark:text-gray-400'>
              Your personal space is empty. Start by creating a new folder or
              document! 🚀
            </p>
          ) : (
            <>
              {/* 1. Folders Section */}
              {hasFolders && (
                <h3 className='col-span-full text-lg font-semibold text-foreground/80 pt-4 pb-2 border-b border-border/60 mb-2'>
                  Folders
                </h3>
              )}
              {mainFolders.map(folder => (
                <SingleFolder folder={folder} key={'folder' + folder.id} />
              ))}

              {/* 2. Documents Section */}
              {hasFiles && (
                <h3 className='col-span-full text-lg font-semibold text-foreground/80 pt-4 pb-2 border-b border-border/60 mb-2'>
                  Documents
                </h3>
              )}
              {files.map(doc => (
                <SingleDocument doc={doc} key={'document' + doc.id} />
              ))}
            </>
          )}
        </SSRSuspense>
      </div>
    </div>
  )
}
