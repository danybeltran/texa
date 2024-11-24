'use client'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import Editor from '@monaco-editor/react'
import { Doc } from '@prisma/client'
import copy from 'copy-to-clipboard'
import useFetch, { useDebounceFetch } from 'http-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { CiCircleInfo } from 'react-icons/ci'
import { FaExternalLinkAlt } from 'react-icons/fa'
import {
  FaChevronLeft,
  FaLock,
  FaLockOpen,
  FaRegEye,
  FaRegEyeSlash
} from 'react-icons/fa6'
import { IoIosLink } from 'react-icons/io'
import { MdPrint } from 'react-icons/md'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { renderMD } from '@/lib/md'
import { cn } from '@/lib/utils'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from './ui/dialog'
import { Label } from './ui/label'

import { useTheme } from 'next-themes'
import { useToast } from './ui/use-toast'
import { setNavHidden, useNavHidden } from '@/states'

function calcHeight(value: string) {
  let numberOfLineBreaks = (value.match(/\n/g) || []).length
  // min-height + lines x line-height + padding + border
  let newHeight = 20 + numberOfLineBreaks * 20 + 12 + 2
  return newHeight
}

export default function DocumentView() {
  const params: { id: string } = useParams()

  const hidden = useNavHidden()

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
          if (!doc?.locked) {
            saveDoc()
          }
        }
      }
    }

    document.addEventListener('keydown', saveDocumentListener)

    return () => {
      document.removeEventListener('keydown', saveDocumentListener)
    }
  }, [doc?.locked])

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
  }, [loaded, doc?.content])

  const { toast } = useToast()

  const { theme } = useTheme()

  if (!doc)
    return (
      <div className='flex items-center flex-wrap justify-center pt-24'>
        <p className='w-full text-center pb-10'>Document not found</p>
        <Link href='/personal'>
          <Button>Return to home</Button>
        </Link>
      </div>
    )

  return (
    <main className='w-full relative'>
      <head>
        <title>{doc.name}</title>
      </head>
      <div
        className={cn(
          'flex items-center justify-between print:hidden transition',
          hidden && 'opacity-0'
        )}
      >
        <Link
          href={'/personal/' + (doc?.parentFolderId ? doc.parentFolderId : '')}
        >
          <Button variant='ghost' className='gap-x-2' title='Go to folder'>
            <FaChevronLeft /> Close
          </Button>
        </Link>
        <div
          className={cn(
            'flex items-center gap-x-2 transition',
            hidden && 'opacity-0'
          )}
        >
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
            className='gap-x-2'
            variant='secondary'
            onClick={() => {
              print()
            }}
          >
            <MdPrint className='text-lg' />
          </Button>

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
                onChange={e => {
                  setDoc(prevDoc => ({ ...prevDoc, name: e.target.value }))
                }}
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
            <br />
            <div>
              <p className='py-2 text-sm font-medium'>Other</p>
              <Button
                onClick={() => {
                  copy(location.origin + '/public-view/' + doc.publicId)
                  toast({
                    title: 'Link copied',
                    description: 'Public view link was copied'
                  })
                }}
                variant='outline'
                className='flex items-center gap-x-2'
              >
                <IoIosLink /> Copy public link
              </Button>
            </div>
          </div>
          <div className='text-center'>
            <Button onClick={() => setShowMetadata(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div
        className={cn(
          'flex flex-col md:flex-row w-full gap-x-4 py-8 print:py-0 justify-center'
        )}
      >
        {doc.code ? (
          <div
            className={cn(
              'print:hidden',
              doc.editorOnly ? 'w-full' : doc.locked ? 'hidden' : 'w-1/2'
            )}
            style={{
              height: '34rem'
            }}
          >
            {(!doc.locked || doc.editorOnly) && (
              <Editor
                loading
                options={{
                  readOnly: doc.locked,
                  mouseWheelZoom: true
                }}
                value={doc.content!}
                onChange={v => {
                  setNavHidden(true)

                  if (!doc.locked) {
                    setDoc(prevDoc => ({
                      ...prevDoc,
                      content: v!
                    }))
                  }
                }}
                onMount={e => {
                  e.focus()
                }}
                theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                width={'100%'}
                defaultLanguage='markdown'
                className={cn(
                  'first:peer-first:p-4 resize-none border rounded-lg focus:border-transparent focus:ring-2 focus:outline-none overflow-hidden bg-transparent min-h-72',
                  doc.locked && !doc.editorOnly && 'hidden',
                  doc.editorOnly && 'w-full',
                  'print:hidden'
                )}
              />
            )}
          </div>
        ) : (
          <div className='w-full relative prose max-w-3xl ck-content mb-48 print:mb-0'>
            <style>
              {`
                ${
                  theme === 'dark'
                    ? `
                      .dark .ck-editor .ck-content {
                        background-color: #161616 !important;
                        color: #ececec;
                      }

                      .dark .ck-editor .ck-content *{
                        color: #d3d3d3;
                      }

                      .dark .ck-editor .ck-editor__top * {
                        background-color: #161616 !important;
                        color: #c7c7c7;
                      }
                        
                      @media print {
                         .ck-editor .ck-content {
                        background-color: #161616 !important;
                        color: black !important;
                      }
                        .ck-editor .ck-content *{
                          color: black !important;
                        }
                      .ck-editor .ck-editor__top * {
                        background-color: #161616 !important;
                        color: black !important;
                      }
                      }
                      `
                    : ''
                }

                .ck-toolbar {
                  border: none !important;
                  transition: 200ms !important;
                  opacity: ${hidden ? 0 : 1};
                }

                .ck-toolbar__separator {
                  display: none !important;
                }

                .ck-editor__top {
                  // display: none;
                  position: sticky !important;
                  border: none !important;
                  z-index: 50;
                  // border-bottom: 1px solid lightgray !important;
                  top: 20px !important;
                }

                .ck-content {
                  border: none !important;
                  min-height: 50vh;
                  padding-bottom: 32px !important;
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

            <div className='mx-auto self-center mb-32 md-editor-preview w-full border-neutral-500 rounded-lg p-3 print:py-0 prose max-w-3xl text-black'>
              {hidden && (
                <style>
                  {`
                    .ck-sticky-panel__content {
                      opacity: 0 !important;
                    }
                    `}
                </style>
              )}
              <CKEditor
                onReady={editor => {
                  editor.focus()
                }}
                disabled={doc.locked}
                editor={ClassicEditor}
                data={doc?.content}
                config={{
                  extraPlugins: [MyCustomUploadAdapterPlugin],
                  ui: {
                    poweredBy: {
                      position: 'inside',
                      side: 'left',
                      label: ''
                    } as any
                  },

                  placeholder: 'Start writing...'
                }}
                onChange={(_, editor) => {
                  const textData = editor.getData()

                  setNavHidden(true)

                  setDoc(prevDoc => ({
                    ...prevDoc,
                    content: textData
                  }))
                }}
              />
            </div>
          </div>
        )}
        {doc.code && (
          <div
            id='texa-code-preview'
            className={cn(
              'md-editor-preview w-full md:w-1/2 border-neutral-500 rounded-lg p-3 print:py-0 prose text-black',
              doc.locked && 'w-full',
              doc.editorOnly
                ? 'hidden'
                : !doc.locked && 'h-[34rem] print:h-auto overflow-y-auto',
              'print:block print:mx-auto print:self-center md-editor-preview print:w-full print:border-neutral-500 rprint:ounded-lg print:p-3 print:py-0 print:prose print:max-w-3xl print:text-black'
            )}
          >
            <style>
              {`
                .dark #texa-code-preview * {
                  color: white;
                }
              `}
            </style>
            {renderedPreview}
          </div>
        )}
      </div>
    </main>
  )
}

// Upload adapter

function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = loader => {
    return new MyUploadAdapter(loader)
  }
}

class MyUploadAdapter {
  constructor(props) {
    ;(this as any).loader = props
  }

  async upload() {
    try {
      return {
        default: (this as any).loader._reader._data
      }
    } catch (err) {
      alert('An error ocurred')
    }
  }
}
