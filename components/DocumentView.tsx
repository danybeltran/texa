'use client'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import Editor from '@monaco-editor/react'
import { Doc } from '@prisma/client'
import copy from 'copy-to-clipboard'
import useFetch, { useDebounceFetch } from 'http-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState, useRef, useLayoutEffect } from 'react'
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
import { fontNames, fonts, renderMD } from '@/lib/md'
import { cn } from '@/lib/utils'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from './ui/dialog'
import { Label } from './ui/label'

import { useToast } from './ui/use-toast'
import { setNavHidden, useNavHidden, useTheme } from '@/states'
import oneDarkTheme from '@/lib/editor-themes/atom-one-dark.json'
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  EyeOff,
  Info,
  Lock,
  Printer,
  Unlock
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from './ui/select'

function calcHeight(value: string) {
  let numberOfLineBreaks = (value.match(/\n/g) || []).length
  let newHeight = 20 + numberOfLineBreaks * 20 + 12 + 2
  return newHeight
}

let previousMutateSave: NodeJS.Timeout

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

  const documentFont = doc.font || 'inter'

  const [loaded, setLoaded] = useState(false)
  const [showMetadata, setShowMetadata] = useState(false)
  const { toast } = useToast()
  const theme = useTheme()

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
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
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

  const initialContent = useRef(doc?.content).current

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

  const fontSelectRef = useRef<HTMLSelectElement>(null)

  useLayoutEffect(() => {
    const toolbar = document.querySelector('.ck-toolbar__items')

    if (toolbar) {
      // toolbar.appendChild(fontSelectRef.current!)
    }
  }, [theme, fontSelectRef, loadingDoc, doc.locked])

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
            opacity: ${navHidden ? 0.3 : 1};
            transition: 200ms;
            z-index: 50;
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
          // Aesthetics: Fixed, floating bar with background, blur, and shadow
          'flex items-center justify-between print:hidden transition max-w-[86rem] fixed z-30 left-0 right-0 mx-auto p-2 sm:px-4 mt-4',
          'bg-background/90 backdrop-blur-sm',
          // Adjusted top-positioning to sit directly below the main navbar (assuming ~52px tall navbar)
          'top-[52px]',
          // Apply opacity when the main navbar is hidden
          hidden && 'opacity-50'
        )}
      >
        {/* --- Left Group: Navigation and Status --- */}
        <div className='flex items-center gap-x-2'>
          {/* Back Button (Lucide ArrowLeft) */}
          <Link
            href={
              '/personal/' + (doc?.parentFolderId ? doc.parentFolderId : '')
            }
            title='Go to folder'
          >
            <Button variant='ghost' size='icon' className='hover:bg-primary/10'>
              <ArrowLeft className='w-5 h-5' />
            </Button>
          </Link>

          {/* Saving Status */}
          {savingDoc && (
            <div className='pl-2 flex items-center text-sm font-medium text-muted-foreground'>
              <AiOutlineLoading3Quarters className='animate-spin w-4 h-4 mr-1 text-primary' />
              Saving...
            </div>
          )}
        </div>

        <div className='flex items-center gap-x-1'>
          {/* Public View Link (Lucide ExternalLink) */}
          <Link
            href={'/public-view/' + doc.publicId}
            target='_blank'
            title='Open Public View'
          >
            <Button variant='ghost' size='icon'>
              <ExternalLink className='w-4 h-4' />
            </Button>
          </Link>

          {/* Font Selector (Styled for toolbar integration) */}
          <span ref={fontSelectRef} className='pr-1'>
            <Select
              value={documentFont}
              onValueChange={value => {
                setDoc(prev => ({
                  ...prev,
                  font: value
                }))
              }}
            >
              <SelectTrigger className='w-24 border-none bg-transparent hover:bg-transparent'>
                <SelectValue placeholder='Font' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Select Font</SelectLabel>
                  {Object.keys(fonts).map(font => {
                    const fontName = fontNames[font]
                    return (
                      <SelectItem
                        value={font}
                        key={'custom-font' + font}
                        className={`${font}-font`}
                      >
                        {fontName}
                      </SelectItem>
                    )
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </span>

          {/* Lock/Unlock Button (Lucide Lock/Unlock with Color Cue) */}
          <Button
            size='icon'
            variant='ghost'
            title={doc.locked ? 'Unlock for editing' : 'Lock document'}
            onClick={() =>
              setDoc(prevDoc => ({ ...prevDoc, locked: !prevDoc.locked }))
            }
          >
            {doc.locked ? (
              <Lock className='w-5 h-5' />
            ) : (
              <Unlock className='w-5 h-5 text-green-500' />
            )}
          </Button>

          {/* Editor/Preview Toggle (Code Docs Only, Lucide Eye/EyeOff) */}
          {doc.code && (
            <Button
              size='icon'
              variant='ghost'
              title={doc.editorOnly ? 'Show preview' : 'Hide preview'}
              onClick={() =>
                setDoc(prev => ({ ...prev, editorOnly: !prev.editorOnly }))
              }
            >
              {doc.editorOnly ? (
                <Eye className='w-5 h-5' />
              ) : (
                <EyeOff className='w-5 h-5' />
              )}
            </Button>
          )}

          {/* Print Button (Lucide Printer) */}
          <Button
            size='icon'
            variant='ghost'
            title='Print Document'
            onClick={() => print()}
          >
            <Printer className='w-5 h-5' />
          </Button>

          {/* Metadata/Info Button (Lucide Info) */}
          <Button
            onClick={() => setShowMetadata(m => !m)}
            size='icon'
            variant='ghost'
            title='Document Details'
          >
            <Info className='w-5 h-5' />
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
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter')
                    setShowMetadata(false)
                }}
                className='max-h-64 resize-none'
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

      <div className='flex flex-col md:flex-row w-full gap-x-4 py-8 print:py-0 justify-center pt-16'>
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
                // setNavHidden(true)
                if (!doc.locked) {
                  setDoc(prevDoc => ({ ...prevDoc, content: v! }))
                }
              }}
              onMount={(editor, monaco) => {
                monacoInstanceRef.current = monaco
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
            <div
              className={cn(
                'mx-auto self-center mb-32 md-editor-preview w-full border-neutral-500 rounded-lg p-3 print:py-0 prose max-w-3xl text-black',
                `${doc.font || 'inter'}-font`
              )}
            >
              <CKEditor
                onReady={editor => editor.focus()}
                // @ts-expect-error disabled does work
                disabled={doc.locked!}
                editor={ClassicEditor}
                data={initialContent}
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
                  // setNavHidden(true)
                  const currentData = editor.getData()
                  setDoc(prev => ({ ...prev, content: currentData }))
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
              'print:block print:mx-auto print:self-center md-editor-preview print:w-full print:border-neutral-500 print:rounded-lg print:p-3 print:py-0 print:prose print:max-w-3xl print:text-black',
              `${doc.font || 'inter'}-font`
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
