'use client'
import useFetch, { useDebounceFetch } from 'http-react'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Doc } from '@prisma/client'
import Link from 'next/link'
import {
  FaBold,
  FaChevronLeft,
  FaItalic,
  FaListOl,
  FaListUl,
  FaLock,
  FaLockOpen,
  FaRegEye,
  FaRegEyeSlash,
  FaStrikethrough,
  FaUnderline
} from 'react-icons/fa6'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

import ResizeTextarea from 'react-textarea-autosize'

import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { renderMD } from '@/lib/md'
import EditorToolbar from './EditorToolbar'

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

  const {
    reFetch: saveDoc,
    data: __,
    loading: savingDoc
  } = useDebounceFetch('/documents', {
    method: 'PUT',
    auto: !loadingDoc && Boolean(doc),
    debounce: '600 ms',
    body: doc
  })

  useEffect(() => {
    const saveDocumentListener = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        if (e.key === 'S' || e.key === 's') {
          e.preventDefault()
          saveDoc()
        }
      }
    }

    document.addEventListener('keydown', saveDocumentListener)

    return () => {
      document.removeEventListener('keydown', saveDocumentListener)
    }
  }, [])

  const renderedPreview = useMemo(
    () => (
      <div
        className='max-w-full overflow-x-auto'
        dangerouslySetInnerHTML={{
          __html: doc?.content
            ? renderMD(doc?.content)
            : '<p class="text-neutral-500 select-none print:hidden">Preview will appear here</p>'
        }}
      ></div>
    ),
    [doc?.content]
  )

  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!loaded) {
      if (doc) {
        const element = document.getElementById('content-editor')
        if (element) {
          element.innerHTML = renderMD(doc.content!)
        }
        setLoaded(true)
      }
    }
  }, [loaded, doc])

  if (!doc)
    return (
      <div className='flex items-center justify-center pt-24'>
        <p>Document not found</p>
      </div>
    )

  return (
    <main className='w-full relative'>
      <div className='flex items-center justify-between print:hidden'>
        <Link
          href={'/personal/' + (doc?.parentFolderId ? doc.parentFolderId : '')}
        >
          <Button variant='ghost' className='gap-x-2' title='Go to folder'>
            <FaChevronLeft /> Close
          </Button>
        </Link>
        <div className='flex items-center gap-x-2'>
          {savingDoc && (
            <div className='pr-4'>
              <AiOutlineLoading3Quarters className='animate-spin' />
            </div>
          )}
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
          {doc.code && (
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
          )}
        </div>
      </div>
      <div className='py-4 space-y-2 print:hidden'>
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
        {doc.code ? (
          <ResizeTextarea
            id='editor-area'
            placeholder='Start writing...'
            className={cn(
              'w-full lg:w-1/2 p-6 resize-none border rounded-lg focus:border-transparent focus:ring-2 focus:outline-none overflow-hidden bg-transparent min-h-72',
              doc.locked && !doc.editorOnly && 'hidden',
              doc.editorOnly && 'w-full',
              'print:hidden'
            )}
            value={doc?.content || ''}
            disabled={doc.locked}
            onChange={e => {
              setDoc(prevDoc => ({
                ...prevDoc,
                content: e.target.value
              }))
            }}
          />
        ) : (
          <div className='w-full md:w-1/2 relative'>
            {!doc?.locked && (
              <EditorToolbar
                onCommand={() => {
                  const editor = document.getElementById('content-editor')

                  if (editor) {
                    setDoc(prevDoc => ({
                      ...prevDoc,
                      content: editor.innerHTML
                    }))
                  }
                }}
              />
            )}
            <div
              tabIndex={0}
              contentEditable={!doc.locked}
              className={cn(
                'w-full border rounded-md p-6 focus:outline-none overflow-hidden bg-transparent whitespace-normal prose',
                doc.locked && !doc.editorOnly && 'hidden',
                'print:hidden'
              )}
              id='content-editor'
              onKeyUp={e => {
                setDoc(prevDoc => ({
                  ...prevDoc,
                  content: e.currentTarget.innerHTML
                }))
              }}
            />
          </div>
        )}
        {doc.code && (
          <div
            className={cn(
              'md-editor-preview w-full md:w-1/2 border-neutral-500 rounded-lg p-3 prose text-black',
              doc.locked && 'w-full',
              doc.editorOnly && 'hidden',
              'print:block'
            )}
          >
            {renderedPreview}
          </div>
        )}
      </div>
    </main>
  )
}
