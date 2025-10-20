'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function PublicFolderBackButton() {
  const router = useRouter()

  return (
    <div className='mb-4'>
      <Button
        onClick={() => router.back()}
        variant='secondary'
        size='sm'
        className='gap-x-2'
      >
        <ArrowLeft className='w-4 h-4' /> Back
      </Button>
    </div>
  )
}
