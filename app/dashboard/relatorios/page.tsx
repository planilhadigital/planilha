import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import GenerateReportButton from '@/components/reports/GenerateReportButton'
import DeleteReportButton from '@/components/reports/DeleteReportButton'
import ReportGeneratorCard from '@/components/reports/ReportGeneratorCard'
import { ExternalLink, Calendar } from 'lucide-react'

export default async function GlobalReportsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const empresas = await prisma.empresa.findMany({
    where: { usuarios: { some: { id: session.user.id } } },
    orderBy: { createdAt: 'desc' }
  })

  const relatorios = await prisma.relatorioGerado.findMany({
    where: { empresa: { usuarios: { some: { id: session.user.id } } } },
    include: { empresa: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      {/* AREA 1: Gerar Relatório */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <header>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
            Gerar Novo Relatório
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Selecione uma empresa para gerar o relatório consolidado de inteligência artificial.
          </p>
        </header>

        {empresas.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--r-md)', border: '1px dashed var(--border)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>🏢</div>
            <div style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Nenhuma empresa cadastrada</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {empresas.map((e: any) => (
              <ReportGeneratorCard key={e.id} empresa={e} />
            ))}
          </div>
        )}
      </section>

      {/* AREA 2: Galeria de Relatórios */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <header>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
            Galeria de Relatórios
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Histórico de relatórios gerados e salvos para compartilhamento público.
          </p>
        </header>

        {relatorios.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--r-md)', border: '1px dashed var(--border)' }}>
            Nenhum relatório foi gerado ainda.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {relatorios.map((rel: any, index: number) => {
              const date = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(rel.createdAt))
              return (
                <div key={rel.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'visible' }}>
                  {index === 0 && (
                    <div style={{ position: 'absolute', top: -10, right: -10, background: 'var(--accent)', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: 'var(--r-full)', boxShadow: '0 0 10px rgba(250,70,22,0.5)', zIndex: 5, letterSpacing: '1px' }}>
                      NEW
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>{rel.empresa.name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        <Calendar size={12} /> {date}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
                      <span className="badge badge-primary">{rel.dias} dias</span>
                      <span className={`badge ${rel.platform === 'FACEBOOK' ? 'badge-primary' : 'badge-neutral'}`} style={{ fontSize: '0.65rem' }}>
                        {rel.platform}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <a href={`/report/${rel.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                      <ExternalLink size={14} /> Abrir Link
                    </a>
                    <DeleteReportButton reportId={rel.id} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

    </div>
  )
}
