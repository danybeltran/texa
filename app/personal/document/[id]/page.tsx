import 'markdown-it-latex/dist/index.css'

import DocumentView from '@/components/DocumentView'
import { BrowserOnly } from 'react-kuh'

export default function DocumentPage() {
  return (
    <BrowserOnly>
      <DocumentView />
    </BrowserOnly>
  )
}
