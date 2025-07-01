
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

export type User = FirebaseUser;

// export type Locale = 'es' | 'en';

export type Dictionary = typeof dictionary;
