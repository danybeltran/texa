'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

import { HiMiniComputerDesktop } from 'react-icons/hi2'
import { WiDaySunny } from 'react-icons/wi'
import { FaRegMoon } from 'react-icons/fa6'
import { BrowserOnly, ClientOnly } from 'react-kuh'

const themeIcon = {
  light: <WiDaySunny />,
  dark: <FaRegMoon />,
  system: <HiMiniComputerDesktop />
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <BrowserOnly>
      <Button
        variant='outline'
        size='icon'
        onClick={() => {
          const nextTheme: any = {
            light: 'dark',
            dark: 'system',
            system: 'light'
          }

          setTheme(nextTheme[theme!])
        }}
      >
        <span className='text-lg'>{themeIcon[theme!]}</span>
        <span className='sr-only'>Toggle theme</span>
      </Button>
    </BrowserOnly>
  )
}
