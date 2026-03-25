import { z } from "zod";

export const updateProfileSchema = z
  .object({
    nickname: z
      .string()
      .min(1, "昵称不能为空")
      .max(20, "昵称不超过20个字符")
      .optional(),
    avatar: z.string().url("头像必须为有效URL").optional(),
    bio: z.string().max(200, "简介不超过200个字符").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "至少修改一个字段",
  });
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
