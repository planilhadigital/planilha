import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Para rotas do App Router no Next.js (Server Actions ou Route Handlers), o Next.js suporta envios maiores que 4MB por padrão para formData, mas pode ser configurado no next.config.mjs se necessário.
export async function POST(request: Request) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const originalName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')
    const fileName = `${Date.now()}-${originalName}`

    // Pega as credenciais do ambiente
    const endpoint = process.env.S3_ENDPOINT || ''
    const region = process.env.S3_REGION || 'auto'
    const accessKeyId = process.env.S3_ACCESS_KEY || ''
    const secretAccessKey = process.env.S3_SECRET_KEY || ''
    const bucketName = process.env.S3_BUCKET_NAME || ''
    
    // Fallback: Salvar localmente se não houver nuvem configurada (apenas para ambiente local)
    if (!bucketName || !accessKeyId || !secretAccessKey) {
       console.warn("Aviso: S3_BUCKET_NAME, S3_ACCESS_KEY e S3_SECRET_KEY não estão configurados. Salvando localmente (NÃO RECOMENDADO PARA VERCEL).")
       
       const { writeFileSync, mkdirSync } = require('fs')
       const { join } = require('path')
       
       const uploadDir = join(process.cwd(), 'public', 'uploads')
       try {
         mkdirSync(uploadDir, { recursive: true })
       } catch (e) {}
       
       const filePath = join(uploadDir, fileName)
       writeFileSync(filePath, buffer)
       
       return NextResponse.json({ url: `/uploads/${fileName}` })
    }

    const s3Client = new S3Client({
      region,
      endpoint: endpoint || undefined,
      credentials: {
        accessKeyId,
        secretAccessKey,
      }
    })

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    })

    await s3Client.send(command)
    
    const publicBaseUrl = process.env.S3_PUBLIC_URL || 
                          (endpoint ? `${endpoint}/${bucketName}` : `https://${bucketName}.s3.${region}.amazonaws.com`)
    
    const fileUrl = `${publicBaseUrl}/${fileName}`

    return NextResponse.json({ url: fileUrl })
  } catch (error: any) {
    console.error('Erro no upload:', error)
    return NextResponse.json({ error: 'Erro ao fazer upload do arquivo' }, { status: 500 })
  }
}
