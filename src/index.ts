import "dotenv/config";
import app from "./app";
import { PORT } from "./config";
import { prisma } from "./db";

const server = app.listen(PORT, () => {
  console.log(`✔ API corriendo en http://localhost:${PORT}`);
});

function shutdown(): void {
  server.close(() => {
    prisma.$disconnect().finally(() => process.exit(0));
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
