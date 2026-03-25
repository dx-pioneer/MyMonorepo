import { describe, it, expect } from "vitest";
import { prisma } from "../src/client";

describe("prisma client", () => {
  it("should export a PrismaClient instance", () => {
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe("function");
    expect(typeof prisma.$disconnect).toBe("function");
  });

  it("should return the same instance (singleton)", async () => {
    const { prisma: prisma2 } = await import("../src/client");
    expect(prisma).toBe(prisma2);
  });
});
