import Link from 'next/link'
import { TfiWrite } from 'react-icons/tfi'

import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <>
      <section className='space-y-6 pb-8 py-8  md:py-16 lg:py-20 '>
        <div className='container flex max-w-[64rem] flex-col items-center gap-4 text-center mx-auto'>
          <h1 className='font-bold leading-normal text-3xl sm:text-5xl md:text-6xl lg:text-7xl'>
            Welcome to Texa
          </h1>
          <p className='max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8'>
            Texa is the online Markdown and LaTeX editor
          </p>
          <div className='flex gap-x-2 *:*:gap-x-2'>
            <Link href='/personal' rel='noreferrer'>
              <Button variant='outline'>
                <TfiWrite />
                Start writing
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* <section
        id='features'
        className='container space-y-6 py-8 dark:bg-transparent md:py-12 lg:py-24 mx-auto'
      >
        <div className='mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center'>
          <h2 className='font-bold text-2xl leading-[1.1] sm:text-2xl md:text-4xl'>
            Features
          </h2>
        </div>
        <div className='mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3'>
          <div className='relative overflow-hidden rounded-lg border bg-background p-2 text-center'>
            <div className='flex h-[180px] flex-col justify-center gap-y-4 items-center rounded-md p-6'>
              <TbBrandNextjs size={40} />
              <div className='space-y-2'>
                <h3 className='font-bold leading-normal'>Next.js 14</h3>
                <p className='text-sm text-muted-foreground'>
                  App dir, Routing, Layouts, Loading UI and API routes.
                </p>
              </div>
            </div>
          </div>
          <div className='relative overflow-hidden rounded-lg border bg-background p-2 text-center'>
            <div className='flex h-[180px] flex-col justify-center gap-y-4 items-center rounded-md p-6'>
              <FaReact size={40} />
              <div className='space-y-2'>
                <h3 className='font-bold leading-normal'>React 18</h3>
                <p className='text-sm text-muted-foreground'>
                  Server and Client Components.
                </p>
              </div>
            </div>
          </div>
          <div className='relative overflow-hidden rounded-lg border bg-background p-2 text-center'>
            <div className='flex h-[180px] flex-col justify-center gap-y-4 items-center rounded-md p-6'>
              <div className='flex items-center justify-center gap-x-3'>
                <SiPrisma size={40} />
                <GoPlus size={20} />
                <BiLogoMongodb size={40} />
              </div>
              <div className='space-y-2'>
                <h3 className='font-bold leading-normal'>Database</h3>
                <p className='text-sm text-muted-foreground'>
                  ORM using Prisma and deployed on MongoDB.
                </p>
              </div>
            </div>
          </div>
          <div className='relative overflow-hidden rounded-lg border bg-background p-2 text-center'>
            <div className='flex h-[180px] flex-col justify-center gap-y-4 items-center rounded-md p-6'>
              <SiTailwindcss size={40} />
              <div className='space-y-2'>
                <h3 className='font-bold leading-normal'>Components</h3>
                <p className='text-sm text-muted-foreground'>
                  UI components built using Radix UI and styled with Tailwind
                  CSS.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section> */}
    </>
  )
}
