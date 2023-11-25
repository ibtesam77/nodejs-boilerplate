const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

(async () => {
  try {
    await prisma.$connect();
    console.log("👍 Prisma connected to database successfully!!!");
  } catch (error) {
    console.error(
      "😐 Something went wrong in connecting prisma to database! :",
      error
    );
  }
})();

module.exports = prisma;
