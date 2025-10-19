import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LogOut, User, KeyRound, FolderOpen } from 'lucide-react' // Using Lucide icons

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useGoogleSession } from '@/lib/hooks/use-session'

export default function AuthButton() {
  const { data } = useGoogleSession()
  const user = data?.user

  // --------------------------------------------------------
  // If the user is signed in (Dropdown Menu with Avatar)
  // --------------------------------------------------------
  if (user) {
    const fallbackName = user.name ? user.name.charAt(0).toUpperCase() : 'U'
    const userEmail = user.email || 'No email provided'

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {/* Use the Avatar component for a consistent look */}
          <Button variant='ghost' className='relative h-9 w-9 rounded-full p-0'>
            <Avatar className='h-9 w-9 border-2 border-transparent hover:border-primary transition-colors'>
              {/* AvatarImage must be placed inside Avatar */}
              <AvatarImage src={user.image!} alt={user.name || 'User avatar'} />
              <AvatarFallback className='bg-primary/20 text-primary font-semibold text-sm'>
                {fallbackName}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' forceMount>
          {/* User Info Header */}
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium leading-none line-clamp-1'>
                {user.name || 'Account'}
              </p>
              <p className='text-xs leading-none text-muted-foreground line-clamp-1'>
                {userEmail}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* My Space Link (Helpful navigation shortcut) */}
          <DropdownMenuItem asChild className='cursor-pointer gap-x-2'>
            <Link href='/personal'>
              <FolderOpen className='mr-2 h-4 w-4' />
              My Space
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Logout Button */}
          <DropdownMenuItem
            asChild
            className='cursor-pointer text-red-600 dark:text-red-400'
          >
            <Link href='/api/auth/signout' className='w-full'>
              <LogOut className='mr-2 h-4 w-4' />
              Log out
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // --------------------------------------------------------
  // If the user is signed out (Sign In Button)
  // --------------------------------------------------------
  return (
    <Link href='/api/auth/signin'>
      <Button size='sm' className='gap-x-1.5'>
        <KeyRound className='h-4 w-4' />
        Sign in
      </Button>
    </Link>
  )
}
