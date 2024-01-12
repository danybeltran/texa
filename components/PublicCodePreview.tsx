'use client'

import { cn } from '@/lib/utils'
import { Editor } from '@monaco-editor/react'
import { useTheme } from 'next-themes'

export default function PublicCodePreview({ content }: { content: string }) {
  const { theme } = useTheme()

  return (
    <Editor
      loading
      options={{
        readOnly: true,
        mouseWheelZoom: true
      }}
      value={content}
      onMount={e => {
        e.focus()
      }}
      height='34rem'
      theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
      width={'100%'}
      defaultLanguage='markdown'
      className={cn(
        'first:peer-first:p-4 w-1/2 resize-none border rounded-lg focus:border-transparent focus:ring-2 focus:outline-none overflow-hidden bg-transparent min-h-72',
        'w-full',
        'print:hidden'
      )}
    />
  )
}
