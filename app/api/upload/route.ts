import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: Request) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Sanitizar nome do arquivo e criar timestamp para evitar colisão
    const originalName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')
    const fileName = `${Date.now()}-${originalName}`
    
    // Caminho físico
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    
    // Garante que o diretório existe
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (e) {
      // Ignorar se já existe
    }
    
    const filePath = path.join(uploadDir, fileName)
    
    // Salvar arquivo
    await writeFile(filePath, buffer)
    
    // Retornar a URL pública
    return NextResponse.json({ url: `/uploads/${fileName}` })
  } catch (error: any) {
    console.error('Erro no upload:', error)
    return NextResponse.json({ error: 'Erro ao fazer upload do arquivo' }, { status: 500 })
  }
}
