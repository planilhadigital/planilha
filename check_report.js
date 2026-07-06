const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const r = await prisma.relatorioGerado.findFirst({ orderBy: { createdAt: 'desc' } });
  if (r) console.log(JSON.stringify(r.dadosCongelados.aiAnalysis, null, 2));
  else console.log('Nenhum relatorio');
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
