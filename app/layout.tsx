import './globals.css'
import 'katex/dist/katex.min.css'
import { AtomicState } from 'atomic-state'
import { FetchConfig } from 'http-react'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'

import Navbar from '@/components/Navbar'
import { ThemeProvider } from '@/components/ThemeProvider'
import AuthProvider from '@/components/AuthProvider'
import { Toaster } from '@/components/ui/toaster'
import Mouser from '@/components/mouser'

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
      <body style={montserratFont.style}>
        <ThemeProvider attribute='class' defaultTheme='system'>
          <main className='min-h-screen'>
            <AuthProvider>
              <AtomicState>
                <FetchConfig baseUrl='/api'>
                  <Mouser />
                  <Navbar />
                  <div className='max-w-[86rem] mx-auto p-3 sm:px-4 '>
                    {children}
                    <Toaster />
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
