'use client'

import MD from 'markdown-it'

import { Textarea } from '@/components/ui/textarea'
import useFetch, { useDebounceFetch } from 'http-react'
import { Doc } from '@prisma/client'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  FaChevronLeft,
  FaLock,
  FaLockOpen,
  FaRegEye,
  FaRegEyeSlash
} from 'react-icons/fa6'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { cn } from '@/lib/utils'
import { useParams } from 'next/navigation'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'

const markdown = new MD()
  .use(require('markdown-it-math'))
  .use(require('markdown-it-texmath'), {
    engine: require('katex'),
    delimiters: 'dollars',
    katexOptions: { macros: { '\\RR': '\\mathbb{R}' } }
  })

export default function DocumentView() {
  const params: { id: string } = useParams()

  const {
    data: doc,
    loading: loadingDoc,
    mutate: setDoc
  } = useFetch<Doc>('/documents', {
    suspense: true,
    id: {
      doc: params
    },
    query: {
      id: params.id
    }
  })

  useDebounceFetch('/documents', {
    method: 'PUT',
    auto: !loadingDoc,
    debounce: '200 ms',
    body: doc
  }).data

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
          <Button
            className='gap-x-2'
            onClick={() => {
              setDoc(prev => ({
                ...prev,
                editorOnly: !prev.editorOnly
              }))
            }}
          >
            {doc.editorOnly ? <FaRegEyeSlash /> : <FaRegEye />}{' '}
            <span className='hidden md:inline-block'>
              {doc.editorOnly ? 'Preview hidden' : 'Preview shown'}
            </span>
          </Button>
        </div>
      </div>
      <div className='py-4 space-y-2'>
        <Input
          disabled={doc.locked}
          value={doc?.name!}
          onChange={e =>
            setDoc(prevDoc => ({ ...prevDoc, name: e.target.value }))
          }
          className='font-semibold text-xl py-4'
        />
        <Textarea
          disabled={doc.locked}
          value={doc.description || ''}
          placeholder='Document description'
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

            setDoc(prevDoc => ({ ...prevDoc, description: e.target.value }))
          }}
          className='resize-none'
        />
      </div>

      <div
        className={cn(
          'flex flex-col md:flex-row border-white w-full gap-x-4 py-8 justify-center'
        )}
      >
        <Textarea
          style={{
            display: doc.locked && !doc.editorOnly ? 'none' : 'inherit'
          }}
          placeholder='Start writing...'
          className='w-full md:w-1/2 p-6 text-lg resize-none'
          value={doc?.content || ''}
          autoFocus
          onFocus={e => {
            const heightOffset = 3
            e.currentTarget.style.height = 'auto'
            e.currentTarget.style.height =
              e.currentTarget.scrollHeight + heightOffset + 'px'
          }}
          disabled={doc.locked}
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
            'md-editor-preview w-full sm:w-1/2 border-neutral-500 rounded-lg p-6 prose text-black',
            doc.locked && 'w-full',
            doc.editorOnly && 'hidden'
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
