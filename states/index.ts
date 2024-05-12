'use client'

import { Doc, Folder } from '@prisma/client'
import { atom } from 'atomic-state'

export const itemsToMoveState = atom<(Doc | Folder)[]>({
  key: 'itemToMove',
  default: []
})
