'use client'
import useFetch, { useDebounceFetch } from 'http-react'
import { useParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { Doc } from '@prisma/client'
import Link from 'next/link'
import {
  FaChevronLeft,
  FaLock,
  FaLockOpen,
  FaRegEye,
  FaRegEyeSlash
} from 'react-icons/fa6'
import { FaExternalLinkAlt } from 'react-icons/fa'

import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { renderMD } from '@/lib/md'

function calcHeight(value: string) {
  let numberOfLineBreaks = (value.match(/\n/g) || []).length
  // min-height + lines x line-height + padding + border
  let newHeight = 20 + numberOfLineBreaks * 20 + 12 + 2
  return newHeight
}

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
    onResolve() {},
    query: {
      id: params.id
    }
  })

  useEffect(() => {
    setTimeout(() => {
      const editor = document.getElementById('editor-area')

      if (editor) {
        const heightOffset = 3
        editor.style.height = 'auto'
        editor.style.height = editor.scrollHeight + heightOffset + 'px'
      }
    }, 100)
  }, [doc?.locked, doc?.editorOnly])

  const { reFetch: saveDoc, data: __ } = useDebounceFetch('/documents', {
    method: 'PUT',
    auto: !loadingDoc && Boolean(doc),
    debounce: '600 ms',
    body: doc
  })

  const renderedPreview = useMemo(
    () => (
      <div
        className='max-w-full overflow-x-auto'
        dangerouslySetInnerHTML={{
          __html: doc?.content
            ? renderMD(doc?.content)
            : '<p class="text-neutral-500 select-none">Preview will appear here</p>'
        }}
      ></div>
    ),
    [doc?.content]
  )

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
            <FaChevronLeft /> Close
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
            e.currentTarget.style.height = calcHeight(e.target.value) + 3 + 'px'
          }}
          onChange={e => {
            e.currentTarget.style.height = calcHeight(e.target.value) + 3 + 'px'

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
          id='editor-area'
          placeholder='Start writing...'
          className='w-full lg:w-1/2 p-6 text-lg resize-none'
          value={doc?.content || ''}
          autoFocus
          onFocus={e => {
            const heightOffset = 3
            e.currentTarget.style.height = 'auto'
            e.currentTarget.style.height =
              e.currentTarget.scrollHeight + heightOffset + 'px'
          }}
          onKeyDown={e => {
            if (e.ctrlKey) {
              if (e.key === 'S' || e.key === 's') {
                e.preventDefault()
                saveDoc()
              }
            }
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
            'md-editor-preview w-full md:w-1/2 border-neutral-500 rounded-lg p-3 prose text-black',
            doc.locked && 'w-full',
            doc.editorOnly && 'hidden'
          )}
        >
          {renderedPreview}
        </div>
      </div>
    </main>
  )
}
