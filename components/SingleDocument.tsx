'use client'

import Link from 'next/link'
import { Doc } from '@prisma/client'
import { cn } from '@/lib/utils'
import useFetch, { revalidate } from 'http-react'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
// Importing Lucide Icons for consistency with the new design
import {
  FileTextIcon,
  FileCode,
  ArrowRight,
  Trash2,
  ExternalLink
} from 'lucide-react'
import { useState } from 'react'
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

export default function SingleDocument({ doc }: { doc: Doc }) {
  const { folderId } = useParams()

  const {
    data: _,
    reFetch: deleteFile,
    loading: deletingDoc
  } = useFetch('/documents', {
    method: 'DELETE',
    auto: false,
    body: doc,
    id: {
      delete: doc
    },
    onResolve() {
      // Assuming parentFolderId is available or can be derived from the surrounding component
      revalidate(`folder-documents-${folderId}`)
    }
  })

  const [deleting, setDeleting] = useState(false)

  const [itemsToMove, setItemsToMove] = useAtom(itemsToMoveState)

  // Check if this document is the one currently being moved
  const isBeingMoved = itemsToMove.some(item => item.id === doc.id)

  // Use distinct colors based on file type (normal doc or code)
  const isCodeFile = !!doc?.code
  const iconColor = isCodeFile ? 'text-indigo-500' : 'text-green-500'
  const bgColor = isCodeFile ? 'bg-indigo-100' : 'bg-green-100'
  const tagColor = isCodeFile
    ? 'text-indigo-500 bg-indigo-50'
    : 'text-green-500 bg-green-50'
  const hoverBorderColor = isCodeFile
    ? 'hover:border-indigo-400 dark:hover:border-indigo-600'
    : 'hover:border-green-400 dark:hover:border-green-600'

  // The new beautiful document card structure
  const DocumentCardContent = (
    <div
      className={cn(
        'group block rounded-xl p-4 transition-all duration-200 ease-in-out',
        'bg-white shadow-md hover:shadow-lg dark:bg-gray-800 dark:shadow-xl dark:hover:shadow-2xl',
        'transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5',
        'border border-transparent',
        hoverBorderColor, // Dynamic hover border color
        'w-full h-full', // Ensure it fills the grid cell
        deletingDoc && 'opacity-60 cursor-not-allowed animate-pulse',
        isBeingMoved && 'cursor-not-allowed opacity-75 ring-4 ring-blue-500/50' // Moving visual cue
      )}
    >
      <div className='flex flex-col items-center justify-center text-center h-full'>
        {/* Icon Container with dynamic colors */}
        <div
          className={cn(
            'mb-3 p-3 rounded-full transition-colors dark:bg-opacity-20',
            iconColor,
            bgColor
          )}
        >
          {isCodeFile ? (
            <FileCode className='w-8 h-8' />
          ) : (
            <FileTextIcon className='w-8 h-8' />
          )}
        </div>

        {/* Name */}
        <p className='text-sm font-medium text-gray-700 dark:text-gray-200 line-clamp-2 mt-2 px-1'>
          {doc.name?.trim() || 'Untitled Document'}
        </p>

        {/* Type Tag */}
        <span
          className={cn(
            'mt-1 text-xs font-semibold px-2 py-0.5 rounded-full dark:bg-opacity-20',
            tagColor
          )}
        >
          {isCodeFile ? 'Code File' : 'Document'}
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
            <AlertDialogTitle>Delete document</AlertDialogTitle>
            <AlertDialogDescription>
              The document <strong>{doc.name}</strong> will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant='ghost' onClick={() => setDeleting(false)}>
              Cancel
            </Button>
            <Button
              variant='destructive' // Use destructive variant for delete
              onClick={() => {
                deleteFile()
                setDeleting(false)
              }}
              disabled={deletingDoc}
            >
              Confirm Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ----------------- Document Card Link with Context Menu ----------------- */}
      <ContextMenu>
        <ContextMenuTrigger className='w-full h-auto'>
          <Link
            href={'/personal/document/' + doc.id}
            onClick={e => {
              // Prevent navigation if any item is being moved
              if (isBeingMoved) e.preventDefault()
            }}
            className={cn('h-full w-full block select-none')}
          >
            {DocumentCardContent}
          </Link>
        </ContextMenuTrigger>

        {/* Context Menu Content (hidden if the item is being moved) */}
        {!isBeingMoved && (
          <ContextMenuContent
            onClick={e => {
              e.stopPropagation()
            }}
          >
            <ContextMenuItem
              onClick={() => {
                setItemsToMove([doc])
              }}
              className='gap-x-2 flex items-center cursor-pointer'
            >
              <ArrowRight className='w-4 h-4' /> Move
            </ContextMenuItem>

            <ContextMenuItem
              onClick={() => {
                setDeleting(true)
              }}
              className='gap-x-2 flex items-center cursor-pointer text-red-600 dark:text-red-400'
            >
              <Trash2 className='w-4 h-4' /> Delete
            </ContextMenuItem>

            {/* The public link item */}
            <ContextMenuItem asChild>
              <Link
                href={'/public-view/' + doc.publicId}
                target='_blank'
                className='gap-x-2 flex items-center cursor-pointer w-full'
              >
                <ExternalLink className='w-4 h-4' /> Open public link
              </Link>
            </ContextMenuItem>
          </ContextMenuContent>
        )}
      </ContextMenu>
    </>
  )
}
