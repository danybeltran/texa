'use client'
import useFetch, { useDebounceFetch } from 'http-react'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Doc } from '@prisma/client'
import Link from 'next/link'
import {
  FaChevronLeft,
  FaLock,
  FaLockOpen,
  FaRegEye,
  FaRegEyeSlash
} from 'react-icons/fa6'
import { CiCircleInfo } from 'react-icons/ci'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import ResizeTextarea from 'react-textarea-autosize'

import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { renderMD } from '@/lib/md'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from './ui/dialog'
import { Label } from './ui/label'

import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { useTheme } from 'next-themes'

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
          if (!doc.locked) {
            saveDoc()
          }
        }
      }
    }

    document.addEventListener('keydown', saveDocumentListener)

    return () => {
      document.removeEventListener('keydown', saveDocumentListener)
    }
  }, [doc.locked])

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

  const [showMetadata, setShowMetadata] = useState(false)

  useEffect(() => {
    if (!loaded) {
      if (doc) {
        if (!doc.code) {
          setShowMetadata(false)
          const element = document.getElementById('content-editor')
          if (element) {
            if (doc?.content) {
              element.innerHTML = doc.content!
            }
          }
          setLoaded(true)
        }
      }
    }
  }, [loaded, doc.content])

  const { theme } = useTheme()

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
            <Button variant='secondary' className='gap-x-2'>
              <FaExternalLinkAlt />{' '}
            </Button>
          </Link>
          <Button
            className='gap-x-2'
            variant='secondary'
            onClick={() => {
              setDoc(prevDoc => ({
                ...prevDoc,
                locked: !prevDoc.locked
              }))
            }}
          >
            {doc.locked ? <FaLock /> : <FaLockOpen />}{' '}
          </Button>
          {doc.code && (
            <Button
              className='gap-x-2'
              variant='secondary'
              onClick={() => {
                setDoc(prev => ({
                  ...prev,
                  editorOnly: !prev.editorOnly
                }))
              }}
            >
              {doc.editorOnly ? <FaRegEyeSlash /> : <FaRegEye />}{' '}
            </Button>
          )}
          <Button
            onClick={() => {
              setShowMetadata(m => !m)
            }}
            className='gap-x-2'
            variant='secondary'
          >
            <CiCircleInfo className='text-lg' />{' '}
          </Button>
        </div>
      </div>

      <Dialog open={showMetadata} onOpenChange={setShowMetadata}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Document details</DialogTitle>
            <DialogDescription>Edit document information</DialogDescription>
          </DialogHeader>
          <div className='py-4 print:hidden'>
            <Label>
              <p className='py-2'>Name</p>
              <Input
                value={doc?.name!}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setShowMetadata(false)
                  }
                }}
                onChange={e =>
                  setDoc(prevDoc => ({ ...prevDoc, name: e.target.value }))
                }
              />
            </Label>
            <br />
            <Label>
              <p className='py-2'>Description</p>
              <Textarea
                value={doc.description || ''}
                placeholder='Document description'
                onFocus={e => {
                  e.currentTarget.style.height =
                    calcHeight(e.target.value) + 3 + 'px'
                }}
                onKeyUp={e => {
                  if (e.ctrlKey) {
                    if (e.key === 'Enter') {
                      setShowMetadata(false)
                    }
                  }
                }}
                onChange={e => {
                  e.currentTarget.style.height =
                    calcHeight(e.target.value) + 3 + 'px'

                  setDoc(prevDoc => ({
                    ...prevDoc,
                    description: e.target.value
                  }))
                }}
                className='resize-none'
              />
            </Label>
          </div>
          <div className='text-center'>
            <Button onClick={() => setShowMetadata(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

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
          <div className='w-full md:w-1/2 relative prose mb-48'>
            <style>
              {`

                      ${
                        theme === 'dark'
                          ? `
                        .ck-editor .ck-content {
                        background-color: #0A0A0A !important;
                        color: white !important;
                      }

                      .ck-editor .ck-content *{
                        color: white !important;
                      }

                      .ck-editor .ck-editor__top * {
                        background-color: #0A0A0A !important;
                        color: white !important;
                      }  
                        `
                          : ''
                      }


                      .ck-editor__top {
                        position: sticky !important;
                        z-index: 50;
                        border-bottom: 1px solid lightgray !important;
                        top: 20px !important;
                      }

                      
                      .ck-content {
                        border: none !important;
                        min-height: 100vh;
                      }

                      .ck-content:focus {
                        box-shadow: none !important;
                      }
                    `}
            </style>
            {doc.locked && (
              <style>
                {`
                  .ck-editor__top {
                    display: none;
                  }
                `}
              </style>
            )}
            <CKEditor
              onReady={editor => editor.focus()}
              disabled={doc.locked}
              editor={ClassicEditor}
              data={doc?.content}
              config={{
                placeholder: 'Start writing...'
              }}
              // onFocus={(_, editor) => {
              //   editor.editing.view.document.on(
              //     'enter',
              //     (evt, data) => {
              //       if (data.isSoft) {
              //         editor.execute('shiftEnter')
              //       } else {
              //         editor.execute('enter')
              //       }

              //       data.preventDefault()
              //       evt.stop()
              //       editor.editing.view.scrollToTheSelection()
              //     },
              //     { priority: 'high' }
              //   )
              // }}
              onChange={(_, editor) => {
                const textData = editor.getData()
                setDoc(prevDoc => ({
                  ...prevDoc,
                  content: textData
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
