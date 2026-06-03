import { PrismaClient } from "@prisma/client";

// Prisma client singleton — avoids exhausting Neon connections during dev
// hot-reload, which would otherwise spin up a new client on every change.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
