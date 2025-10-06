import { Doc } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

import { prisma } from '@/server'

export async function GET(req: Request) {
  const session = await getServerSession()

  if (!session?.user?.email) return NextResponse.json({}, { status: 500 })

  const parentId = new URL(req.url).searchParams.get('parentFolderId') as string

  const id = new URL(req.url).searchParams.get('id')

  if (id) {
    const doc = await prisma.doc.findFirst({
      where: {
        id: id,
        AND: {
          owner: session.user.email
        }
      }
    })

    return NextResponse.json(doc, {
      status: 200
    })
  }
  const folderDocuments = await prisma.doc.findMany({
    where: {
      parentFolderId: parentId || null,
      AND: {
        owner: session.user.email
      }
    }
  })

  return NextResponse.json(folderDocuments, {
    status: 200
  })
}

export async function POST(req: Request) {
  const session = await getServerSession()

  if (!session?.user?.email) return NextResponse.json({}, { status: 500 })

  const newDocumentData = await req.json()

  const newDocument = await prisma.doc.create({
    data: {
      name: newDocumentData?.name,
      parentFolderId: newDocumentData?.parentFolderId ?? null,
      owner: session.user.email,
      publicId: crypto.randomUUID(),
      code: newDocumentData.code,
      locked: false
    }
  })

  return NextResponse.json(newDocument, {
    status: 200
  })
}

export async function DELETE(req: Request) {
  const session = await getServerSession()

  if (!session?.user?.email) return NextResponse.json({}, { status: 500 })

  const documentData: Doc = await req.json()

  const deletedFolder = await prisma.doc.deleteMany({
    where: {
      id: documentData.id,
      AND: {
        owner: session.user.email
      }
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

  const newDocumentData = (await req.json()) as Doc

  const newDocument = await prisma.doc.update({
    data: {
      name: newDocumentData.name,
      content: newDocumentData.content,
      parentFolderId: newDocumentData.parentFolderId,
      editorOnly: newDocumentData.editorOnly,
      font: newDocumentData.font || 'inter',
      description: newDocumentData.description,
      locked: newDocumentData.locked
    },
    where: {
      id: newDocumentData.id,
      AND: {
        owner: session.user.email
      }
    }
  })

  return NextResponse.json(newDocument, {
    status: 200
  })
}
