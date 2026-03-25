import { describe, it, expect } from "vitest";
import { createPostSchema } from "../../src/validators/post";

describe("createPostSchema", () => {
  it("should accept valid post with images", () => {
    const result = createPostSchema.safeParse({
      content: "今天发现一家超棒的小店",
      media: [
        { url: "https://oss.example.com/1.jpg", type: "IMAGE", order: 0 },
      ],
      tagIds: [],
    });
    expect(result.success).toBe(true);
  });

  it("should accept post with optional title", () => {
    const result = createPostSchema.safeParse({
      title: "探店日记",
      content: "推荐一家火锅店",
      media: [],
      tagIds: [],
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty content", () => {
    const result = createPostSchema.safeParse({
      content: "",
      media: [],
      tagIds: [],
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid media type", () => {
    const result = createPostSchema.safeParse({
      content: "test",
      media: [{ url: "https://oss.example.com/1.jpg", type: "GIF", order: 0 }],
      tagIds: [],
    });
    expect(result.success).toBe(false);
  });
});
