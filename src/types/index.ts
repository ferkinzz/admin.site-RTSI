
import { User as FirebaseUser } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import type { dictionary } from '@/dictionaries/es';

export interface Article {
  id?: string;
  title: string;
  body: string;
  status: 'draft' | 'published';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  slug?: string;
  authorId?: string | null;
  authorEmail?: string;
  imageUrl?: string;
  imageUrl1?: string;
  imageUrl2?: string;
  articleType?: string;
  otherArticleType?: string;
  categories?: string[];
  fileUrl?: string;
  fileName?: string;
}

export interface Profile {
  id?: string; // This will be the user's UID
  displayName: string;
  bio: string;
  website: string;
  email: string;
  authorId?: string;
  photoURL?: string;
}

export interface PublicConfig {
    loginLogoUrl?: string;
}

export interface SiteConfig {
  deployHookUrl?: string;
  siteUrl?: string;
  siteName?: string;
  blogPath?: string;
  resourcesPath?: string;
  videosPath?: string;
  otherPath?: string;
  aiSiteDescription?: string;
  aiTargetAudience?: string;
  aiKeyProducts?: string;
  aiForbiddenTopics?: string;
}

export interface AiContext {
  siteName: string;
  aiSiteDescription: string;
  aiTargetAudience: string;
  aiKeyProducts: string;
  aiForbiddenTopics: string;
}

export const userRoles = ['Admin', 'Redactor', 'Redactor Jr.'] as const;
export type UserRole = (typeof userRoles)[number];

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  token: string;
  createdAt: Timestamp;
  used: boolean;
  creatorId: string;
  creatorEmail: string;
}

export interface CustomContentType {
  id: string;
  name: string;
}

export interface License {
  uid: string;
}

export interface TokenUsage {
  totalTokens: number;
  lastUpdated: Timestamp;
}

export interface User extends FirebaseUser {
  role: UserRole | null;
}

// export type Locale = 'es' | 'en';

export type Dictionary = typeof dictionary;
