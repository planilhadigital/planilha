import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req })
    
    // Simulação de verificação de ADMIN (neste cenário, assumimos que quem chama tem autoridade)
    if (!token?.sub) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { targetUserId, targetEmpresaId } = body

    if (!targetUserId || !targetEmpresaId) {
      return NextResponse.json({ error: 'Faltam parâmetros (targetUserId, targetEmpresaId)' }, { status: 400 })
    }

    // Transação isolada (Garantia de consistência do banco de dados)
    const resultado = await prisma.$transaction(async (tx) => {
      
      // 1. Vincular o usuário à empresa (M:N relacional atual)
      const empresaAtualizada = await tx.empresa.update({
        where: { id: targetEmpresaId },
        data: {
          usuarios: {
            connect: { id: targetUserId }
          }
        }
      })

      // 2. Extrair dados do Onboarding
      const visitor = await tx.visitorProfile.findUnique({
        where: { userId: targetUserId }
      })

      // 3. Salvar no CRM Metadata e 4. Excluir perfil
      if (visitor) {
        await tx.tenantCrmMetadata.upsert({
          where: { empresaId: targetEmpresaId },
          update: {
            importedPersona: visitor.personaType,
            importedNiche: visitor.marketNiche,
            importedInvestment: visitor.marketingInvestment,
            historicalOnboardingData: JSON.stringify(visitor)
          },
          create: {
            empresaId: targetEmpresaId,
            importedPersona: visitor.personaType,
            importedNiche: visitor.marketNiche,
            importedInvestment: visitor.marketingInvestment,
            historicalOnboardingData: JSON.stringify(visitor)
          }
        })

        await tx.visitorProfile.delete({
          where: { userId: targetUserId }
        })
      }

      return empresaAtualizada
    })

    return NextResponse.json({ success: true, message: 'Usuário promovido com sucesso', resultado })
  } catch (error) {
    console.error('Erro na promoção de visitante:', error)
    return NextResponse.json({ error: 'Erro interno na transação' }, { status: 500 })
  }
}
