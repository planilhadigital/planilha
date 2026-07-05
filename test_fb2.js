const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { metaAccessToken: { not: null } },
    select: { email: true, metaAccessToken: true }
  });
  
  for (const user of users) {
    console.log(`\nUser: ${user.email}`);
    let accountsRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=id,name&limit=100&access_token=${user.metaAccessToken}`);
    let accountsData = await accountsRes.json();
    console.log("Accounts count:", accountsData.data ? accountsData.data.length : 0);
    if (accountsData.data && accountsData.data.length > 0) {
       console.log("Pages:", accountsData.data.map(p => p.name).join(', '));
    }
  }
}
main().finally(() => prisma.$disconnect());
