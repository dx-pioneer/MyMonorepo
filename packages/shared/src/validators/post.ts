import { z } from "zod";
import { MediaType } from "../constants/enums";

const postMediaSchema = z.object({
  url: z.string().url("媒体URL格式不正确"),
  type: z.nativeEnum(MediaType),
  order: z.number().int().min(0),
});

export const createPostSchema = z.object({
  title: z.string().max(100, "标题不超过100个字符").optional(),
  content: z.string().min(1, "内容不能为空").max(5000, "内容不超过5000个字符"),
  media: z.array(postMediaSchema).default([]),
  tagIds: z.array(z.string()).default([]),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;
