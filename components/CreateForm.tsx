'use client'

import useFetch, { revalidate } from 'http-react'
import { Folder } from '@prisma/client'
import { useState } from 'react'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { availableColors } from '@/lib/utils'
import { useParams, useRouter } from 'next/navigation'
import { atom } from 'atomic-state'
import Link from 'next/link'
// Importing Lucide Icons
import { FolderPlus, FileText, Code, Plus } from 'lucide-react'

const codeOnlyState = atom({
  key: 'codeOnly',
  default: false,
  persist: true
})

export default function CreateForm({ folder }: { folder: Folder }) {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState(availableColors[0].value)

  const { folderId } = useParams()
  const router = useRouter()

  // --- Folder Creation Logic (Remains Unchanged) ---
  const {
    data: _,
    reFetch: createFolder,
    loading: creatingFolder
  } = useFetch<Folder>('/folders', {
    method: 'POST',
    auto: false,
    body: {
      name: newFolderName || 'Unnamed folder',
      parentFolderId: folder?.id,
      color: newFolderColor
    },
    onResolve(newFolder) {
      setIsCreatingFolder(false)
      setNewFolderName('')
      revalidate(newFolder.parentFolderId ? `subfolders-${folderId}` : 'parent')
    }
  })

  const [isCreatingDoc, setIsCreatingDoc] = useState(false)
  const [newDocName, setNewDocName] = useState('')
  const [codeOnly, setCodeOnly] = useState(false)

  // --- Document Creation Logic (Remains Unchanged) ---
  const {
    data: __,
    reFetch: createDoc,
    loading: creatingDoc
  } = useFetch<Folder>('/documents', {
    method: 'POST',
    auto: false,
    body: {
      name: newDocName,
      parentFolderId: folder?.id,
      code: codeOnly
    },
    onResolve(newDoc) {
      setIsCreatingDoc(false)
      setNewDocName('')

      router.push('/personal/document/' + newDoc.id)

      revalidate([
        newDoc.parentFolderId ? { folderId: newDoc.parentFolderId } : 'parent',
        `folder-documents-${folderId}`
      ])
    }
  })

  return (
    <>
      {/* --- Floating Action Button (FAB) Container --- */}
      <div className='fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size='icon'
              className='h-14 w-14 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105'
              aria-label='Create New Item'
            >
              <Plus className='h-6 w-6' />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className='w-56' side='top' align='end'>
            <DropdownMenuItem
              className='cursor-pointer gap-x-2'
              onClick={() => setIsCreatingFolder(true)}
            >
              <FolderPlus className='w-4 h-4' />
              Folder
            </DropdownMenuItem>
            <DropdownMenuItem
              className='cursor-pointer gap-x-2'
              onClick={() => {
                setIsCreatingDoc(true)
                setCodeOnly(false)
              }}
            >
              <FileText className='w-4 h-4' />
              Document (Rich Text)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='cursor-pointer gap-x-2'
              onClick={() => {
                setIsCreatingDoc(true)
                setCodeOnly(true)
              }}
            >
              <Code className='w-4 h-4' />
              Document (Markdown)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* --- End of FAB --- */}

      {/* ----------------- New Folder Dialog (Remains Unchanged) ----------------- */}
      <Dialog
        open={isCreatingFolder}
        onOpenChange={open => setIsCreatingFolder(open)}
      >
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
            <DialogDescription>
              Create a new folder to organize your content.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4'>
            <Label htmlFor='name'>
              <p className='py-3'>Folder name</p>
              <Input
                id='name'
                onKeyDown={e => {
                  if (e.key === 'Enter') createFolder()
                }}
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                className='w-full'
                placeholder='e.g., Project Reports'
              />
            </Label>
          </div>
          <div className='grid gap-4'>
            <Label htmlFor='color'>
              <p className='py-3'>Folder color</p>
              <Select
                value={newFolderColor}
                onValueChange={value => setNewFolderColor(value)}
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Select a color' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {availableColors.map(color => (
                      <SelectItem
                        value={color.value}
                        key={color.name + color.value}
                      >
                        <div className='flex items-center justify-start gap-x-2'>
                          <div
                            className='w-4 h-4 rounded-full'
                            style={{
                              backgroundColor: color.value
                            }}
                          ></div>{' '}
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Label>
          </div>
          <DialogFooter>
            <Button
              type='submit'
              onClick={createFolder}
              disabled={creatingFolder || !newFolderName.trim()}
            >
              {creatingFolder ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ----------------- New Document Dialog (Remains Unchanged) ----------------- */}
      <Dialog
        open={isCreatingDoc}
        onOpenChange={open => setIsCreatingDoc(open)}
      >
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>
              {codeOnly ? 'New Markdown Document' : 'New Document'}
            </DialogTitle>
            <DialogDescription>
              {codeOnly ? (
                <div>
                  <p>
                    Markdown documents are ideal for technical notes,
                    documentation, and advanced formatting like LaTeX (KateX).
                  </p>
                  <br />
                  <p>
                    <Link
                      href='https://www.markdownguide.org/basic-syntax/'
                      target='_blank'
                      className='underline text-blue-500 hover:text-blue-600'
                    >
                      Learn Markdown Syntax
                    </Link>
                  </p>
                </div>
              ) : (
                'Create a new rich-text document. Recommended for most general purpose notes and content.'
              )}
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4'>
            <Label htmlFor='doc-name'>
              <p className='py-3'>Document name</p>
              <Input
                onKeyDown={e => {
                  if (e.key === 'Enter') createDoc()
                }}
                id='doc-name'
                value={newDocName}
                onChange={e => setNewDocName(e.target.value)}
                className='w-full'
                placeholder='e.g., Meeting Notes 2024'
              />
            </Label>
          </div>
          <DialogFooter>
            <Button
              type='submit'
              onClick={createDoc}
              disabled={creatingDoc || !newDocName.trim()}
            >
              {creatingDoc ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
