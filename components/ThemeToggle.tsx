'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'

import { HiMiniComputerDesktop } from 'react-icons/hi2'
import { WiDaySunny } from 'react-icons/wi'
import { FaRegMoon } from 'react-icons/fa6'
import { setTheme, useTheme } from '@/states'
import Cookies from 'js-cookie'

const themeIcon = {
  light: <WiDaySunny />,
  dark: <FaRegMoon />,
  system: <HiMiniComputerDesktop />
}

export function ThemeToggle() {
  const theme = useTheme()

  return (
    <Button
      variant='outline'
      size='icon'
      onClick={() => {
        const nextTheme: any = {
          light: 'dark',
          dark: 'light'
        }

        Cookies.set('theme', nextTheme[theme])
        setTheme(nextTheme[theme])
      }}
    >
      <span className='text-lg'>{themeIcon[theme!]}</span>
      <span className='sr-only'>Toggle theme</span>
    </Button>
  )
}
