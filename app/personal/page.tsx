import CreateForm from '@/components/CreateForm'
import MoveHandler from '@/components/MoveHandler'
import RootFolders from '@/components/RootFolders'

export default function PersonalPage() {
  return (
    <main>
      <div className='flex items-center gap-x-4 h-10'>
        <h2>Home</h2>
      </div>
      <MoveHandler />
      <div className='h-14'></div>
      <div className='h-[78vh] overflow-y-auto'>
        <div className='flex flex-wrap gap-10 '>
          <CreateForm folder={{} as any} />
          <RootFolders />
        </div>
      </div>
    </main>
  )
}
