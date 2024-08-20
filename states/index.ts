'use client'

import { Doc, Folder } from '@prisma/client'
import { atom, create } from 'atomic-state'

export const itemsToMoveState = atom<(Doc | Folder)[]>({
  key: 'itemToMove',
  default: []
})

export const navHiddenState = create({
  key: 'navHidden',
  default: false,
  persist: true
})

export const useNavHidden = navHiddenState.useValue
export const setNavHidden = navHiddenState.setValue
