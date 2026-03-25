import { z } from "zod";

const phoneSchema = z.string().regex(/^1[3-9]\d{9}$/, "手机号格式不正确");
const emailSchema = z.string().email("邮箱格式不正确");
const passwordSchema = z
  .string()
  .min(8, "密码不少于8位")
  .max(64, "密码不超过64位");
const nicknameSchema = z
  .string()
  .min(1, "昵称不能为空")
  .max(20, "昵称不超过20个字符");
const smsCodeSchema = z.string().regex(/^\d{6}$/, "验证码为6位数字");

export const registerSchema = z
  .object({
    phone: phoneSchema.optional(),
    email: emailSchema.optional(),
    password: passwordSchema,
    nickname: nicknameSchema,
  })
  .refine((data) => data.phone || data.email, {
    message: "手机号和邮箱至少填一个",
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginByEmailSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
export type LoginByEmailInput = z.infer<typeof loginByEmailSchema>;

export const loginBySmsSchema = z.object({
  phone: phoneSchema,
  code: smsCodeSchema,
});
export type LoginBySmsInput = z.infer<typeof loginBySmsSchema>;

export const sendSmsCodeSchema = z.object({
  phone: phoneSchema,
});
export type SendSmsCodeInput = z.infer<typeof sendSmsCodeSchema>;
