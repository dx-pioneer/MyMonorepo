import type { ContentStatus } from "../constants/enums";

export interface Comment {
  id: string;
  authorId: string;
  recipeId: string | null;
  postId: string | null;
  parentId: string | null;
  content: string;
  status: ContentStatus;
  createdAt: Date;
  authorNickname: string;
  authorAvatar: string | null;
  replies?: Comment[];
}

export interface Like {
  id: string;
  userId: string;
  recipeId: string | null;
  postId: string | null;
  createdAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  recipeId: string | null;
  postId: string | null;
  createdAt: Date;
}
