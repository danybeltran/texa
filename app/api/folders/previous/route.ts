import { prisma } from '@/server'
import { Folder } from '@prisma/client'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const folderId = new URL(req.url).searchParams.get('folderId') as string

  const [firstFolder] = await prisma.folder.findMany({
    where: {
      id: folderId
    }
  })

  let folderSegments: Folder[] = []

  let previous: Folder = firstFolder

  while (true) {
    if (!previous.parentFolderId) break

    const parent = await prisma.folder.findFirst({
      where: {
        id: previous.parentFolderId
      }
    })

    folderSegments.push(parent!)
    previous = parent!
  }

  return NextResponse.json(
    {
      folderSegments: folderSegments.reverse(),
      folder: firstFolder
    },
    {
      status: 200
    }
  )
}
