'use client'

import Link from 'next/link'
import { IoDocumentTextOutline } from 'react-icons/io5'
import { Doc, Folder } from '@prisma/client'
import { cn } from '@/lib/utils'
import useFetch, { revalidate } from 'http-react'
import { storage } from 'atomic-state'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
import { FaFile } from 'react-icons/fa6'

export default function SingleDocument({ doc }: { doc: Doc }) {
  const {
    data: _,
    reFetch: deleteFolder,
    loading: deletingFolder
  } = useFetch('/documents', {
    method: 'DELETE',
    auto: false,
    body: doc,
    id: {
      delete: doc
    },
    onResolve() {
      revalidate([
        doc
          ? {
              folderId: doc.parentFolderId
            }
          : 'parent',
        'GET /documents'
      ])
    }
  })

  return (
    <Link href={'/personal/document/' + doc.id} className='h-36'>
      <ContextMenu>
        <ContextMenuTrigger className='h-36 text-center'>
          <FaFile
            className={cn(
              'text-9xl hover:opacity-85 transition h-36 p-3.5',
              deletingFolder && 'cursor-not-allowed animate-pulse'
            )}
            style={{
              color: '#616161'
            }}
          />
          <p className='text-sm w-32 whitespace-pre-line'>{doc.name}</p>
        </ContextMenuTrigger>

        <ContextMenuContent
          onClick={e => {
            e.stopPropagation()
          }}
        >
          {/* <ContextMenuItem>Edit</ContextMenuItem>
          <ContextMenuItem>Move</ContextMenuItem> */}
          <ContextMenuItem onClick={deleteFolder}>Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </Link>
  )
}
