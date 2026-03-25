import { describe, it, expect } from "vitest";
import { updateProfileSchema } from "../../src/validators/user";

describe("updateProfileSchema", () => {
  it("should accept valid profile update", () => {
    const result = updateProfileSchema.safeParse({
      nickname: "新昵称",
      bio: "美食爱好者",
    });
    expect(result.success).toBe(true);
  });

  it("should accept partial update", () => {
    const result = updateProfileSchema.safeParse({
      nickname: "新昵称",
    });
    expect(result.success).toBe(true);
  });

  it("should reject bio longer than 200 characters", () => {
    const result = updateProfileSchema.safeParse({
      bio: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty object", () => {
    const result = updateProfileSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
