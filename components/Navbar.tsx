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
import { Button } from './ui/button'
import { FaRegEye } from 'react-icons/fa6'
import { useNavHidden, setNavHidden } from '@/states'
import { BrowserOnly } from 'react-kuh'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const Navbar = () => {
  const hidden = useNavHidden()

  const pathname = usePathname()

  const navbarRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    function mouser() {
      setTimeout(() => {
        setNavHidden(false)
      }, 100)
    }

    function mouserHide() {
      setTimeout(() => {
        setNavHidden(true)
      }, 100)
    }

    navbarRef.current?.addEventListener('mousemove', mouser)
    navbarRef.current?.addEventListener('touchmove', mouser)

    window.addEventListener('wheel', mouserHide)

    return () => {
      navbarRef.current?.removeEventListener('mousemove', mouser)
      navbarRef.current?.removeEventListener('touchmove', mouser)

      window.removeEventListener('wheel', mouserHide)
    }
  }, [navbarRef.current])

  return (
    <header
      ref={navbarRef}
      className={cn('sticky top-0 z-50 transition print:hidden')}
    >
      <div className='max-w-[84rem] mx-auto bg-white dark:bg-[#161616] flex items-center justify-between py-2 px-4 relative backdrop-filter backdrop-blur-lg bg-opacity-80'>
        {/* <div className='absolute left-0 w-full h-full bg-white dark:bg-neutral-950 backdrop-filter backdrop-blur-lg'></div> */}
        <div className='flex items-baseline justify-center gap-x-6'>
          <Link
            className={cn(
              'font-bold text-xl z-10 transition',
              hidden && 'opacity-50'
            )}
            href={'/'}
          >
            Tx
          </Link>
          <Link
            className={cn('z-10 transition', hidden && 'opacity-0')}
            href={'/docs'}
          >
            Docs
          </Link>
        </div>
        {pathname.startsWith('/public-view') ? (
          <div className='flex gap-x-2'>
            <Link
              href='/'
              className={cn({
                'opacity-10': hidden
              })}
            >
              <Button variant='outline'>Go to app</Button>
            </Link>
            <ThemeToggle />
          </div>
        ) : (
          <NavigationMenu
            className={cn({
              'opacity-10': hidden
            })}
          >
            <NavigationMenuList className='gap-2'>
              <NavigationMenuItem>
                <Button
                  size='sm'
                  className={cn('transition')}
                  onClick={() => setNavHidden(h => !h)}
                >
                  <FaRegEye />
                </Button>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={cn(
                    navigationMenuTriggerStyle(),
                    'font-medium transition'
                  )}
                >
                  <Link href='/personal'>My</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem
                className={cn(' transition flex items-center')}
              >
                <AuthButton />
              </NavigationMenuItem>

              <NavigationMenuItem className={cn(' transition')}>
                <ThemeToggle />
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        )}
      </div>
    </header>
  )
}
export default Navbar
