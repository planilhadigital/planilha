const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { metaAccessToken: { not: null } }
  });
  
  if (!user) {
    console.log("No user with meta access token found.");
    return;
  }
  
  console.log("Fetching /me/accounts...");
  let accountsRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=id,name&limit=100&access_token=${user.metaAccessToken}`);
  let accountsData = await accountsRes.json();
  console.log("Accounts count:", accountsData.data ? accountsData.data.length : 0);
  if (accountsData.data && accountsData.data.length > 0) {
     console.log("Sample accounts:", accountsData.data.slice(0, 3).map(p => p.name));
  }

  console.log("\nFetching /me/businesses...");
  let bmRes = await fetch(`https://graph.facebook.com/v19.0/me/businesses?fields=id,name&access_token=${user.metaAccessToken}`);
  let bmData = await bmRes.json();
  
  if (bmData.error) {
    console.log("Error fetching businesses:", bmData.error.message);
  } else {
    console.log("Businesses count:", bmData.data ? bmData.data.length : 0);
    for (const bm of bmData.data || []) {
      console.log(`\nFetching pages for BM: ${bm.name} (${bm.id})`);
      let bmPagesRes = await fetch(`https://graph.facebook.com/v19.0/${bm.id}/owned_pages?fields=id,name&limit=100&access_token=${user.metaAccessToken}`);
      let bmPagesData = await bmPagesRes.json();
      console.log(`  Owned pages count: ${bmPagesData.data ? bmPagesData.data.length : 0}`);
      
      let clientPagesRes = await fetch(`https://graph.facebook.com/v19.0/${bm.id}/client_pages?fields=id,name&limit=100&access_token=${user.metaAccessToken}`);
      let clientPagesData = await clientPagesRes.json();
      console.log(`  Client pages count: ${clientPagesData.data ? clientPagesData.data.length : 0}`);
    }
  }
}
main().finally(() => prisma.$disconnect());
