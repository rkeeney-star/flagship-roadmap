import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const project = await prisma.project.update({
    where: { id: parseInt(id) },
    data: body,
  })
  return NextResponse.json(project)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.project.delete({ where: { id: parseInt(id) } })
  return new NextResponse(null, { status: 204 })
}
