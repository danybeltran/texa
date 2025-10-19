'use client'

import Link from 'next/link'
import { FaFolder, FaPen, FaRegTrashCan } from 'react-icons/fa6'
import { Folder } from '@prisma/client'
import { cn } from '@/lib/utils'
import useFetch, { revalidate } from 'http-react'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
import { useState } from 'react'
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
import { useAtom } from 'atomic-state'
import { itemsToMoveState } from '@/states'
import { useParams } from 'next/navigation'
import { FolderIcon, Pen, Trash2, ArrowRight } from 'lucide-react' // Using Lucide icons for a cohesive look

export default function SingleFolder({ folder }: { folder: Folder }) {
  const { folderId } = useParams()

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
      revalidate([`subfolders-${folderId}`, 'parent'])
    }
  })

  const [editFolder, setEditFolder] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [itemsToMove, setItemsToMove] = useAtom(itemsToMoveState)

  // Check if this folder is the one currently being moved
  const isBeingMoved = itemsToMove.some(item => item.id === folder.id)

  // Determine the color for the icon background
  // Using a fallback for the accent color
  const folderAccentColor = folder.color || '#3b82f6' // Default Blue (blue-500)

  // The new beautiful card structure
  const FolderCardContent = (
    <div
      className={cn(
        'group block rounded-xl p-4 transition-all duration-200 ease-in-out',
        'bg-white shadow-md hover:shadow-lg dark:bg-gray-800 dark:shadow-xl dark:hover:shadow-2xl',
        'transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5',
        'border border-transparent hover:border-blue-400 dark:hover:border-blue-600',
        'w-full h-full', // Ensure it fills the grid cell
        deletingFolder && 'opacity-60 cursor-not-allowed animate-pulse',
        isBeingMoved && 'cursor-not-allowed opacity-75 ring-4 ring-blue-500/50'
      )}
    >
      <div className='flex flex-col items-center justify-center text-center h-full'>
        {/* Icon Container with Accent Color */}
        <div
          className='mb-3 p-3 rounded-full transition-colors'
          style={{
            backgroundColor: folderAccentColor + '1A', // A light tint of the custom color
            color: folderAccentColor // The custom color for the icon itself
          }}
        >
          <FolderIcon className='w-8 h-8' />
        </div>

        {/* Name */}
        <p className='text-sm font-medium text-gray-700 dark:text-gray-200 line-clamp-2 mt-2 px-1'>
          {folder.name.trim() || 'Unnamed folder'}
        </p>

        {/* Type Tag (consistent with public view) */}
        <span
          className='mt-1 text-xs font-semibold px-2 py-0.5 rounded-full'
          style={{
            color: folderAccentColor,
            backgroundColor: folderAccentColor + '1A' // Light background tint
          }}
        >
          Folder
        </span>
      </div>
    </div>
  )

  return (
    <>
      {/* ----------------- Delete Confirmation Dialog ----------------- */}
      <AlertDialog open={deleting} onOpenChange={setDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete folder</AlertDialogTitle>
            <AlertDialogDescription>
              The folder <strong>{folder.name}</strong> and its contents will be
              permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant='ghost' onClick={() => setDeleting(false)}>
              Cancel
            </Button>
            <Button
              variant='destructive' // Use destructive variant for delete
              onClick={() => {
                deleteFolder()
                setDeleting(false)
              }}
              disabled={deletingFolder}
            >
              Confirm Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ----------------- Folder Card Link with Context Menu ----------------- */}
      <ContextMenu>
        <ContextMenuTrigger className='w-full h-auto'>
          <Link
            onClick={e => {
              // Prevent navigation if the folder is the one being moved
              if (isBeingMoved) e.preventDefault()
            }}
            href={'/personal/' + folder.id}
            className={cn(
              'h-full w-full block select-none' // Ensure link covers the whole card
            )}
          >
            {FolderCardContent}
          </Link>
        </ContextMenuTrigger>

        {/* Context Menu Content (hidden if the item is being moved) */}
        {!isBeingMoved && (
          <ContextMenuContent
            onClick={e => {
              // Stop propagation to prevent accidental navigation on menu click
              e.stopPropagation()
            }}
          >
            <ContextMenuItem
              onClick={e => {
                e.stopPropagation()
                setItemsToMove([folder])
              }}
              className='gap-x-2 flex items-center cursor-pointer'
            >
              <ArrowRight className='w-4 h-4' /> Move
            </ContextMenuItem>
            <ContextMenuItem
              onClick={e => {
                e.stopPropagation()
                setEditFolder(true)
              }}
              className='gap-x-2 flex items-center cursor-pointer'
            >
              <Pen className='w-4 h-4' /> Edit
            </ContextMenuItem>

            <ContextMenuItem
              onClick={() => setDeleting(true)}
              className='gap-x-2 flex items-center cursor-pointer text-red-600 dark:text-red-400'
            >
              <Trash2 className='w-4 h-4' /> Delete
            </ContextMenuItem>
          </ContextMenuContent>
        )}
      </ContextMenu>

      {/* ----------------- Update Folder Form ----------------- */}
      <UpdateFolderForm
        folder={folder}
        open={editFolder}
        setOpen={setEditFolder}
      />
    </>
  )
}
