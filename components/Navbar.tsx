'use client'
import Link from 'next/link'

import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu'
import AuthButton from './AuthButton'
import { useState } from 'react'
import { Button } from './ui/button'
import { FaChevronUp, FaRegEye } from 'react-icons/fa6'
import { atom, useAtom } from 'atomic-state'

const navHiddenState = atom({
  key: 'navHidden',
  default: false,
  persist: true
})

const Navbar = () => {
  const [hidden, setHidden] = useAtom(navHiddenState)
  return (
    <header
      className={cn(
        'bg-white dark:bg-neutral-950 sticky top-0 z-50 transition print:hidden',
        hidden && 'opacity-10'
      )}
    >
      <div className='max-w-7xl mx-auto flex items-center justify-between py-2 px-4'>
        <Link className='font-bold text-lg' href={'/'}>
          TeXa
        </Link>
        <NavigationMenu>
          <NavigationMenuList className='gap-2'>
            <NavigationMenuItem>
              <Button size='sm' onClick={() => setHidden(h => !h)}>
                <FaRegEye />
              </Button>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href='/personal' legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(navigationMenuTriggerStyle(), 'font-medium')}
                >
                  My space
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <AuthButton />
            </NavigationMenuItem>

            <NavigationMenuItem>
              <ThemeToggle />
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  )
}
export default Navbar
