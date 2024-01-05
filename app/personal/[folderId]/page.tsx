import NormalFolders from '@/components/NormalFolders'
import { SSRSuspense } from 'http-react'

export default function FolterPage() {
  return (
    <main>
      <SSRSuspense>
        <NormalFolders />
      </SSRSuspense>
    </main>
  )
}
