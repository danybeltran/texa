import { Button } from '@/components/ui/button'
import { prisma } from '@/server'
import { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import { FolderIcon, FileTextIcon, FileCodeIcon, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils' // Assuming cn is available
import { PublicFolderBackButton } from './public-folder-back-button'

// Utility function to check for a valid 24-character hex MongoDB ID string
const isValidMongoId = (id: string | undefined): boolean => {
  if (!id) return false
  return typeof id === 'string' && id.length === 24 && /^[0-9a-fA-F]+$/.test(id)
}

// ----------------------------------------------------------------------------------
// Metadata Generation
// ----------------------------------------------------------------------------------
export async function generateMetadata({
  params: $params
}: {
  params: Promise<{ id: string }>
}) {
  const params = await $params
  const folderId = params.id

  // 1. Check ID validity first to prevent Prisma crash
  if (!isValidMongoId(folderId)) {
    return {
      title: 'Invalid Link',
      description: 'The provided folder ID is invalid.'
    } as Metadata
  }

  const [folder] = await prisma.folder.findMany({
    where: {
      id: folderId
    }
  })

  // 2. Safely handle folder not found
  if (!folder) {
    const notFoundName = 'Folder Not Found'
    const notFoundDescription = 'The requested folder could not be located.'
    return {
      title: notFoundName,
      description: notFoundDescription
    } as Metadata
  }

  let folderName = folder.name || 'Unnamed folder'
  let folderDescription = `Viewing folder ${folder.name || ''}`

  return {
    title: folderName,
    openGraph: { title: folderName, description: folderDescription },
    twitter: {
      title: folderName,
      description: folderDescription,
      card: 'summary_large_image'
    },
    description: folderDescription
  } as Metadata
}

// ----------------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------------

export default async function PublicFolderPage({
  params: $params,
  searchParams: $searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from: string }> // Added 'from' query parameter type
}) {
  headers()

  const params = await $params
  const searchParams = await $searchParams
  const currentFolderId = params.id

  // CRITICAL: Check ID format before proceeding
  if (!isValidMongoId(currentFolderId)) {
    return (
      <div className='flex items-center justify-center pt-24'>
        <p>Error: Invalid folder link/ID format.</p>
      </div>
    )
  }

  // Fetching data
  const [[folder], subfolders, documents] = await Promise.all([
    prisma.folder.findMany({ where: { id: currentFolderId } }),
    prisma.folder.findMany({ where: { parentFolderId: currentFolderId } }),
    prisma.doc.findMany({
      where: { parentFolderId: currentFolderId },
      select: { publicId: true, name: true, code: true }
    })
  ])

  if (!folder)
    return (
      <div className='flex items-center justify-center pt-24'>
        <p>Folder not found</p>
      </div>
    )

  const hasSubfolders = subfolders.length > 0
  const hasDocuments = documents.length > 0

  // Back Button Logic: Show if 'from' query parameter is present (indicating navigation history)
  const fromFolderId = searchParams.from

  const BackButton = fromFolderId ? <PublicFolderBackButton /> : null

  // Helper function to render a card item (Folder or Document)
  const renderItemCard = (item: any, isFolder: boolean) => {
    const isCodeFile = !isFolder && item.code

    const key = isFolder ? `f-${item.id}` : `d-${item.publicId}`

    // FIX: When linking to a sub-folder or document, pass the CURRENT folder's ID as 'from'
    const url = isFolder
      ? `/public-folder/${item.id}?from=${currentFolderId}` // <- Added ?from for folder links
      : `/public-view/${item.publicId}?from=${currentFolderId}` // <- Added ?from for document links

    const itemName =
      item.name || (isFolder ? 'Untitled Folder' : 'Untitled Document')

    // Dynamic classes based on item type
    const colorClasses = isFolder
      ? 'text-blue-500 bg-blue-100 dark:text-blue-300 dark:bg-blue-900'
      : isCodeFile
      ? 'text-indigo-500 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-900' // Indigo for Code
      : 'text-green-500 bg-green-100 dark:text-green-300 dark:bg-green-900' // Green for Standard Doc

    const tagClasses = isFolder
      ? 'text-blue-500 bg-blue-50'
      : isCodeFile
      ? 'text-indigo-500 bg-indigo-50' // Indigo for Code
      : 'text-green-500 bg-green-50' // Green for Standard Doc

    const hoverBorderColor = isFolder
      ? 'hover:border-blue-400 dark:hover:border-blue-600'
      : isCodeFile
      ? 'hover:border-indigo-400 dark:hover:border-indigo-600'
      : 'hover:border-green-400 dark:hover:border-green-600'

    return (
      <Link
        key={key}
        href={url}
        className={cn(
          'group block rounded-xl p-4 transition-all duration-200 ease-in-out',
          'bg-white shadow-md hover:shadow-lg dark:bg-gray-800 dark:shadow-xl dark:hover:shadow-2xl',
          'transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5',
          'border border-transparent',
          hoverBorderColor // Apply dynamic hover color
        )}
      >
        <div className='flex flex-col items-center text-center h-full'>
          {/* Icon */}
          <div
            className={`mb-3 p-2 rounded-full transition-colors ${colorClasses}`}
          >
            {isFolder ? (
              <FolderIcon className='w-8 h-8' />
            ) : isCodeFile ? (
              <FileCodeIcon className='w-8 h-8' />
            ) : (
              <FileTextIcon className='w-8 h-8' />
            )}
          </div>

          {/* Name */}
          <p className='text-sm font-medium text-gray-700 dark:text-gray-200 mt-auto line-clamp-2'>
            {itemName}
          </p>

          {/* Small tag for context */}
          <span
            className={`mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${tagClasses} dark:bg-opacity-20`}
          >
            {isFolder ? 'Folder' : isCodeFile ? 'Code File' : 'Document'}
          </span>
        </div>
      </Link>
    )
  }

  return (
    <main className='w-full p-4 md:p-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100'>
          {folder.name || 'Folder Contents'}
        </h1>

        {/* ACTION BAR: Render Back Button only if ?from is present */}
        {BackButton}

        {/* Dynamic Grid Layout for Folders and Documents */}
        <div
          className={
            'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
          }
        >
          {/* Folders/Documents Separation and Rendering */}
          {hasSubfolders || hasDocuments ? (
            <>
              {/* 1. Folders Section */}
              {hasSubfolders && (
                <h3 className='col-span-full text-lg font-semibold text-gray-700 dark:text-gray-200 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700 mb-2'>
                  Folders
                </h3>
              )}
              {subfolders.map(f => renderItemCard(f, true))}

              {/* 2. Documents Section */}
              {hasDocuments && (
                <h3 className='col-span-full text-lg font-semibold text-gray-700 dark:text-gray-200 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700 mb-2'>
                  Documents
                </h3>
              )}
              {documents.map(d => renderItemCard(d, false))}
            </>
          ) : (
            <p className='col-span-full text-center py-12 text-gray-500 dark:text-gray-400'>
              This folder is empty. 🙁
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
