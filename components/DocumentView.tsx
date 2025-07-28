'use client'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import MonacoHtmlPlugin from 'monaco-html'
import Editor from '@monaco-editor/react'
import { Doc } from '@prisma/client'
import copy from 'copy-to-clipboard'
import useFetch, { useDebounceFetch } from 'http-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState, useRef } from 'react'
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
import oneDarkTheme from '@/lib/editor-themes/atom-one-dark.json'

function calcHeight(value: string) {
  let numberOfLineBreaks = (value.match(/\n/g) || []).length
  let newHeight = 20 + numberOfLineBreaks * 20 + 12 + 2
  return newHeight
}

export default function DocumentView() {
  const params: { id: string } = useParams()
  const hidden = useNavHidden()
  const {
    data: doc,
    loading: loadingDoc,
    mutate: setDoc,
    refresh
  } = useFetch<Doc>('/documents', {
    id: `doc-${params.id}`,
    query: {
      id: params.id
    }
  })

  const { reFetch: saveDoc, loading: savingDoc } = useDebounceFetch(
    '/documents',
    {
      method: 'PUT',
      auto: !loadingDoc && Boolean(doc),
      debounce: '600 ms',
      body: doc
    }
  )

  const [loaded, setLoaded] = useState(false)
  const [showMetadata, setShowMetadata] = useState(false)
  const { toast } = useToast()
  const { theme } = useTheme()

  const editorRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const monacoInstanceRef = useRef<any>(null)

  const navHidden = useNavHidden()

  const renderedPreview = useMemo(
    () => (
      <div
        className='max-w-full overflow-x-auto'
        dangerouslySetInnerHTML={{
          __html: doc?.content
            ? renderMD(doc?.content)
            : '<p class="text-neutral-500 select-none print:hidden">Preview will appear here</p>'
        }}
      />
    ),
    [doc?.content]
  )

  useEffect(() => {
    const saveDocumentListener = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault()
        if (!doc?.locked) saveDoc()
      }
    }
    document.addEventListener('keydown', saveDocumentListener)
    return () => {
      document.removeEventListener('keydown', saveDocumentListener)
    }
  }, [doc?.locked])

  useEffect(() => {
    if (!loaded && doc) {
      if (!doc.code) {
        setShowMetadata(false)
        setLoaded(true)
      }
    }
  }, [loaded, doc?.content, doc?.code])

  useEffect(() => {
    if (doc?.content) {
      const codeBlocks = document.querySelectorAll('pre')
      codeBlocks.forEach(pre => {
        if (!pre.querySelector('.copy-button')) {
          const button = document.createElement('button')
          button.innerText = 'Copy'
          button.className =
            'copy-button absolute top-2 right-2 p-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity'

          const wrapper = document.createElement('div')
          wrapper.style.position = 'relative'
          wrapper.className = 'group'
          pre.parentNode?.insertBefore(wrapper, pre)
          wrapper.appendChild(pre)
          wrapper.appendChild(button)

          button.onclick = () => {
            const code = pre.querySelector('code')?.innerText || pre.innerText
            copy(code)
            toast({
              title: 'Copied!',
              description: 'Code snippet copied to clipboard.'
            })
            button.innerText = 'Copied!'
            setTimeout(() => {
              button.innerText = 'Copy'
            }, 2000)
          }
        }
      })
    }
  }, [doc?.content, toast])

  // Scroll sync logic
  useEffect(() => {
    if (!doc?.code && editorRef.current && previewRef.current) {
      const ckContent = editorRef.current.querySelector('.ck-content')
      if (ckContent) {
        const onScroll = () => {
          const ratio =
            ckContent.scrollTop /
            (ckContent.scrollHeight - ckContent.clientHeight)
          previewRef.current!.scrollTop =
            ratio *
            (previewRef.current?.scrollHeight! -
              previewRef.current?.clientHeight!)
        }
        ckContent.addEventListener('scroll', onScroll)
        return () => ckContent.removeEventListener('scroll', onScroll)
      }
    }
  }, [doc?.code])

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
      <style>
        {`
          ${
            theme === 'dark'
              ? `
                        .ck-editor .ck-content {
                        background-color: #161616 !important;
                        color: white !important;
                      }

                      .ck-editor .ck-content *{
                        color: white !important;
                      }

                      .ck-editor .ck-editor__top * {
                        background-color: #161616  !important;
                        color: white !important;
                      }
                        

                      @media print {
                        .ck-editor .ck-content {
                          background-color: #ffffff !important; /* Set to white for print for better readability */
                          border: 0px solid transparent !important;
                          box-shadow: none !important; /* Remove inner shadow */
                          color: black !important;
                          padding: 0 !important; /* Remove padding if it's creating extra space */
                      }
                        .ck-editor .ck-content *{
                          color: black !important;
                        }
                      .ck-editor .ck-editor__top,
                      .ck.ck-powered-by { /* Target the CKEditor toolbar and the powered by logo */
                        display: none !important;
                      }
                      /* Ensure no extra margins/padding from CKEditor specific elements */
                      .ck-editor__main, .ck-editor__editable, .ck-editor__editable_inline {
                        margin: 0 !important;
                        padding: 0 !important;
                      }
          }
                        `
              : `
              /* Styles for light theme when printing */
              @media print {
                .ck-editor .ck-content {
                  background-color: #ffffff !important;
                  border: 0px solid transparent !important;
                  box-shadow: none !important; /* Remove inner shadow */
                  color: black !important;
                  padding: 0 !important;
                }
                .ck-editor .ck-content * {
                  color: black !important;
                }
                .ck-editor .ck-editor__top,
                .ck.ck-powered-by { /* Target the CKEditor toolbar and the powered by logo */
                  display: none !important;
                }
                .ck-editor__main, .ck-editor__editable, .ck-editor__editable_inline {
                  margin: 0 !important;
                  padding: 0 !important;
                }
              }
              `
          }

          .ck-editor__top {
            opacity: ${navHidden ? 0 : 1};
            transition: 200ms;
            z-index: 50;
            border-bottom: 1px solid lightgray !important;
            top: 40px;
          }

          .ck-editor__top {
            display: ${doc.locked ? 'none' : 'auto'} !important;
          }

          @media print {
            .ck-editor__top {
              display: hidden !important;
            }
          }

          /* General styling for the CKEditor content area */
          .ck-content {
            border: none !important;
            box-shadow: none !important;
            outline: none !important; /* Add this to remove outlines */
          }

          /* Target the main editor container when it or its descendants are focused */
          .ck.ck-editor__main > .ck-editor__editable:focus-within,
          .ck.ck-editor__main > .ck-editor__editable.ck-focused,
          .ck.ck-editor__editable_inline:focus-within,
          .ck.ck-editor__editable_inline.ck-focused {
            box-shadow: none !important;
            outline: none !important;
          }

          /* Also ensure no shadow/outline on the overall editor container itself */
          .ck.ck-editor__main {
            border: none !important;
            box-shadow: none !important;
            outline: none !important;
          }

          /* Remove border/shadow from the outer container if present */
          .ck.ck-editor {
            border: none !important;
            box-shadow: none !important;
            outline: none !important;
          }
        `}
      </style>

      <div
        className={cn(
          'flex items-center justify-between print:hidden transition max-w-[86rem] fixed z-30 top-14 left-0 right-0 mx-auto p-3 sm:px-4 bg-background',
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
              <FaExternalLinkAlt />
            </Button>
          </Link>
          <Button
            className='gap-x-2'
            variant='secondary'
            onClick={() =>
              setDoc(prevDoc => ({ ...prevDoc, locked: !prevDoc.locked }))
            }
          >
            {doc.locked ? <FaLock /> : <FaLockOpen />}
          </Button>
          {doc.code && (
            <Button
              className='gap-x-2'
              variant='secondary'
              onClick={() =>
                setDoc(prev => ({ ...prev, editorOnly: !prev.editorOnly }))
              }
            >
              {doc.editorOnly ? <FaRegEyeSlash /> : <FaRegEye />}
            </Button>
          )}
          <Button
            className='gap-x-2'
            variant='secondary'
            onClick={() => print()}
          >
            <MdPrint className='text-lg' />
          </Button>
          <Button
            onClick={() => setShowMetadata(m => !m)}
            className='gap-x-2'
            variant='secondary'
          >
            <CiCircleInfo className='text-lg' />
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
                onKeyDown={e => e.key === 'Enter' && setShowMetadata(false)}
                onChange={e =>
                  setDoc(prev => ({ ...prev, name: e.target.value }))
                }
              />
            </Label>
            <br />
            <Label>
              <p className='py-2'>Description</p>
              <Textarea
                value={doc.description || ''}
                placeholder='Document description'
                onFocus={e =>
                  (e.currentTarget.style.height =
                    calcHeight(e.target.value) + 3 + 'px')
                }
                onKeyUp={e => {
                  if (e.ctrlKey && e.key === 'Enter') setShowMetadata(false)
                }}
                onChange={e => {
                  e.currentTarget.style.height =
                    calcHeight(e.target.value) + 3 + 'px'
                  setDoc(prev => ({ ...prev, description: e.target.value }))
                }}
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

      <div className='flex flex-col md:flex-row w-full gap-x-4 py-8 print:py-0 justify-center pt-12'>
        {doc.code ? (
          <div
            ref={editorRef}
            className={cn(
              'print:hidden w-full overflow-y-auto h-[75vh]',
              doc.editorOnly
                ? 'w-full'
                : doc.locked
                ? 'hidden'
                : 'w-full md:w-1/2'
            )}
          >
            <Editor
              loading
              options={{
                readOnly: doc.locked,
                mouseWheelZoom: true,
                autoClosingBrackets: 'always',
                wordWrap: 'bounded',
                autoClosingQuotes: 'always',
                autoIndent: 'full',
                tabSize: 2
              }}
              value={doc.content!}
              onChange={v => {
                setNavHidden(true)
                if (!doc.locked) {
                  setDoc(prevDoc => ({ ...prevDoc, content: v! }))
                }
              }}
              onMount={editor => {
                monacoInstanceRef.current = editor
                editor.onDidScrollChange(() => {
                  const scrollTop = editor.getScrollTop()
                  const scrollHeight = editor.getScrollHeight()
                  const clientHeight = editor.getLayoutInfo().height
                  const ratio = scrollTop / (scrollHeight - clientHeight)

                  if (previewRef.current) {
                    previewRef.current.scrollTop =
                      ratio *
                      (previewRef.current.scrollHeight -
                        previewRef.current.clientHeight)
                  }
                })
                editor.focus()
              }}
              theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
              width='100%'
              defaultLanguage='markdown'
              className={cn(
                'first:peer-first:p-4 border rounded-lg focus:border-transparent focus:ring-2 focus:outline-none overflow-hidden bg-transparent',
                doc.locked && !doc.editorOnly && 'hidden',
                doc.editorOnly && 'w-full min-h-[75vh]',
                'print:hidden'
              )}
            />
          </div>
        ) : (
          <div
            ref={editorRef}
            className='w-full relative prose max-w-3xl ck-content print:mb-0 overflow-y-auto'
          >
            {/* Theme styles here... */}
            <div className='mx-auto self-center mb-32 md-editor-preview w-full border-neutral-500 rounded-lg p-3 print:py-0 prose max-w-3xl text-black'>
              <CKEditor
                onReady={editor => editor.focus()}
                // @ts-expect-error disabled does work
                disabled={doc.locked!}
                editor={ClassicEditor}
                data={doc?.content}
                config={{
                  extraPlugins: [MyCustomUploadAdapterPlugin],
                  ui: {
                    poweredBy: {
                      position: 'inside',
                      side: 'left',
                      label: '',
                      verticalOffset: -32,
                      horizontalOffset: 0
                    }
                  },
                  placeholder: 'Start writing...'
                }}
                onChange={(_, editor) => {
                  const textData = editor.getData()
                  setNavHidden(true)
                  setDoc(prev => ({ ...prev, content: textData }))
                }}
              />
            </div>
          </div>
        )}
        {doc.code && (
          <div
            ref={previewRef}
            className={cn(
              'md-editor-preview mx-auto self-center md-editor-preview w-full md:w-1/2 border-neutral-500 rounded-lg p-3 print:py-0 prose max-w-3xl text-black',
              doc.locked && 'w-full md:w-full',
              doc.editorOnly
                ? 'hidden'
                : !doc.locked && 'h-[75vh] print:h-auto overflow-y-auto',
              doc.locked && !doc.editorOnly && 'mb-32',
              'print:block print:mx-auto print:self-center md-editor-preview print:w-full print:border-neutral-500 print:rounded-lg print:p-3 print:py-0 print:prose print:max-w-3xl print:text-black'
            )}
          >
            {renderedPreview}
          </div>
        )}
      </div>
    </main>
  )
}

function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = loader => {
    return new MyUploadAdapter(loader)
  }
}

class MyUploadAdapter {
  constructor(props) {
    //@ts-expect-error
    this.loader = props
  }

  async upload() {
    try {
      return {
        //@ts-expect-error
        default: this.loader._reader._data
      }
    } catch (err) {
      alert('An error occurred')
    }
  }
}
