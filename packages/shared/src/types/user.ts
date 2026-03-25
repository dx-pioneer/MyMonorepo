import type { UserRole, UserStatus } from "../constants/enums";

export interface User {
  id: string;
  phone: string | null;
  email: string | null;
  nickname: string;
  avatar: string | null;
  bio: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

/** 公开的用户资料（不含敏感字段） */
export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string | null;
  bio: string | null;
  followerCount: number;
  followingCount: number;
  recipeCount: number;
  postCount: number;
  isFollowing?: boolean;
}
