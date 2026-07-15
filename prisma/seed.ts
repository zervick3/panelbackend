import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@panel.com";
  const password = "admin123";
  const name = "Administrador";

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    console.log("✔ Usuario admin ya existe");
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { email, password: hashed, name },
  });

  console.log(`✔ Usuario admin creado: ${email} / ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
