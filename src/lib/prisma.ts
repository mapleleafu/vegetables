import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = global as unknown as {
  prisma?: ReturnType<typeof getClient>;
};

function getClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL not set");
  }

  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  const client = new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

  return client.$extends({
    result: {
      user: {
        hasPassword: {
          needs: { passwordHash: true },
          compute(user) {
            return user.passwordHash !== null && user.passwordHash.length > 0;
          },
        },
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? getClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
