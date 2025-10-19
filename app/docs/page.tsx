import Link from 'next/link'
import { Code, Link as LinkIcon, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils' // Assuming cn is available

// Updated TagSection definition to make linkHref and linkText optional (?)
const TagSection = ({
  tag,
  description,
  code,
  linkHref,
  linkText
}: {
  tag: string
  description: string
  code: string
  linkHref?: string // Made optional
  linkText?: string // Made optional
}) => (
  <div className='border-b border-border/70 pb-8 last:border-b-0'>
    <h4 className='text-xl font-semibold flex items-center gap-x-2 mb-2'>
      <Code className='w-5 h-5 text-primary' />
      <span className='text-primary font-mono'>{tag}</span>
    </h4>

    <p className='text-muted-foreground mb-4'>{description}</p>

    <pre
      className={cn(
        'p-4 bg-muted text-foreground/80 rounded-lg overflow-x-auto text-sm',
        'shadow-inner border border-border/70'
      )}
    >
      <code>{code.trim()}</code>
    </pre>

    {/* The link rendering logic is safe because linkHref is checked */}
    {linkHref && (
      <p className='pt-3 text-sm'>
        <Link
          className='flex items-center gap-x-1 text-primary hover:underline'
          href={linkHref}
          target='_blank'
        >
          <ExternalLink className='w-4 h-4' /> {linkText}
        </Link>
      </p>
    )}
  </div>
)

export default function FeaturesPage() {
  return (
    <main className='w-full md:w-3/4 lg:w-1/2 mx-auto px-4 md:px-0 py-12'>
      <h2 className='text-4xl font-extrabold mb-2'>Code Document Tags</h2>
      <p className='text-lg text-muted-foreground'>
        This guide covers <b>Code-only documents</b> and assumes a basic
        understanding of Markdown and/or LaTeX.
      </p>

      <div className='pt-8'>
        <h3 className='text-2xl font-semibold mb-6 border-b border-border pb-2'>
          Custom Structural & Formatting Tags
        </h3>

        <section className='space-y-8'>
          <TagSection
            tag='<tex>'
            description="The content wrapped with this tag will be rendered using the Computer Modern Font, which is KaTeX's default font. This is useful for large blocks of text that need to match formula typography."
            code={`
# My Document
 
<tex>
This content uses the Computer Modern font.
</tex>
 
Normal font paragraph.
`}
            // linkHref and linkText are omitted here, now that they are optional.
          />

          <TagSection
            tag='<math>'
            description='The content wrapped with this tag will render as Math/LaTeX, equivalent to using the standard $$ delimiters.'
            code={`
# My Formula

My formula:
<math>
C^2 = A^2 + B^2
</math>

Or:

$$
E = mc^2
$$
`}
          />

          <TagSection
            tag='<justify>, <left>, <center>, <right>'
            description='These tags help control the horizontal alignment of the wrapped content, applying styling not always available in standard Markdown.'
            code={`
<justify>
This content is justified across the full width.
</justify>

<center>
This content is centered.
</center>

<right>
This content is aligned to the right.
</right>
`}
          />

          <TagSection
            tag='<mermaid>'
            description='This tag is used to insert a Mermaid chart or diagram, allowing you to generate visuals directly from text definitions.'
            code={`
# My Flowchart

<mermaid>
graph TD;
  A[Start] --> B(Process);
  B --> C{Decision};
  C --> D[End];
</mermaid>
`}
            linkHref='https://mermaid.js.org/intro/'
            linkText='Learn Mermaid Syntax'
          />

          <TagSection
            tag='<newpage/>'
            description='Inserts a page break. This will only be reflected when the document is printed (Ctrl+P or Command+P).'
            code={`
# Page 1

This is the content for the first page.

<newpage/>

# Page 2

This is the content for the second page.
`}
          />
        </section>
      </div>
    </main>
  )
}
