import { Ad, Category, User, ChatRoom, Message, Review, Coupon, Report, BlogPost, PlatformStats } from '../types';

const BASE_URL = ''; // relative paths proxying to the server

export const api = {
  // Authentication
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed.');
    }
    return res.json();
  },

  register: async (data: any): Promise<{ token: string; user: User }> => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed.');
    }
    return res.json();
  },

  getMe: async (token: string): Promise<User> => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error('Failed to retrieve profile.');
    }
    return res.json();
  },

  updateProfile: async (data: any): Promise<User> => {
    const res = await fetch(`${BASE_URL}/api/auth/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Profile update failed.');
    }
    return res.json();
  },

  // Classified Ads
  getAds: async (filters: Record<string, string | number | boolean> = {}): Promise<Ad[]> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    const res = await fetch(`${BASE_URL}/api/ads?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load advertisements.');
    return res.json();
  },

  getAdDetail: async (id: string, incClick = false): Promise<{ ad: Ad; seller: User }> => {
    const res = await fetch(`${BASE_URL}/api/ads/${id}?incClick=${incClick}`);
    if (!res.ok) throw new Error('Listing details not found.');
    return res.json();
  },

  createAd: async (adData: any): Promise<Ad> => {
    const res = await fetch(`${BASE_URL}/api/ads/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create listing.');
    }
    return res.json();
  },

  updateAd: async (id: string, adData: any): Promise<Ad> => {
    const res = await fetch(`${BASE_URL}/api/ads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adData),
    });
    if (!res.ok) throw new Error('Failed to update advertisement.');
    return res.json();
  },

  deleteAd: async (id: string): Promise<boolean> => {
    const res = await fetch(`${BASE_URL}/api/ads/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete listing.');
    return true;
  },

  toggleFavorite: async (userId: string, adId: string): Promise<{ isFavorite: boolean; count: number }> => {
    const res = await fetch(`${BASE_URL}/api/ads/${adId}/toggle-favorite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Bookmark toggle failed.');
    return res.json();
  },

  postReview: async (adId: string, reviewerId: string, rating: number, text: string): Promise<Review> => {
    const res = await fetch(`${BASE_URL}/api/ads/${adId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewerId, rating, text }),
    });
    if (!res.ok) throw new Error('Failed to publish review.');
    return res.json();
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const res = await fetch(`${BASE_URL}/api/categories`);
    if (!res.ok) throw new Error('Failed to retrieve categories.');
    return res.json();
  },

  // Messaging & Chat Rooms
  getChatRooms: async (userId: string): Promise<any[]> => {
    const res = await fetch(`${BASE_URL}/api/chat/rooms?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to load chat conversations.');
    return res.json();
  },

  getOrCreateRoom: async (adId: string, buyerId: string, sellerId: string): Promise<ChatRoom> => {
    const res = await fetch(`${BASE_URL}/api/chat/rooms/get-or-create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId, buyerId, sellerId }),
    });
    if (!res.ok) throw new Error('Failed to initiate conversation.');
    return res.json();
  },

  getMessages: async (roomId: string, userId?: string): Promise<Message[]> => {
    const url = userId ? `${BASE_URL}/api/chat/rooms/${roomId}/messages?userId=${userId}` : `${BASE_URL}/api/chat/rooms/${roomId}/messages`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load messages.');
    return res.json();
  },

  sendMessage: async (roomId: string, senderId: string, data: { text?: string; image?: string; emoji?: string }): Promise<Message> => {
    const res = await fetch(`${BASE_URL}/api/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId, ...data }),
    });
    if (!res.ok) throw new Error('Failed to deliver message.');
    return res.json();
  },

  // Coupons & Invoicing
  validateCoupon: async (code: string): Promise<Coupon> => {
    const res = await fetch(`${BASE_URL}/api/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Invalid or expired promo coupon.');
    }
    return res.json();
  },

  // Reports
  reportAd: async (adId: string, reporterId: string, reason: string, description: string): Promise<Report> => {
    const res = await fetch(`${BASE_URL}/api/reports/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId, reporterId, reason, description }),
    });
    if (!res.ok) throw new Error('Failed to submit report flag.');
    return res.json();
  },

  // Blogs & Guides
  getBlogs: async (): Promise<BlogPost[]> => {
    const res = await fetch(`${BASE_URL}/api/blogs`);
    if (!res.ok) throw new Error('Failed to retrieve blog guides.');
    return res.json();
  },

  getBlogBySlug: async (slug: string): Promise<BlogPost> => {
    const res = await fetch(`${BASE_URL}/api/blogs/${slug}`);
    if (!res.ok) throw new Error('Failed to load blog guide.');
    return res.json();
  },

  // Admin Control
  getAdminStats: async (): Promise<PlatformStats> => {
    const res = await fetch(`${BASE_URL}/api/admin/stats`);
    if (!res.ok) throw new Error('Failed to load admin stats.');
    return res.json();
  },

  getAdminReports: async (): Promise<Report[]> => {
    const res = await fetch(`${BASE_URL}/api/admin/reports`);
    if (!res.ok) throw new Error('Failed to load spam reports.');
    return res.json();
  },

  updateReportStatus: async (reportId: string, status: 'Pending' | 'Reviewed' | 'Resolved'): Promise<Report> => {
    const res = await fetch(`${BASE_URL}/api/admin/reports/${reportId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update report status.');
    return res.json();
  },

  updateAdStatus: async (adId: string, status: Ad['status']): Promise<Ad> => {
    const res = await fetch(`${BASE_URL}/api/admin/ads/${adId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to moderate listing status.');
    return res.json();
  },

  // AI Assistant Optimization
  optimizeAdWithAI: async (data: { title: string; category?: string; description?: string }): Promise<{
    optimizedTitle: string;
    optimizedDescription: string;
    suggestedTags: string[];
    seoScore: number;
    metaDescription: string;
  }> => {
    const res = await fetch(`${BASE_URL}/api/gemini/optimize-seo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('AI assistant optimization failed.');
    return res.json();
  }
};
