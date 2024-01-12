'use client'

import { FaPrint } from 'react-icons/fa6'
import { Button } from './ui/button'

export default function PublicPrintButton() {
  return (
    <Button
      className='gap-x-2'
      variant='secondary'
      onClick={() => {
        print()
      }}
    >
      <FaPrint />
    </Button>
  )
}
