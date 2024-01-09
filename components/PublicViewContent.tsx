'use client'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { useTheme } from 'next-themes'

export default function PublicViewContent({ content }: { content: string }) {
  const { theme } = useTheme()

  return (
    <>
      <style>
        {`
          ${
            theme === 'dark'
              ? `
                        .ck-editor .ck-content {
                        background-color: #161616 !important;
                        color: #cfcfcf !important;
                      }

                      .ck-editor .ck-content *{
                        color: #cfcfcf !important;
                      }

                      .ck-editor .ck-editor__top * {
                        background-color: #161616  !important;
                        color: #cfcfcf !important;
                      }  
                        `
              : ''
          }

          .ck-editor__top {
            display: none;
            z-index: 50;
            border-bottom: 1px solid lightgray !important;
            top: 40px;
          }
          .ck-content {
            border: none !important;
          }

          .ck-content:focus {
            box-shadow: none !important;
          }
        `}
      </style>
      <CKEditor disabled editor={ClassicEditor} data={content} />
    </>
  )
}
