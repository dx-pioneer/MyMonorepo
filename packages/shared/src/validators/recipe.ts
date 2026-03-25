import { z } from "zod";
import { Difficulty } from "../constants/enums";

export const ingredientSchema = z.object({
  name: z.string().min(1, "食材名不能为空").max(50),
  amount: z.string().min(1, "用量不能为空").max(50),
  order: z.number().int().min(0),
});
export type IngredientInput = z.infer<typeof ingredientSchema>;

export const recipeStepSchema = z.object({
  content: z.string().min(1, "步骤内容不能为空").max(500),
  image: z.string().url().optional(),
  order: z.number().int().min(0),
});
export type RecipeStepInput = z.infer<typeof recipeStepSchema>;

export const createRecipeSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(100, "标题不超过100个字符"),
  description: z.string().max(500).optional(),
  coverImage: z.string().url("封面图必须为有效URL"),
  difficulty: z.nativeEnum(Difficulty),
  cookTime: z.number().int().min(1, "烹饪时间至少1分钟"),
  servings: z.number().int().min(1).default(1),
  ingredients: z.array(ingredientSchema).min(1, "至少添加一种食材"),
  steps: z.array(recipeStepSchema).min(1, "至少添加一个步骤"),
  tagIds: z.array(z.string()).default([]),
});
export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
