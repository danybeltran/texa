'use client'

import MD from 'markdown-it'
import 'markdown-it-latex/dist/index.css'

import { Textarea } from '@/components/ui/textarea'
import useFetch, { useDebounceFetch } from 'http-react'
import { Doc } from '@prisma/client'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FaChevronLeft, FaLock, FaLockOpen } from 'react-icons/fa6'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { cn } from '@/lib/utils'

const markdown = new MD()
  .use(require('markdown-it-math'))
  .use(require('markdown-it-texmath'), {
    engine: require('katex'),
    delimiters: 'dollars',
    katexOptions: { macros: { '\\RR': '\\mathbb{R}' } }
  })

export default function DocumentPage({ params }: { params: { id: string } }) {
  const {
    data: doc,
    loading: loadingDoc,
    loadingFirst,
    mutate: setDoc
  } = useFetch<Doc>('/documents', {
    id: {
      doc: params
    },
    query: {
      id: params.id
    }
  })

  const {} = useDebounceFetch('/documents', {
    method: 'PUT',
    auto: !loadingDoc,
    debounce: '500 ms',
    body: doc
  })

  if (loadingFirst) {
    return (
      <div className='flex items-center justify-center pt-24'>
        <p>Loading document</p>
      </div>
    )
  }

  if (!doc)
    return (
      <div className='flex items-center justify-center pt-24'>
        <p>Document not found</p>
      </div>
    )
  return (
    <main className='w-full'>
      <div className='flex items-center justify-between'>
        <Link
          href={'/personal/' + (doc?.parentFolderId ? doc.parentFolderId : '')}
        >
          <Button variant='ghost' className='gap-x-2' title='Open public link'>
            <FaChevronLeft /> Return to folder
          </Button>
        </Link>
        <div className='flex items-center gap-x-2'>
          <Link href={'/public-view/' + doc.publicId} target='_blank'>
            <Button className='gap-x-2'>
              <FaExternalLinkAlt />{' '}
              <span className='hidden md:inline-block'>Open public link</span>
            </Button>
          </Link>
          <Button
            className='gap-x-2'
            onClick={() => {
              setDoc(prevDoc => ({
                ...prevDoc,
                locked: !prevDoc.locked
              }))
            }}
          >
            {doc.locked ? <FaLock /> : <FaLockOpen />}{' '}
            <span className='hidden md:inline-block'>
              {doc.locked ? 'Locked' : 'Editing'}
            </span>
          </Button>
        </div>
      </div>
      <div className='py-4'>
        <Input
          value={doc?.name!}
          onChange={e =>
            setDoc(prevDoc => ({ ...prevDoc, name: e.target.value }))
          }
          className='font-semibold text-xl py-4'
        />
      </div>

      <div
        className={cn(
          'flex border-white w-full gap-x-4 py-8',
          doc.locked && 'justify-center'
        )}
      >
        <Textarea
          style={{
            display: doc.locked ? 'none' : 'inherit'
          }}
          placeholder='Start writing...'
          className='w-1/2 p-6 text-lg'
          value={doc?.content || ''}
          autoFocus
          onFocus={e => {
            const heightOffset = 3
            e.currentTarget.style.height = 'auto'
            e.currentTarget.style.height =
              e.currentTarget.scrollHeight + heightOffset + 'px'
          }}
          onChange={e => {
            const heightOffset = 3
            e.currentTarget.style.height = 'auto'
            e.currentTarget.style.height =
              e.currentTarget.scrollHeight + heightOffset + 'px'

            setDoc(prevDoc => ({
              ...prevDoc,
              content: e.target.value
            }))
          }}
        />
        <div
          className={cn(
            'md-editor-preview w-1/2 border-neutral-500 rounded-lg p-6 prose text-black',
            doc.locked && 'w-full'
          )}
          dangerouslySetInnerHTML={{
            __html: doc?.content
              ? markdown.render(doc?.content || '')
              : '<p class="text-neutral-500 select-none">Preview will appear here</p>'
          }}
        ></div>
      </div>
    </main>
  )
}
