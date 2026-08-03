const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function makeAdmin() {
  const emails = ["satyasahith5@gmail.com", "choppalasahith.23.cse@anits.edu.in"];
  for (const email of emails) {
    try {
      const user = await prisma.user.update({
        where: { email },
        data: { isAdmin: true },
      });
      console.log(`Updated ${email} to admin! ID: ${user.id}`);
    } catch (error) {
      console.log(`Error updating ${email}:`, error.message);
    }
  }
}

makeAdmin().catch(console.error).finally(() => prisma.$disconnect());
