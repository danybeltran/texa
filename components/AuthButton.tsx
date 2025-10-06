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

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useGoogleSession } from '@/lib/hooks/use-session'

export default function AuthButton() {
  const { data } = useGoogleSession()

  return data?.user ? (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <img className='size-8 rounded-full' src={data?.user?.image!} alt='' />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{data?.user?.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href='/api/auth/signout'>Logout</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Link href='/api/auth/signin'>
      <Button>Sign in</Button>
    </Link>
  )
}
