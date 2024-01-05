'use client'

import { FaFolder } from 'react-icons/fa6'
import useFetch, { revalidate } from 'http-react'
import { BsFillFileEarmarkTextFill, BsPlusLg } from 'react-icons/bs'
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
import { useRouter } from 'next/navigation'

export default function CreateForm({ folder }: { folder: Folder }) {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState(availableColors[0].value)

  const router = useRouter()

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
      revalidate(newFolder.parentFolderId ? 'GET /folders' : 'parent')
    }
  })

  const [isCreatingDoc, setIsCreatingDoc] = useState(false)
  const [newDocName, setNewDocName] = useState('')

  const {
    data: __,
    reFetch: createDoc,
    loading: creatingDoc
  } = useFetch<Folder>('/documents', {
    method: 'POST',
    auto: false,
    body: {
      name: newDocName,
      parentFolderId: folder?.id
    },
    onResolve(newDoc) {
      setIsCreatingDoc(false)
      setNewDocName('')

      router.push('/personal/document/' + newDoc.id)

      revalidate([
        newDoc.parentFolderId ? { folderId: newDoc.parentFolderId } : 'parent',
        'GET /documents'
      ])
    }
  })

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className='text-center flex flex-col items-center h-36 pt-4 select-none'>
            <div className='border h-28 border-neutral-400 border-dashed decoration-dashed  w-full flex items-center rounded-lg cursor-pointer'>
              <BsPlusLg className='text-9xl p-6' />
            </div>
            <p className='text-sm mt-4'>Add or create</p>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56'>
          <DropdownMenuItem
            className='cursor-pointer gap-x-2'
            onClick={() => setIsCreatingFolder(true)}
          >
            <FaFolder />
            Folder
          </DropdownMenuItem>
          <DropdownMenuItem
            className='cursor-pointer gap-x-2'
            onClick={() => setIsCreatingDoc(true)}
          >
            <BsFillFileEarmarkTextFill />
            Document
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog
        open={isCreatingFolder}
        onOpenChange={open => setIsCreatingFolder(open)}
      >
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>New folder</DialogTitle>
            <DialogDescription>Create a new folder</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4'>
            <Label>
              <p className='py-3'>Folder name</p>
              <Input
                id='name'
                onKeyDown={e => {
                  if (e.key === 'Enter') createFolder()
                }}
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                className='w-full'
                placeholder='Name'
              />
            </Label>
          </div>
          <div className='grid gap-4'>
            <Label>
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
              disabled={creatingFolder}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Doc creation */}
      <Dialog
        open={isCreatingDoc}
        onOpenChange={open => setIsCreatingDoc(open)}
      >
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>New document</DialogTitle>
            <DialogDescription>Create a new document</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4'>
            <Label>
              <p className='py-3'>Document name</p>
              <Input
                onKeyDown={e => {
                  if (e.key === 'Enter') createDoc()
                }}
                id='name'
                value={newDocName}
                onChange={e => setNewDocName(e.target.value)}
                className='w-full'
                placeholder='Name'
              />
            </Label>
          </div>
          <DialogFooter>
            <Button type='submit' onClick={createDoc} disabled={creatingDoc}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
