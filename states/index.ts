'use client'

import { Doc, Folder } from '@prisma/client'
import { atom } from 'atomic-state'

export const countState = atom({
  key: 'count',
  default: 0
})

export const itemsToMoveState = atom<(Doc | Folder)[]>({
  key: 'itemToMove',
  default: []
})
