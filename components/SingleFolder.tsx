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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from './ui/alert-dialog'
import { Button } from './ui/button'

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

  const [deleting, setDeleting] = useState(false)

  return (
    <>
      <AlertDialog open={deleting} onOpenChange={setDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete folder</AlertDialogTitle>
            <AlertDialogDescription>
              The folder <i>{folder.name}</i> and its contents will be deleted
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant='ghost' onClick={() => setDeleting(false)}>
              Cancel
            </Button>
            <Button
              variant='ghost'
              onClick={() => {
                deleteFolder()
                setDeleting(false)
              }}
            >
              Confirm
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

            <ContextMenuItem onClick={() => setDeleting(true)}>
              Delete
            </ContextMenuItem>
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
