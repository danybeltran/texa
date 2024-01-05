import { prisma } from '@/server'
import { Folder } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const session = await getServerSession()

  if (!session?.user?.email) return NextResponse.json({}, { status: 500 })

  const parentId = new URL(req.url).searchParams.get('parentFolderId') as string

  const folders = await prisma.folder.findMany({
    where: {
      parentFolderId: parentId,
      AND: {
        owner: session.user.email
      }
    }
  })

  return NextResponse.json(folders, {
    status: 200
  })
}

export async function POST(req: Request) {
  const session = await getServerSession()

  if (!session?.user?.email) return NextResponse.json({}, { status: 500 })

  const newFolderData = await req.json()

  const newFolder = await prisma.folder.create({
    data: {
      name: newFolderData?.name || '',
      parentFolderId: newFolderData?.parentFolderId ?? null,
      color: newFolderData?.color || '#fcba03',
      owner: session.user.email
    }
  })

  return NextResponse.json(newFolder, {
    status: 200
  })
}

export async function DELETE(req: Request) {
  const session = await getServerSession()

  if (!session?.user?.email) return NextResponse.json({}, { status: 500 })

  const folderData: Folder = await req.json()

  const deletedFolder = await prisma.folder.deleteMany({
    where: {
      id: folderData.id,
      AND: {
        owner: session.user.email
      }
    }
  })

  await prisma.folder.deleteMany({
    where: {
      parentFolderId: folderData.id
    }
  })
  await prisma.doc.deleteMany({
    where: {
      parentFolderId: folderData.id
    }
  })

  return NextResponse.json(
    {
      deletedFolder
    },
    {
      status: 200
    }
  )
}

export async function PUT(req: Request) {
  const session = await getServerSession()

  if (!session?.user?.email) return NextResponse.json({}, { status: 500 })

  const folderData = (await req.json()) as Folder

  const updatedFolder = await prisma.folder.update({
    data: {
      name: folderData.name,
      color: folderData.color,
      parentFolderId: folderData.parentFolderId
    },
    where: {
      id: folderData.id,
      AND: {
        owner: session.user.email
      }
    }
  })

  return NextResponse.json(updatedFolder, {
    status: 200
  })
}
