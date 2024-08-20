'use client'

import { FaPrint } from 'react-icons/fa6'
import { Button } from './ui/button'
import { useNavHidden } from '@/states'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

export default function PublicPrintButton() {
  const hidden = useNavHidden()

  return (
    <Button
      className={cn(
        'gap-x-2 opacity-50 hover:opacity-90 transition',
        hidden && 'opacity-0'
      )}
      size='sm'
      variant='secondary'
      onClick={() => {
        print()
      }}
    >
      <FaPrint />
    </Button>
  )
}
