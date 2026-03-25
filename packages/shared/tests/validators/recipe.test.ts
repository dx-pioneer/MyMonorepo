import { describe, it, expect } from "vitest";
import {
  createRecipeSchema,
  ingredientSchema,
  recipeStepSchema,
} from "../../src/validators/recipe";

describe("ingredientSchema", () => {
  it("should accept valid ingredient", () => {
    const result = ingredientSchema.safeParse({
      name: "鸡蛋",
      amount: "2个",
      order: 1,
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty name", () => {
    const result = ingredientSchema.safeParse({
      name: "",
      amount: "2个",
      order: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe("recipeStepSchema", () => {
  it("should accept step with image", () => {
    const result = recipeStepSchema.safeParse({
      content: "打散鸡蛋",
      image: "https://oss.example.com/step1.jpg",
      order: 1,
    });
    expect(result.success).toBe(true);
  });

  it("should accept step without image", () => {
    const result = recipeStepSchema.safeParse({
      content: "打散鸡蛋",
      order: 1,
    });
    expect(result.success).toBe(true);
  });
});

describe("createRecipeSchema", () => {
  const validRecipe = {
    title: "番茄炒蛋",
    description: "经典家常菜",
    coverImage: "https://oss.example.com/cover.jpg",
    difficulty: "EASY" as const,
    cookTime: 15,
    servings: 2,
    ingredients: [{ name: "鸡蛋", amount: "3个", order: 1 }],
    steps: [{ content: "打散鸡蛋", order: 1 }],
    tagIds: [],
  };

  it("should accept valid recipe", () => {
    const result = createRecipeSchema.safeParse(validRecipe);
    expect(result.success).toBe(true);
  });

  it("should reject empty title", () => {
    const result = createRecipeSchema.safeParse({
      ...validRecipe,
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty ingredients", () => {
    const result = createRecipeSchema.safeParse({
      ...validRecipe,
      ingredients: [],
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty steps", () => {
    const result = createRecipeSchema.safeParse({
      ...validRecipe,
      steps: [],
    });
    expect(result.success).toBe(false);
  });

  it("should reject cookTime <= 0", () => {
    const result = createRecipeSchema.safeParse({
      ...validRecipe,
      cookTime: 0,
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid difficulty", () => {
    const result = createRecipeSchema.safeParse({
      ...validRecipe,
      difficulty: "IMPOSSIBLE",
    });
    expect(result.success).toBe(false);
  });
});
