import { SSRSuspense } from 'http-react'
import { Suspense } from 'react'

export default function DocumentLayout({ children }: { children: any }) {
  return (
    <Suspense
      fallback={
        <div className='flex items-center justify-center pt-24'>
          <p>Loading document</p>
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
