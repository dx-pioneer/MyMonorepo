import { z } from "zod";

export const createCommentSchema = z
  .object({
    recipeId: z.string().min(1).optional(),
    postId: z.string().min(1).optional(),
    parentId: z.string().min(1).optional(),
    content: z
      .string()
      .min(1, "评论内容不能为空")
      .max(500, "评论不超过500个字符"),
  })
  .refine(
    (data) =>
      (data.recipeId && !data.postId) || (!data.recipeId && data.postId),
    { message: "必须指定且仅指定 recipeId 或 postId 中的一个" },
  );
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
