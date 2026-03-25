import { describe, it, expect } from "vitest";
import { createCommentSchema } from "../../src/validators/comment";

describe("createCommentSchema", () => {
  it("should accept comment on recipe", () => {
    const result = createCommentSchema.safeParse({
      recipeId: "clx123",
      content: "做得太好了！",
    });
    expect(result.success).toBe(true);
  });

  it("should accept comment on post", () => {
    const result = createCommentSchema.safeParse({
      postId: "clx456",
      content: "种草了！",
    });
    expect(result.success).toBe(true);
  });

  it("should accept reply to comment", () => {
    const result = createCommentSchema.safeParse({
      recipeId: "clx123",
      parentId: "clx789",
      content: "谢谢！",
    });
    expect(result.success).toBe(true);
  });

  it("should reject when both recipeId and postId present", () => {
    const result = createCommentSchema.safeParse({
      recipeId: "clx123",
      postId: "clx456",
      content: "test",
    });
    expect(result.success).toBe(false);
  });

  it("should reject when neither recipeId nor postId present", () => {
    const result = createCommentSchema.safeParse({
      content: "test",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty content", () => {
    const result = createCommentSchema.safeParse({
      recipeId: "clx123",
      content: "",
    });
    expect(result.success).toBe(false);
  });
});
