import Link from 'next/link'
import { TfiGithub, TfiWrite } from 'react-icons/tfi'
// Import Lucide icons for consistency
import {
  Pencil, // Replaces TfiWrite
  Folder, // Replaces FaFolder
  Share2, // Replaces FaShareAlt
  DollarSign, // Replaces MdMoneyOffCsred (or similar)
  Code, // For Markdown/Code features
  Feather, // For Rich Content (CiEdit)
  Coffee, // Replaces FaCoffee
  ArrowRight // For button next to text
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils' // Assuming cn is available

export async function generateMetadata() {
  return {
    title: 'Home',
    description: 'Texa is an all-in-one rich content, Markdown and KaTeX editor'
  }
}

// Helper component for the feature cards
const FeatureCard = ({ icon: Icon, title, description }) => (
  <div
    className={cn(
      'relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-md p-6 h-full',
      'transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg'
    )}
  >
    <div className='flex flex-col justify-start gap-y-4 items-center sm:items-start'>
      {/* Icon with Accent Background */}
      <div className='p-3 rounded-lg bg-primary/10 text-primary'>
        <Icon className='w-8 h-8' />
      </div>

      <div className='space-y-2 text-center sm:text-left w-full'>
        <h3 className='text-lg font-bold leading-tight'>{title}</h3>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>
    </div>
  </div>
)

export default function Home() {
  return (
    <main>
      {/* --- Hero Section --- */}
      <section className='space-y-8 pb-12 pt-16 md:pt-24 lg:pt-32'>
        <div className='container flex max-w-[64rem] flex-col items-center gap-6 text-center mx-auto'>
          <h1 className='font-extrabold leading-tight text-4xl sm:text-6xl md:text-7xl lg:text-[5rem]'>
            An all-in-one editor for modern writing.
          </h1>
          <p className='max-w-[48rem] leading-relaxed text-lg text-muted-foreground'>
            Texa is a powerful platform combining rich content, Markdown, and
            LaTeX into one seamless editor. Organize, collaborate, and publish
            your documents instantly.
          </p>

          <div className='flex flex-wrap justify-center gap-4 pt-4'>
            <Link href='/personal' rel='noreferrer'>
              <Button size='lg' className='gap-x-2 font-semibold'>
                <Pencil className='w-5 h-5' />
                Start Writing
              </Button>
            </Link>
            <Link
              href='https://github.com/danybeltran/texa'
              target='_blank'
              rel='noreferrer'
            >
              <Button
                size='lg'
                variant='outline'
                className='gap-x-2 font-semibold'
              >
                <TfiGithub className='w-5 h-5' />
                View on GitHub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section
        id='features'
        className='container space-y-12 py-12 md:py-20 lg:py-28 mx-auto'
      >
        <div className='mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center'>
          <span className='text-sm font-semibold text-primary uppercase tracking-wider'>
            Why Choose Texa?
          </span>
          <h2 className='font-bold text-3xl leading-[1.1] sm:text-4xl md:text-5xl'>
            Powerful Features for Any Writer
          </h2>
        </div>

        {/* Feature Grid - Using the FeatureCard component */}
        <div className='mx-auto grid justify-center gap-6 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3'>
          <FeatureCard
            icon={DollarSign}
            title='Free. Forever. Zero Cost.'
            description='Just write, create, and organize without worrying about subscriptions or hidden fees.'
          />

          <FeatureCard
            icon={Share2}
            title='Instant Sharing & Public Links'
            description='Generate a public link for any document or folder to share your work instantly.'
          />

          <FeatureCard
            icon={Folder}
            title='Structured Organization'
            description='Create, move, and edit folders and documents in a clean, intuitive file manager.'
          />

          <FeatureCard
            icon={Feather}
            title='Rich Content WYSIWYG Editor'
            description='Powered by CKEditor, providing the best modern, rich content editing experience.'
          />

          <FeatureCard
            icon={Code}
            title='Markdown & Code Integration'
            description='Full Markdown support, with custom syntax and code highlighting for technical writing.'
          />

          <FeatureCard
            icon={Coffee}
            title='Advanced Tools'
            description='Seamlessly render KaTeX (Math), Mermaid diagrams, and more in your code-enabled documents.'
          />
        </div>

        {/* Call to Action at the Bottom */}
        <div className='mx-auto text-center pt-8'>
          <Link href='/personal'>
            <Button size='lg' variant='default' className='gap-x-2'>
              Start Creating Now
              <ArrowRight className='w-4 h-4' />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
