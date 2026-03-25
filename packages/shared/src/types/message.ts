import type { NotificationType } from "../constants/enums";

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

/** 私信会话摘要 */
export interface Conversation {
  partnerId: string;
  partnerNickname: string;
  partnerAvatar: string | null;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string | null;
  sourceType: string | null;
  sourceId: string | null;
  isRead: boolean;
  createdAt: Date;
}
