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

const Navbar = () => {
  const hidden = useNavHidden()
  return (
    <header className={cn('sticky top-0 z-50 transition print:hidden')}>
      <div className='max-w-[84rem] mx-auto bg-white dark:bg-[#161616] flex items-center justify-between py-2 px-4 relative backdrop-filter backdrop-blur-lg bg-opacity-80'>
        {/* <div className='absolute left-0 w-full h-full bg-white dark:bg-neutral-950 backdrop-filter backdrop-blur-lg'></div> */}
        <div className='flex items-baseline justify-center gap-x-6'>
          <Link
            className={cn(
              'font-bold text-xl z-10 transition',
              hidden && 'opacity-0'
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
        <NavigationMenu>
          <NavigationMenuList className='gap-2'>
            <NavigationMenuItem>
              <Button
                size='sm'
                className={cn('transition', hidden && 'opacity-0')}
                onClick={() => setNavHidden(h => !h)}
              >
                <FaRegEye />
              </Button>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href='/personal' legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    'font-medium transition',
                    hidden && 'opacity-0'
                  )}
                >
                  My
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem
              className={cn(' transition', hidden && 'opacity-0')}
            >
              <AuthButton />
            </NavigationMenuItem>

            <NavigationMenuItem
              className={cn(' transition', hidden && 'opacity-0')}
            >
              <BrowserOnly>
                <ThemeToggle />
              </BrowserOnly>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  )
}
export default Navbar
