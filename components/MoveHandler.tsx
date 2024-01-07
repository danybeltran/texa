'use client'

import { itemsToMoveState } from '@/states'
import { useAtom } from 'atomic-state'
import { Button } from './ui/button'
import { FaCheck, FaCross } from 'react-icons/fa6'
import { useParams } from 'next/navigation'
import { FaTimes } from 'react-icons/fa'
import { Client, mutateData, revalidate, serialize } from 'http-react'
import { Folder } from '@prisma/client'

export default function MoveHandler() {
  const params = useParams()

  const folderId = params.folderId ?? null

  const [itemsToMove, setItemsToMove] = useAtom(itemsToMoveState)

  const [movingItem] = itemsToMove

  return movingItem ? (
    <>
      <Button
        disabled={movingItem.parentFolderId === folderId}
        className='gap-x-2'
        onClick={() => {
          Client.put('/api/[place]', {
            params: {
              place: (movingItem as Folder).color ? 'folders' : 'documents'
            },
            body: serialize({
              ...movingItem,
              parentFolderId: folderId
            }),
            onResolve() {
              revalidate(['GET /folders', 'GET /documents', 'parent'])
            }
          })
          setItemsToMove([])
        }}
        size='sm'
      >
        <FaCheck /> Move here
      </Button>
      <Button
        className='gap-x-2 ml-2'
        onClick={() => {
          setItemsToMove([])
        }}
        variant='secondary'
        size='sm'
      >
        <FaTimes />
      </Button>
    </>
  ) : null
}
