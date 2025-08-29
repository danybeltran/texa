'use client'

import { Doc, Folder } from '@prisma/client'
import { atom, create } from 'atomic-state'
import Cookies from 'js-cookie'

export const itemsToMoveState = atom<(Doc | Folder)[]>({
  key: 'itemToMove',
  default: []
})

export const navHiddenState = create({
  key: 'navHidden',
  default: false,
  persist: true
})

export const themeState = create({
  key: 'theme',
  default: Cookies.get('theme') ?? 'ligth',
  effects: [
    ({ state }) => {
      // Cookies.set('theme', state)
    }
  ]
})

export const useNavHidden = navHiddenState.useValue
export const setNavHidden = navHiddenState.setValue

export const useTheme = themeState.useValue
export const setTheme = themeState.setValue
