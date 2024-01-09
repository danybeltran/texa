import './globals.css'
import { AtomicState } from 'atomic-state'
import { FetchConfig } from 'http-react'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'

import Navbar from '@/components/Navbar'
import { ThemeProvider } from '@/components/ThemeProvider'
import AuthProvider from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Texa is an all-in-one rich content, Markdown and KaTeX editor'
}

const montserratFont = Inter({
  display: 'swap',
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '800', '900']
})

function MainLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <meta
          name='description'
          content='Texa is an all-in-one rich content, Markdown and KaTeX editor'
        />
      </head>
      <body className={montserratFont.className}>
        <ThemeProvider attribute='class' defaultTheme='system'>
          <main className='min-h-screen'>
            <AuthProvider>
              <AtomicState>
                <FetchConfig baseUrl='/api'>
                  <Navbar />
                  <div className='max-w-[86rem] mx-auto p-3 sm:px-4 '>
                    {children}
                  </div>
                </FetchConfig>
              </AtomicState>
            </AuthProvider>
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}

export default MainLayout
