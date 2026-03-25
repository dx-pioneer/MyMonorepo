import { describe, it, expect } from "vitest";
import { paginationSchema, idSchema } from "../../src/validators/common";

describe("paginationSchema", () => {
  it("should accept valid pagination params", () => {
    const result = paginationSchema.safeParse({ page: 1, pageSize: 20 });
    expect(result.success).toBe(true);
  });

  it("should use defaults when omitted", () => {
    const result = paginationSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it("should reject page < 1", () => {
    const result = paginationSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("should reject pageSize > 100", () => {
    const result = paginationSchema.safeParse({ pageSize: 200 });
    expect(result.success).toBe(false);
  });
});

describe("idSchema", () => {
  it("should accept non-empty string", () => {
    const result = idSchema.safeParse("clx123abc");
    expect(result.success).toBe(true);
  });

  it("should reject empty string", () => {
    const result = idSchema.safeParse("");
    expect(result.success).toBe(false);
  });
});
