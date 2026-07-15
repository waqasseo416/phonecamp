/**
 * Types & Interfaces for Classified Ads Marketplace
 */

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface SocialLinks {
  website?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  twitter?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  phone: string;
  whatsapp: string;
  avatar: string;
  cover: string;
  bio: string;
  role: UserRole;
  createdAt: string;
  isVerified: boolean;
  rating: number;
  reviewsCount: number;
  socialLinks: SocialLinks;
  gender?: 'Mr' | 'Mrs';
  reviews?: Review[];
  favorites?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // lucide icon name
  subcategories: string[];
}

export type AdCondition = 'New' | 'Like New' | 'Excellent' | 'Good' | 'Fair';

export type AdStatus = 'Pending' | 'Active' | 'Expired' | 'Rejected' | 'Scheduled';

export type PackageType = 'Free' | 'Featured' | 'Premium' | 'Top' | 'Urgent' | 'Highlight';

export interface Ad {
  id: string;
  userId: string;
  categoryId: string;
  subcategory: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  isNegotiable: boolean;
  condition: AdCondition;
  city: string;
  area: string;
  phone: string;
  whatsapp: string;
  email: string;
  images: string[];
  videoUrl?: string;
  packageType: PackageType;
  status: AdStatus;
  views: number;
  clicks: number;
  favorites: number;
  createdAt: string;
  tags: string[];
  scheduledAt?: string;
  isPromoted: boolean;
  featuredDays?: number;
}

export interface ChatRoom {
  id: string;
  adId: string;
  buyerId: string;
  sellerId: string;
  lastMessageText: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  text: string;
  image?: string;
  emoji?: string;
  createdAt: string;
  isRead: boolean;
}

export interface Review {
  id: string;
  adId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  sellerId: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface Favorite {
  userId: string;
  adId: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  expiresAt: string;
}

export interface Report {
  id: string;
  adId: string;
  adTitle: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  description: string;
  status: 'Pending' | 'Reviewed' | 'Resolved';
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  image: string;
  author: string;
  createdAt: string;
  tags: string[];
}

export interface PlatformStats {
  totalUsers: number;
  totalAds: number;
  activeAds: number;
  totalRevenue: number;
  totalTransactions: number;
  viewsCount: number;
  clicksCount: number;
  favoritesCount: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  duration: string;
  color: string;
}
