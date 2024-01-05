'use client'

import Link from 'next/link'
import { FaFolder } from 'react-icons/fa6'
import { Folder } from '@prisma/client'
import { cn } from '@/lib/utils'
import useFetch, { revalidate } from 'http-react'
import { storage } from 'atomic-state'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
import { useEffect, useState } from 'react'
import UpdateFolderForm from './UpdateFolderForm'

export default function SingleFolder({ folder }: { folder: Folder }) {
  const {
    data: _,
    reFetch: deleteFolder,
    loading: deletingFolder
  } = useFetch('/folders', {
    method: 'DELETE',
    auto: false,
    body: folder,
    id: {
      delete: folder
    },
    onResolve() {
      revalidate(
        folder.parentFolderId
          ? {
              folderId: folder.parentFolderId
            }
          : 'parent'
      )
    }
  })

  const [editFolder, setEditFolder] = useState(false)

  return (
    <>
      <Link href={'/personal/' + folder.id} className='h-36'>
        <ContextMenu>
          <ContextMenuTrigger className='h-36 text-center'>
            <FaFolder
              className={cn(
                'text-9xl hover:opacity-85 transition h-36',
                deletingFolder && 'cursor-not-allowed animate-pulse'
              )}
              style={{
                color: folder.color
              }}
            />
            <p className='text-sm w-32 whitespace-pre-line'>{folder.name}</p>
          </ContextMenuTrigger>

          <ContextMenuContent
            onClick={e => {
              e.stopPropagation()
            }}
          >
            <ContextMenuItem
              onClick={e => {
                e.stopPropagation()
                setEditFolder(true)
              }}
            >
              <span>Edit</span>
            </ContextMenuItem>

            <ContextMenuItem onClick={deleteFolder}>Delete</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Link>
      <UpdateFolderForm
        folder={folder}
        open={editFolder}
        setOpen={setEditFolder}
      />
    </>
  )
}
