import Link from 'next/link'

export default function FeaturesPage() {
  return (
    <main className='w-full md:w-1/2 mx-auto'>
      <h2 className='text-2xl font-semibold'>Docs</h2>

      <div>
        <div className='py-4'>
          <p>
            This docs cover Code-only documents and assumes you have a basic
            understanding of Markdown and/or LaTex
          </p>
        </div>

        <h3 className='text-lg font-semibold'>Custom tags</h3>
        <p>
          Additional to what's available in Markdown, there are several custom
          tags that you can use:
        </p>

        <br />
        <section className='space-y-8 pb-32'>
          <div>
            <h4 className='font-semibold text-blue-500'>
              <pre>{`<tex>`}</pre>
            </h4>
            <p>
              The content wrapped with this tag will use the Computer Modern
              Font, which is KaTeX's default font:
            </p>
            <pre className='px-4 pb-4 bg-neutral-800 text-neutral-100 rounded-lg my-2'>
              <code>
                {`
# My document


<tex>
This content used the Computer Modern font

</tex>

Normal font
`}
              </code>
            </pre>
          </div>
          <div>
            <h4 className='font-semibold text-blue-500'>
              <pre>{`<math>`}</pre>
            </h4>
            <p>
              The content wrapped with this tag will render as Math. You can
              always use <code>$$</code> if you prefer:
            </p>
            <pre className='px-4 pb-4 bg-neutral-800 text-neutral-100 rounded-lg my-2'>
              <code>
                {`
# My document

My formula:
<math>
C^2 = A^2 + B^2
</math>

Or:

$$
C^2 = A^2 + B^2
$$

`}
              </code>
            </pre>
          </div>
          <div>
            <h4 className='font-semibold text-blue-500'>
              <pre>{`<justify>, <left>, <center>, <right>`}</pre>
            </h4>
            <p>This tags help with content alignment:</p>
            <pre className='px-4 pb-4 bg-neutral-800 text-neutral-100 rounded-lg my-2'>
              <code>
                {`
# My document

<justify>
This content is justified
</justify>

<left>
This content is aligned to the left
</left>

<center>
This content is centered
</center>

<right>
This content is aligned to the right
</right>

`}
              </code>
            </pre>
          </div>
          <div>
            <h4 className='font-semibold text-blue-500'>
              <pre>{`<mermaid>`}</pre>
            </h4>
            <p>This tag will insert a Mermaid chart:</p>
            <pre className='px-4 pb-4 bg-neutral-800 text-neutral-100 rounded-lg my-2'>
              <code>
                {`
# My document


<mermaid>

  graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
  
</mermaid>

`}
              </code>
            </pre>
            <p className='py-2'>
              See{' '}
              <Link
                className='text-blue-600 underline'
                href='https://mermaid.js.org/intro/'
                target='_blank'
              >
                What is Mermaid?
              </Link>
            </p>
          </div>
          <div>
            <h4 className='font-semibold text-blue-500'>
              <pre>{`<newpage/>`}</pre>
            </h4>
            <p>
              Inserts a new page (this will only be reflected when printing)
            </p>
            <pre className='px-4 pb-4 bg-neutral-800 text-neutral-100 rounded-lg my-2'>
              <code>
                {`
# Page 1

This the first page

<newpage/>

# Page 2

This is the second page

`}
              </code>
            </pre>
          </div>
        </section>
      </div>
    </main>
  )
}
