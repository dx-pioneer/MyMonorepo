import type { ContentStatus, Difficulty } from "../constants/enums";

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  order: number;
}

export interface RecipeStep {
  id: string;
  content: string;
  image: string | null;
  order: number;
}

export interface Recipe {
  id: string;
  authorId: string;
  title: string;
  description: string | null;
  coverImage: string;
  difficulty: Difficulty;
  cookTime: number;
  servings: number;
  status: ContentStatus;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  ingredients: Ingredient[];
  steps: RecipeStep[];
}

/** 信息流中的食谱卡片 */
export interface RecipeCard {
  id: string;
  title: string;
  coverImage: string;
  difficulty: Difficulty;
  cookTime: number;
  authorNickname: string;
  authorAvatar: string | null;
  likeCount: number;
  isLiked?: boolean;
}
