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
import { FolderOpen, BookText } from 'lucide-react'
import { usePathname } from 'next/navigation'

const Navbar = () => {
  const pathname = usePathname()

  return (
    <header
      // The header is now always visible
      className={cn(
        'sticky top-0 z-50 shadow-sm transition-all duration-300 print:hidden border-b'
      )}
    >
      <div
        className={cn(
          'max-w-[84rem] mx-auto flex items-center justify-between py-3 px-4 relative',
          'backdrop-blur-sm bg-transparent'
        )}
      >
        {/* --- Left Section: Logo and Main Links --- */}
        <div className='flex items-center gap-x-8'>
          {/* Logo/Brand (Tx) */}
          <Link
            className='font-extrabold text-2xl tracking-tight text-primary z-10'
            href={'/'}
          >
            Tx
          </Link>

          {/* Docs Link */}
          <div className='hidden md:flex items-center gap-x-4 text-sm'>
            <Link
              className='text-foreground/70 hover:text-foreground transition-colors font-medium'
              href={'/docs'}
            >
              <BookText className='w-4 h-4 inline-block mr-1' /> Docs
            </Link>
          </div>
        </div>

        {/* --- Right Section: Context-Specific Navigation --- */}
        {pathname.startsWith('/public-view') ? (
          /* --- Public View Menu --- */
          <div className='flex items-center gap-x-2'>
            <Link href='/' className='transition-opacity'>
              <Button variant='default' size='sm'>
                Go to App
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        ) : (
          /* --- Private/App Menu --- */
          <NavigationMenu>
            <NavigationMenuList className='gap-1 md:gap-2'>
              {/* NOTE: The Eye Toggle Button has been removed */}

              {/* My Folder Link */}
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={cn(
                    navigationMenuTriggerStyle(),
                    'font-medium text-foreground/80 hover:text-foreground transition-colors p-2 md:px-3 md:py-2 bg-transparent'
                  )}
                >
                  <Link href='/personal'>
                    <FolderOpen className='w-4 h-4 mr-1 md:mr-2' />
                    My Space
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Auth Button (Sign In/Profile) */}
              <NavigationMenuItem>
                <AuthButton />
              </NavigationMenuItem>

              {/* Theme Toggle */}
              <NavigationMenuItem>
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
