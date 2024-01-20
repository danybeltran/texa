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
    <header className={cn('sticky top-0 z-50 transition print:hidden')}>
      <div className='max-w-[84rem] mx-auto bg-white dark:bg-[#161616] flex items-center justify-between py-2 px-4 relative backdrop-filter backdrop-blur-lg bg-opacity-80'>
        {/* <div className='absolute left-0 w-full h-full bg-white dark:bg-neutral-950 backdrop-filter backdrop-blur-lg'></div> */}
        <div className='flex items-baseline justify-center gap-x-6'>
          <Link
            className={cn('font-bold text-xl z-10', hidden && 'opacity-10')}
            href={'/'}
          >
            Tx
          </Link>
          <Link className={cn('z-10', hidden && 'opacity-10')} href={'/docs'}>
            Docs
          </Link>
        </div>
        <NavigationMenu>
          <NavigationMenuList className='gap-2'>
            <NavigationMenuItem>
              <Button
                size='sm'
                className={cn(hidden && 'opacity-10')}
                onClick={() => setHidden(h => !h)}
              >
                <FaRegEye />
              </Button>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href='/personal' legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    'font-medium',
                    hidden && 'opacity-10'
                  )}
                >
                  My
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem className={cn(hidden && 'opacity-10')}>
              <AuthButton />
            </NavigationMenuItem>

            <NavigationMenuItem className={cn(hidden && 'opacity-10')}>
              <ThemeToggle />
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  )
}
export default Navbar
