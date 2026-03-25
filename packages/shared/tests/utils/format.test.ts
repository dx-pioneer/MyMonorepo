import { describe, it, expect } from "vitest";
import { truncateText, formatCount } from "../../src/utils/format";

describe("truncateText", () => {
  it("should return text as-is if shorter than limit", () => {
    expect(truncateText("hello", 10)).toBe("hello");
  });

  it("should truncate and add ellipsis", () => {
    expect(truncateText("hello world", 5)).toBe("hello...");
  });

  it("should handle empty string", () => {
    expect(truncateText("", 10)).toBe("");
  });
});

describe("formatCount", () => {
  it("should return number as-is if < 10000", () => {
    expect(formatCount(999)).toBe("999");
  });

  it("should format as 万 if >= 10000", () => {
    expect(formatCount(12345)).toBe("1.2万");
  });

  it("should format large numbers", () => {
    expect(formatCount(100000)).toBe("10万");
  });

  it("should handle zero", () => {
    expect(formatCount(0)).toBe("0");
  });
});
