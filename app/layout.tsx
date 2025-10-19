import './globals.css'
import 'katex/dist/katex.min.css'
import { AtomicState } from 'atomic-state'
import { FetchConfig } from 'http-react'
import {
  Inter,
  IM_Fell_DW_Pica,
  Roboto,
  Raleway,
  Montserrat,
  Courier_Prime,
  Newsreader,
  Poppins,
  Geist,
  DM_Sans,
  Roboto_Mono,
  Literata,
  Alegreya
} from 'next/font/google'
import 'bs-icon/icons.css'

import type { Metadata } from 'next'

import Navbar from '@/components/Navbar'
import { ThemeProvider } from '@/components/ThemeProvider'
import AuthProvider from '@/components/AuthProvider'
import { Toaster } from '@/components/ui/toaster'
import Mouser from '@/components/mouser'
import 'highlight.js/styles/atom-one-dark.css'
import { getServerSession } from 'next-auth'
import { cookies } from 'next/headers'
import { css } from 'atomic-utils'

const InterFont = Inter({
  display: 'swap',
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '800', '900']
})

const IM_Fell_DW_PicaFont = IM_Fell_DW_Pica({
  weight: ['400'],
  subsets: ['latin']
})

const RobotoFont = Roboto({
  weight: ['300', '400', '600', '800', '900'],
  subsets: ['latin', 'latin-ext']
})

const RobotoMonoFont = Roboto_Mono({
  weight: ['300', '400', '600', '700'],
  subsets: ['latin', 'latin-ext']
})

const LiterataFont = Literata({
  weight: ['300', '400', '600', '800', '900'],
  subsets: ['latin', 'latin-ext']
})

const AlegreyaFont = Alegreya({
  weight: ['400', '600', '800', '900'],
  subsets: ['latin', 'latin-ext']
})

const RalewayFont = Raleway({
  weight: ['300', '400', '600', '800', '900'],
  subsets: ['latin', 'latin-ext']
})

const MontserratFont = Montserrat({
  weight: ['300', '400', '600', '800', '900'],
  subsets: ['latin', 'latin-ext']
})

const Courier_PrimeFont = Courier_Prime({
  weight: ['400', '700'],
  subsets: ['latin', 'latin-ext']
})

const NewsreaderFont = Newsreader({
  weight: ['300', '400', '600', '800'],
  subsets: ['latin', 'latin-ext']
})

const PoppinsFont = Poppins({
  weight: ['300', '400', '600', '800', '900'],
  subsets: ['latin', 'latin-ext']
})

const GeistFont = Geist({
  weight: ['300', '400', '600', '800', '900'],
  subsets: ['latin', 'latin-ext']
})

const DM_SansFont = DM_Sans({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin', 'latin-ext']
})

async function MainLayout({ children }) {
  const serverSession = await getServerSession()

  const theme = (await cookies()).get('theme')?.value || 'light'

  return (
    <html suppressHydrationWarning>
      <head>
        <meta
          name='description'
          content='Texa is an all-in-one rich content, Markdown and KaTeX editor'
        />
      </head>
      <body style={InterFont.style}>
        <style>
          {css`
            .inter-font {
              font-family: ${InterFont.style.fontFamily};
            }

            .literata-font {
              font-family: ${LiterataFont.style.fontFamily};
            }

            .alegreya-font {
              font-family: ${AlegreyaFont.style.fontFamily};
            }

            .roboto_mono-font {
              font-family: ${RobotoMonoFont.style.fontFamily};
            }

            .pica-font {
              font-family: ${IM_Fell_DW_PicaFont.style.fontFamily};
              font-size: 115%;
            }
            .roboto-font {
              font-family: ${RobotoFont.style.fontFamily};
            }
            .raleway-font {
              font-family: ${RalewayFont.style.fontFamily};
            }
            .montserrat-font {
              font-family: ${MontserratFont.style.fontFamily};
            }
            .courier-font {
              font-family: ${Courier_PrimeFont.style.fontFamily};
            }
            .newsreader-font {
              font-family: ${NewsreaderFont.style.fontFamily};
            }
            .poppins-font {
              font-family: ${PoppinsFont.style.fontFamily};
            }
            .geist-font {
              font-family: ${GeistFont.style.fontFamily};
            }
            .dmsans-font {
              font-family: ${DM_SansFont.style.fontFamily};
            }

            .katex-font {
              font-family: 'KaTeX_Main';
              font-size: 110%;
            }
          `}
        </style>
        <ThemeProvider attribute='class' defaultTheme='system'>
          <main className='min-h-screen'>
            <AuthProvider>
              <AtomicState
                value={{
                  theme: theme
                }}
              >
                <FetchConfig
                  baseUrl='/api'
                  value={{
                    'GET /auth/session': serverSession || {}
                  }}
                >
                  {/* <Mouser /> */}
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
