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
    
    if (!bucketName || !accessKeyId || !secretAccessKey) {
       console.error("Variáveis de ambiente S3 ausentes. Configure S3_BUCKET_NAME, S3_ACCESS_KEY e S3_SECRET_KEY.")
       return NextResponse.json({ error: 'Servidor de arquivos (Cloud) não configurado no .env' }, { status: 500 })
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
      // ACL: 'public-read' // Maioria dos novos buckets recomendam usar Bucket Policies ao invés de ACL
    })

    await s3Client.send(command)
    
    // A URL final. Se estiver usando R2, pode ser que precise setar S3_PUBLIC_URL.
    // O fallback usa o padrão da AWS se não houver endpoint customizado.
    const publicBaseUrl = process.env.S3_PUBLIC_URL || 
                          (endpoint ? `${endpoint}/${bucketName}` : `https://${bucketName}.s3.${region}.amazonaws.com`)
    
    const fileUrl = `${publicBaseUrl}/${fileName}`

    return NextResponse.json({ url: fileUrl })
  } catch (error: any) {
    console.error('Erro no upload para nuvem:', error)
    return NextResponse.json({ error: 'Erro ao fazer upload do arquivo para a nuvem' }, { status: 500 })
  }
}
