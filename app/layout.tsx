import './globals.css'
import { AtomicState } from 'atomic-state'
import { FetchConfig } from 'http-react'
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'

import Navbar from '@/components/Navbar'
import { ThemeProvider } from '@/components/ThemeProvider'
import AuthProvider from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Texa is the online Markdown and LaTeX editor'
}

function MainLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <meta
          name='description'
          content='Texa is the online Markdown and LaTeX editor'
        />
      </head>
      <body className={GeistSans.className}>
        <ThemeProvider attribute='class' defaultTheme='system'>
          <main className='min-h-screen'>
            <AuthProvider>
              <AtomicState>
                <FetchConfig baseUrl='/api'>
                  <Navbar />
                  <div className='max-w-7xl mx-auto p-2'>{children}</div>
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
