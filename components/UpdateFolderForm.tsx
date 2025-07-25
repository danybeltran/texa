'use client'

import useFetch, { Client, revalidate } from 'http-react'
import { Folder } from '@prisma/client'
import { useEffect, useState } from 'react'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { availableColors } from '@/lib/utils'
import { useParams } from 'next/navigation'

export default function UpdateFolderForm({
  folder,
  open,
  setOpen
}: {
  folder: Folder
  open: boolean
  setOpen: any
}) {
  const [folderData, setFolderData] = useState(folder)

  useEffect(() => {
    setOpen(false)
  }, [folder])

  const { folderId } = useParams()

  const { reFetch: updateFolder, data: _ } = useFetch('/folders', {
    method: 'PUT',
    body: folderData,
    id: { folderData },
    auto: false,
    onResolve() {
      revalidate([`folder-${folderId}`, `subfolders-${folderId}`, 'parent'])
      setOpen(false)
    }
  })

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={open => {
          setOpen(open)
        }}
        modal
      >
        <DialogContent
          className='sm:max-w-[425px]'
          onClick={e => {
            e.stopPropagation()
          }}
        >
          <DialogHeader>
            <DialogTitle>Update folder</DialogTitle>
            <DialogDescription>Update folder details</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4'>
            <Label>
              <p className='py-3'>Folder name</p>
              <Input
                id='name'
                value={folderData.name}
                onKeyDown={e => {
                  if (e.key === 'Enter') updateFolder()
                }}
                onChange={e =>
                  setFolderData(prevData => ({
                    ...prevData,
                    name: e.target.value
                  }))
                }
                className='w-full'
                placeholder='Name'
              />
            </Label>
          </div>
          <div className='grid gap-4'>
            <Label>
              <p className='py-3'>Folder color</p>

              <Select
                value={folderData.color}
                onValueChange={value =>
                  setFolderData(prevData => ({ ...prevData, color: value }))
                }
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
              disabled={false}
              onClick={() => {
                updateFolder()
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Doc creation */}
    </>
  )
}
