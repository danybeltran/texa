import Link from 'next/link'
import { TfiGithub, TfiWrite } from 'react-icons/tfi'

import { Button } from '@/components/ui/button'
import { CiEdit } from 'react-icons/ci'
import { FaFolder, FaMarkdown } from 'react-icons/fa6'
import { MdMoneyOffCsred } from 'react-icons/md'
import { FaCoffee, FaShareAlt } from 'react-icons/fa'

export default function Home() {
  return (
    <>
      <section className='space-y-6 pb-8 py-8  md:py-16 lg:py-20 '>
        <div className='container flex max-w-[64rem] flex-col items-center gap-4 text-center mx-auto'>
          <h1 className='font-bold leading-normal text-3xl sm:text-5xl md:text-6xl lg:text-7xl'>
            Welcome to Texa
          </h1>
          <p className='max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8'>
            Texa is an all-in-one rich content, Markdown and KaTeX editor.
          </p>

          <div className='flex gap-x-2 *:*:gap-x-2'>
            <Link href='/personal' rel='noreferrer'>
              <Button variant='outline'>
                <TfiWrite />
                Start writing
              </Button>
            </Link>
            <Link
              href='https://github.com/danybeltran/texa'
              target='_blank'
              rel='noreferrer'
            >
              <Button variant='outline'>
                <TfiGithub />
                Github
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <section
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
              <MdMoneyOffCsred size={40} />
              <div className='space-y-2'>
                <h3 className='font-bold leading-normal'>Free. Forever.</h3>
                <p className='text-sm text-muted-foreground'>Just write</p>
              </div>
            </div>
          </div>
          <div className='relative overflow-hidden rounded-lg border bg-background p-2 text-center'>
            <div className='flex h-[180px] flex-col justify-center gap-y-4 items-center rounded-md p-6'>
              <FaShareAlt size={40} />
              <div className='space-y-2'>
                <h3 className='font-bold leading-normal'>
                  Instant feedback and sharing
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Create, write and share with a link
                </p>
              </div>
            </div>
          </div>
          <div className='relative overflow-hidden rounded-lg border bg-background p-2 text-center'>
            <div className='flex h-[180px] flex-col justify-center gap-y-4 items-center rounded-md p-6'>
              <FaFolder size={40} />
              <div className='space-y-2'>
                <h3 className='font-bold leading-normal'>
                  Organize everything
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Create, move and edit folders and documents
                </p>
              </div>
            </div>
          </div>
          <div className='relative overflow-hidden rounded-lg border bg-background p-2 text-center'>
            <div className='flex h-[180px] flex-col justify-center gap-y-4 items-center rounded-md p-6'>
              <CiEdit size={40} />
              <div className='space-y-2'>
                <h3 className='font-bold leading-normal'>
                  Rich content editing
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Powered by CKEditor, one of the best WYSIWYG editors out there
                </p>
              </div>
            </div>
          </div>
          <div className='relative overflow-hidden rounded-lg border bg-background p-2 text-center'>
            <div className='flex h-[180px] flex-col justify-center gap-y-4 items-center rounded-md p-6'>
              <FaMarkdown size={40} />
              <div className='space-y-2'>
                <h3 className='font-bold leading-normal'>Markdown</h3>
                <p className='text-sm text-muted-foreground'>
                  Everything markdown, with custom helpful tags like{' '}
                  {`<justify>, <tex>`}
                </p>
              </div>
            </div>
          </div>
          <div className='relative overflow-hidden rounded-lg border bg-background p-2 text-center'>
            <div className='flex h-[180px] flex-col justify-center gap-y-4 items-center rounded-md p-6'>
              <FaCoffee size={40} />
              <div className='space-y-2'>
                <h3 className='font-bold leading-normal'>
                  Math, Mermaid, and more!
                </h3>
                <p className='text-sm text-muted-foreground'>
                  KaTeX is supported out of the box in code-only documents
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
