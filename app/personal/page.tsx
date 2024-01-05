import CreateForm from '@/components/CreateForm'
import RootFolders from '@/components/RootFolders'
import { SSRSuspense } from 'http-react'

export default function PersonalPage() {
  return (
    <main>
      <div className='flex items-center gap-x-4 h-10'>
        <h2>Home</h2>
      </div>
      <div className='flex flex-wrap py-8 pt-11 gap-8'>
        <SSRSuspense>
          <CreateForm folder={{} as any} />
          <RootFolders />
        </SSRSuspense>
      </div>
    </main>
  )
}
