export const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  ACTIVE: "ACTIVE",
  BANNED: "BANNED",
  DELETED: "DELETED",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const ContentStatus = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
  DELETED: "DELETED",
} as const;
export type ContentStatus = (typeof ContentStatus)[keyof typeof ContentStatus];

export const Difficulty = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
} as const;
export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

export const MediaType = {
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
} as const;
export type MediaType = (typeof MediaType)[keyof typeof MediaType];

export const NotificationType = {
  LIKE: "LIKE",
  COMMENT: "COMMENT",
  FOLLOW: "FOLLOW",
  SYSTEM: "SYSTEM",
} as const;
export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const ReportTarget = {
  RECIPE: "RECIPE",
  POST: "POST",
  COMMENT: "COMMENT",
  USER: "USER",
} as const;
export type ReportTarget = (typeof ReportTarget)[keyof typeof ReportTarget];

export const ReportStatus = {
  PENDING: "PENDING",
  RESOLVED: "RESOLVED",
  DISMISSED: "DISMISSED",
} as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];
