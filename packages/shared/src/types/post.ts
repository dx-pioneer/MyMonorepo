import type { ContentStatus, MediaType } from "../constants/enums";

export interface PostMedia {
  id: string;
  url: string;
  type: MediaType;
  order: number;
}

export interface Post {
  id: string;
  authorId: string;
  title: string | null;
  content: string;
  status: ContentStatus;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  media: PostMedia[];
}

/** 信息流中的帖子卡片 */
export interface PostCard {
  id: string;
  title: string | null;
  content: string;
  coverImage: string | null;
  authorNickname: string;
  authorAvatar: string | null;
  likeCount: number;
  isLiked?: boolean;
}
