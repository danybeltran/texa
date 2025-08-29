'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes'
import { useTheme } from '@/states'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const theme = useTheme()
  return (
    <NextThemesProvider {...props} defaultTheme={theme} forcedTheme={theme}>
      {children}
    </NextThemesProvider>
  )
}
