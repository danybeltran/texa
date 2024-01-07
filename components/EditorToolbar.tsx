import { Button } from './ui/button'
import {
  FaBold,
  FaItalic,
  FaListOl,
  FaListUl,
  FaStrikethrough,
  FaUnderline,
  FaYoutube
} from 'react-icons/fa6'
import { IoMdUndo, IoMdRedo } from 'react-icons/io'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from './ui/dialog'
import { Input } from './ui/input'
import { hasBaseUrl } from 'http-react'

export default function EditorToolbar({ onCommand }: { onCommand: any }) {
  const execCommand = (commandId: any, showUI?: boolean, value?: string) => {
    document.execCommand(commandId, showUI, value)
    setTimeout(() => {
      onCommand()
    }, 100)
  }

  const [insertingYoutube, setInsertingYoutube] = useState(false)

  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState('')

  const isValidYoutube = hasBaseUrl(youtubeVideoUrl)

  return (
    <div
      id='content-editor-toolbar'
      className='flex sticky top-[3.7rem] bg-white dark:bg-neutral-950 max-w-full overflow-x-auto border-x gap-x-2 p-2'
    >
      <div className='text-center'>
        <div className='flex  gap-x-2'>
          <Button
            variant='secondary'
            onClick={() => {
              execCommand('undo')
            }}
          >
            <IoMdUndo />
          </Button>
          <Button
            variant='secondary'
            onClick={() => {
              execCommand('undo')
            }}
          >
            <IoMdRedo />
          </Button>

          {new Array(4).fill(null).map((h, i) => (
            <Button
              key={'toolbarheading' + (i + 1)}
              onClick={() => {
                execCommand('formatBlock', undefined, `<h${i + 1}>`)
              }}
              style={{
                fontSize: `calc(100% - ${i * 2}px)`
              }}
              variant='secondary'
            >
              H{i + 1}
            </Button>
          ))}
        </div>
      </div>

      <div className='text-center border-r-0'>
        <div className='flex gap-x-2'>
          {[
            {
              title: 'Bold',
              command: 'bold',
              icon: FaBold
            },
            {
              title: 'Italic',
              command: 'italic',
              icon: FaItalic
            },
            {
              title: 'Underline',
              command: 'underline',
              icon: FaUnderline
            },
            {
              title: 'Strike through',
              command: 'strikeThrough',
              icon: FaStrikethrough
            }
          ].map((cm, i, c) => (
            <Button
              key={cm.title + cm.command}
              onClick={() => {
                execCommand(cm.command)
              }}
              variant='secondary'
            >
              {<cm.icon />}
            </Button>
          ))}
        </div>
      </div>
      <div className='text-center'>
        <div className='flex gap-x-2'>
          <Button
            variant='secondary'
            onClick={() => {
              execCommand('insertUnorderedList')
            }}
          >
            <FaListUl />
          </Button>
          <Button
            variant='secondary'
            onClick={() => {
              execCommand('insertOrderedList')
            }}
          >
            <FaListOl />
          </Button>

          <Button
            variant='secondary'
            title='Insert YouTube video'
            onClick={() => {
              // execCommand('insertOrderedList')
              setInsertingYoutube(true)
            }}
          >
            <FaYoutube />
          </Button>
          <Dialog open={insertingYoutube} onOpenChange={setInsertingYoutube}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Insert YouTube video</DialogTitle>
                <DialogDescription>
                  Copy the video's URL and paste it here
                </DialogDescription>
              </DialogHeader>
              <div className='py-4'>
                <Input
                  value={youtubeVideoUrl}
                  onChange={e => {
                    setYoutubeVideoUrl(e.target.value)
                  }}
                  placeholder='https://www.youtube.com/watch?v='
                />
              </div>
              <div className='flex w-full gap-x-2 justify-end'>
                <Button
                  variant='ghost'
                  onClick={() => {
                    setYoutubeVideoUrl('')
                    setInsertingYoutube(false)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  disabled={!isValidYoutube}
                  onClick={() => {
                    const editor = document.getElementById('content-editor')
                    if (editor) {
                      editor.innerHTML =
                        editor?.innerHTML +
                        `
                        
                      <iframe
                      width='914'
                      height='514'
                      style="aspect-ratio: 16/9"
                      src="https://www.youtube.com/embed/${new URL(
                        youtubeVideoUrl
                      ).searchParams.get('v')}"
                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                        allowfullscreen
                        ></iframe>
                        <br/>
                        `

                      setInsertingYoutube(false)
                      setYoutubeVideoUrl('')

                      setTimeout(() => {
                        editor.focus()
                      }, 100)
                    }
                  }}
                >
                  Insert
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
