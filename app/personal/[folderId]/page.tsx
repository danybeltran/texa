import NormalFolders from '@/components/NormalFolders'
import { SSRSuspense } from 'http-react'

export default function FolterPage() {
  return (
    <main>
      <SSRSuspense
        fallback={
          <div className='flex items-center justify-center py-16'>
            <p>Loading folder</p>
          </div>
        }
      >
        <NormalFolders />
      </SSRSuspense>
    </main>
  )
}
