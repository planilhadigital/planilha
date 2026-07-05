const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.updateMany({
    where: { email: 'jean100pw@gmail.com' },
    data: { role: 'admin' }
  });
  console.log('Role updated to admin:', user);
}
main().catch(console.error).finally(() => prisma.$disconnect());
