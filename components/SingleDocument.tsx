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
import { FaFile, FaFileLines, FaFolder, FaRegTrashCan } from 'react-icons/fa6'
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
import { FaExternalLinkAlt } from 'react-icons/fa'
import { FaFileCode } from 'react-icons/fa6'

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
      revalidate(`folder-documents-${folderId}`)
    }
  })

  const [deleting, setDeleting] = useState(false)

  const [itemsToMove, setItemsToMove] = useAtom(itemsToMoveState)

  return (
    <>
      <AlertDialog open={deleting} onOpenChange={setDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document</AlertDialogTitle>
            <AlertDialogDescription>
              The document <strong>{doc.name}</strong> will be deleted
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant='ghost' onClick={() => setDeleting(false)}>
              Cancel
            </Button>
            <Button
              variant='ghost'
              onClick={() => {
                deleteFile()
                setDeleting(false)
              }}
            >
              Confirm
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Link
        href={'/personal/document/' + doc.id}
        onClick={e => {
          if (itemsToMove.length > 0) e.preventDefault()
        }}
        className='select-none h-fit'
      >
        <ContextMenu>
          <ContextMenuTrigger className='h-36 text-center'>
            {doc?.code ? (
              <FaFileCode
                className={cn(
                  'text-9xl hover:opacity-85 transition h-36 p-3.5',
                  deletingDoc && 'cursor-not-allowed animate-pulse',
                  itemsToMove.length > 0 && 'cursor-not-allowed opacity-85'
                )}
                style={{
                  color: '#797979'
                }}
              />
            ) : (
              <FaFileLines
                className={cn(
                  'text-9xl hover:opacity-85 transition h-36 p-3.5',
                  deletingDoc && 'cursor-not-allowed animate-pulse',
                  itemsToMove.length > 0 && 'cursor-not-allowed opacity-85'
                )}
                style={{
                  color: '#6e84ff'
                }}
              />
            )}
            <p className='text-sm w-32 whitespace-pre-line line-clamp-3'>
              {doc.name?.trim() || 'Unnamed document'}
            </p>
          </ContextMenuTrigger>

          {itemsToMove.length > 0 ? null : (
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
                <FaFolder /> Move
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  setDeleting(true)
                }}
                className='gap-x-2 flex items-center cursor-pointer'
              >
                <FaRegTrashCan /> Delete
              </ContextMenuItem>
              <ContextMenuItem>
                <Link
                  href={'/public-view/' + doc.publicId}
                  target='_blank'
                  className='gap-x-2 flex items-center cursor-pointer'
                >
                  <FaExternalLinkAlt /> Open public link
                </Link>
              </ContextMenuItem>
            </ContextMenuContent>
          )}
        </ContextMenu>
      </Link>
    </>
  )
}
