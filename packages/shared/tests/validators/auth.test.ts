import { describe, it, expect } from "vitest";
import {
  loginByEmailSchema,
  loginBySmsSchema,
  registerSchema,
  sendSmsCodeSchema,
} from "../../src/validators/auth";

describe("registerSchema", () => {
  it("should accept valid registration with email", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "Abc123456",
      nickname: "美食家",
    });
    expect(result.success).toBe(true);
  });

  it("should accept valid registration with phone", () => {
    const result = registerSchema.safeParse({
      phone: "13800138000",
      password: "Abc123456",
      nickname: "美食家",
    });
    expect(result.success).toBe(true);
  });

  it("should reject when both phone and email are missing", () => {
    const result = registerSchema.safeParse({
      password: "Abc123456",
      nickname: "美食家",
    });
    expect(result.success).toBe(false);
  });

  it("should reject password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "Abc1234",
      nickname: "美食家",
    });
    expect(result.success).toBe(false);
  });

  it("should reject nickname longer than 20 characters", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "Abc123456",
      nickname: "a".repeat(21),
    });
    expect(result.success).toBe(false);
  });
});

describe("loginByEmailSchema", () => {
  it("should accept valid email login", () => {
    const result = loginByEmailSchema.safeParse({
      email: "test@example.com",
      password: "Abc123456",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = loginByEmailSchema.safeParse({
      email: "not-an-email",
      password: "Abc123456",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginBySmsSchema", () => {
  it("should accept valid sms login", () => {
    const result = loginBySmsSchema.safeParse({
      phone: "13800138000",
      code: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("should reject code not 6 digits", () => {
    const result = loginBySmsSchema.safeParse({
      phone: "13800138000",
      code: "12345",
    });
    expect(result.success).toBe(false);
  });
});

describe("sendSmsCodeSchema", () => {
  it("should accept valid phone number", () => {
    const result = sendSmsCodeSchema.safeParse({
      phone: "13800138000",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid phone format", () => {
    const result = sendSmsCodeSchema.safeParse({
      phone: "1234567",
    });
    expect(result.success).toBe(false);
  });
});
