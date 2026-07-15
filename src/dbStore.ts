import * as fs from 'fs';
import * as path from 'path';
import { 
  User, UserRole, Category, Ad, ChatRoom, Message, Review, Favorite, Coupon, Report, BlogPost, PlatformStats, PackageType, AdStatus, AdCondition
} from './types';

const DB_FILE_PATH = path.join(process.cwd(), 'marketplace_db.json');

// Interface representing the entire relational database state
export interface DatabaseState {
  users: User[];
  passwords: Record<string, string>; // userId -> password (simulated hash)
  categories: Category[];
  ads: Ad[];
  chatRooms: ChatRoom[];
  messages: Message[];
  reviews: Review[];
  favorites: Favorite[];
  coupons: Coupon[];
  reports: Report[];
  blogs: BlogPost[];
}

// Initial deep luxury seed data
const initialCategories: Category[] = [
  {
    id: 'cat-vehicles',
    name: 'Vehicles',
    slug: 'vehicles',
    icon: 'Car',
    subcategories: ['Supercars', 'Sedans', 'SUVs', 'Electric Vehicles', 'Classic Cars', 'Motorcycles']
  },
  {
    id: 'cat-real-estate',
    name: 'Real Estate',
    slug: 'real-estate',
    icon: 'Home',
    subcategories: ['Villas & Mansions', 'Penthouses', 'Apartments', 'Commercial Spaces', 'Land Plot']
  },
  {
    id: 'cat-mobiles',
    name: 'Phones & Tablets',
    slug: 'phones-tablets',
    icon: 'Smartphone',
    subcategories: ['Smartphones', 'Tablets', 'Smart Watches', 'Accessories']
  },
  {
    id: 'cat-electronics',
    name: 'Electronics',
    slug: 'electronics',
    icon: 'Tv',
    subcategories: ['Laptops & PCs', 'Audio Systems', 'Cameras', 'TV & Video', 'Gaming Consoles']
  },
  {
    id: 'cat-fashion',
    name: 'Fashion & Luxury',
    slug: 'fashion-luxury',
    icon: 'Shirt',
    subcategories: ['Watches', 'Bags & Leather', 'Apparel', 'Jewelry', 'Footwear']
  },
  {
    id: 'cat-furniture',
    name: 'Furniture',
    slug: 'furniture',
    icon: 'Armchair',
    subcategories: ['Living Room', 'Office Chairs & Desks', 'Lighting', 'Beds & Wardrobes', 'Outdoor']
  },
  {
    id: 'cat-jobs',
    name: 'Jobs',
    slug: 'jobs',
    icon: 'Briefcase',
    subcategories: ['Software Development', 'Design & Creative', 'Marketing & Sales', 'Customer Support', 'Finance']
  },
  {
    id: 'cat-services',
    name: 'Services',
    slug: 'services',
    icon: 'Sparkles',
    subcategories: ['SaaS Development', 'Digital Marketing', 'Interior Design', 'Legal & Tax', 'Photography']
  },
  {
    id: 'cat-learning',
    name: 'Learning & Courses',
    slug: 'learning',
    icon: 'GraduationCap',
    subcategories: ['Coding Bootcamps', 'Business Strategy', 'Language Lessons', 'Music & Arts']
  },
  {
    id: 'cat-animals',
    name: 'Animals & Pets',
    slug: 'animals-pets',
    icon: 'PawPrint',
    subcategories: ['Dogs & Puppies', 'Cats & Kittens', 'Birds', 'Accessories & Food']
  },
  {
    id: 'cat-business',
    name: 'Business & Industrial',
    slug: 'business-industrial',
    icon: 'TrendingUp',
    subcategories: ['SaaS Assets', 'Retail Equipment', 'Office Inventory', 'Machinery']
  },
  {
    id: 'cat-events',
    name: 'Events & Experiences',
    slug: 'events-experiences',
    icon: 'Calendar',
    subcategories: ['Networking Sessions', 'VIP Concert Tickets', 'Tech Conferences', 'Exhibitions']
  }
];

const initialUsers: User[] = [
  {
    id: 'user-admin',
    email: 'companyexpertbacklink@gmail.com',
    name: 'Sobia Administrator',
    username: 'sobia_admin',
    phone: '+92 341 8417790',
    whatsapp: '+92 341 8417790',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
    bio: 'Velo Marketplace Co-founder and Chief Administrator. Here to verify premium listings and secure transactions.',
    role: UserRole.ADMIN,
    createdAt: '2026-01-10T10:00:00Z',
    isVerified: true,
    rating: 5.0,
    reviewsCount: 12,
    socialLinks: { website: 'https://velo.market', facebook: 'https://facebook.com/velo' },
    gender: 'Mrs'
  },
  {
    id: 'user-seller1',
    email: 'alex.luxury@example.com',
    name: 'Alex Sterling',
    username: 'sterling_deals',
    phone: '+1 (555) 019-2834',
    whatsapp: '+1 (555) 019-2834',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    cover: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
    bio: 'Curator of exceptional luxury items, vehicles, and real estate. Guaranteed authenticity and 24/7 client response.',
    role: UserRole.USER,
    createdAt: '2026-02-15T08:30:00Z',
    isVerified: true,
    rating: 4.9,
    reviewsCount: 38,
    socialLinks: { website: 'https://sterlinglux.com', twitter: 'https://twitter.com/sterlinglux' },
    gender: 'Mr'
  },
  {
    id: 'user-seller2',
    email: 'elena.tech@example.com',
    name: 'Elena Rostova',
    username: 'elena_devices',
    phone: '+44 7911 123456',
    whatsapp: '+44 7911 123456',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    cover: 'https://images.unsplash.com/photo-1625225230517-4e6761026027?auto=format&fit=crop&q=80&w=1200',
    bio: 'Senior developer offering clean web templates, premium custom software setups, and high-performance electronic gadgets.',
    role: UserRole.USER,
    createdAt: '2026-03-01T12:00:00Z',
    isVerified: true,
    rating: 4.8,
    reviewsCount: 15,
    socialLinks: { website: 'https://elenatech.io' },
    gender: 'Mrs'
  }
];

const initialAds: Ad[] = [
  {
    id: 'ad-tesla',
    userId: 'user-seller1',
    categoryId: 'cat-vehicles',
    subcategory: 'Electric Vehicles',
    title: 'Tesla Model S Plaid (2024) - Absolute Mint Condition',
    slug: 'tesla-model-s-plaid-2024-absolute-mint',
    description: 'Selling my beautiful Tesla Model S Plaid. Solid black metallic paint, white premium interior, 21" Arachnid wheels, full self-driving package pre-loaded. Extremely fast, 1020 horsepower. Covered in full body stealth PPF (Paint Protection Film) from day one. Single owner, garage kept, only charged on level 2 home charger. Comes with original home charger, dual key cards, and mobile connector kit. Negotiable only for serious buyers, no low-ball offers.',
    price: 94500,
    isNegotiable: true,
    condition: 'Like New',
    city: 'New York',
    area: 'Manhattan',
    phone: '+1 (555) 019-2834',
    whatsapp: '+1 (555) 019-2834',
    email: 'alex.luxury@example.com',
    images: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1532581291347-9c39cf10a73c?auto=format&fit=crop&q=80&w=800'
    ],
    packageType: 'Premium',
    status: 'Active',
    views: 1240,
    clicks: 432,
    favorites: 89,
    createdAt: '2026-07-01T15:00:00Z',
    tags: ['tesla', 'electric', 'plaid', 'luxury-car', 'mint'],
    isPromoted: true,
    featuredDays: 30
  },
  {
    id: 'ad-porsche',
    userId: 'user-seller1',
    categoryId: 'cat-vehicles',
    subcategory: 'Supercars',
    title: 'Porsche 911 GT3 (992) - Crayon Grey - Clubsport Package',
    slug: 'porsche-911-gt3-992-crayon-grey',
    description: 'The ultimate track-oriented daily machine: 992 GT3 equipped with the highly desirable Clubsport Package. Painted in elegant Crayon Grey, full bucket carbon fiber seats, front axle lift system, Porsche Ceramic Composite Brakes (PCCB) in high-gloss black, carbon fiber roof, and LED matrix headlights in dark blue. Incredible naturally aspirated 4.0L flat-six engine revving up to 9,000 RPM. Complete service records at certified Porsche dealer. PPF applied on the entire front end.',
    price: 245000,
    isNegotiable: false,
    condition: 'Excellent',
    city: 'Los Angeles',
    area: 'Beverly Hills',
    phone: '+1 (555) 019-2834',
    whatsapp: '+1 (555) 019-2834',
    email: 'alex.luxury@example.com',
    images: [
      'https://images.unsplash.com/photo-1611245801311-667dfb6ef5f0?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800'
    ],
    packageType: 'Featured',
    status: 'Active',
    views: 2541,
    clicks: 729,
    favorites: 142,
    createdAt: '2026-07-10T11:20:00Z',
    tags: ['porsche', '911', 'gt3', 'clubsport', 'supercar'],
    isPromoted: true,
    featuredDays: 14
  },
  {
    id: 'ad-mansion',
    userId: 'user-seller1',
    categoryId: 'cat-real-estate',
    subcategory: 'Villas & Mansions',
    title: 'Architectural Masterpiece Waterfront Villa with Infinite Pool',
    slug: 'architectural-masterpiece-waterfront-villa',
    description: 'Designed by award-winning architects, this ultra-modern beachfront villa offers 6 luxury bedrooms, 8 spa-like bathrooms, a floating concrete staircase, double-height floor-to-ceiling glass paneling, a bespoke professional chef kitchen with Gaggenau appliances, and a private cinema. The massive outdoor patio includes a 25-meter saltwater heated infinity pool overlooking the blue ocean, a built-in sunken firepit lounge, and a private jetty for yachts up to 80ft. Furnished entirely with Minotti and Poliform designer furniture.',
    price: 5200000,
    isNegotiable: true,
    condition: 'New',
    city: 'Miami',
    area: 'Biscayne Bay',
    phone: '+1 (555) 019-2834',
    whatsapp: '+1 (555) 019-2834',
    email: 'alex.luxury@example.com',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=800'
    ],
    packageType: 'Premium',
    status: 'Active',
    views: 4529,
    clicks: 911,
    favorites: 310,
    createdAt: '2026-07-05T09:15:00Z',
    tags: ['villa', 'luxury-home', 'beachfront', 'miami', 'mansion'],
    isPromoted: true,
    featuredDays: 30
  },
  {
    id: 'ad-macbook',
    userId: 'user-seller2',
    categoryId: 'cat-electronics',
    subcategory: 'Laptops & PCs',
    title: 'MacBook Pro 16" (M3 Max) - 128GB RAM - 2TB SSD Space Black',
    slug: 'macbook-pro-16-m3-max-128gb',
    description: 'The ultimate powerhouse for developers, 3D artists, and creators. Custom configuration Space Black Apple MacBook Pro. Features the top-tier 16-core M3 Max chip, a massive 128GB of Unified Memory, and a ultra-fast 2TB SSD. Pristine condition, absolute 100% battery health with only 12 charge cycles. Fully wrapped in transparent dbrand skin. Under AppleCare+ valid until June 2028. Comes in original box with the Apple 140W MagSafe 3 charger. Moving to a desktop setup hence the sale.',
    price: 3650,
    isNegotiable: false,
    condition: 'Like New',
    city: 'London',
    area: 'Kensington',
    phone: '+44 7911 123456',
    whatsapp: '+44 7911 123456',
    email: 'elena.tech@example.com',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=800'
    ],
    packageType: 'Highlight',
    status: 'Active',
    views: 520,
    clicks: 188,
    favorites: 42,
    createdAt: '2026-07-12T16:45:00Z',
    tags: ['macbook', 'apple', 'm3max', 'pro-laptop', 'developer'],
    isPromoted: true,
    featuredDays: 7
  },
  {
    id: 'ad-rolex',
    userId: 'user-seller1',
    categoryId: 'cat-fashion',
    subcategory: 'Watches',
    title: 'Rolex Daytona White Dial (116500LN) - Full Set Box & Papers',
    slug: 'rolex-daytona-white-dial-116500ln',
    description: 'Offered is the iconic Rolex Cosmograph Daytona Oystersteel with white dial and black ceramic Cerachrom bezel, affectionately nicknamed the "Panda". Extremely clean condition, very minor hairline scratches on the polished clasp, otherwise flawless. Purchased from a local Authorized Dealer in February 2023. Includes outer box, inner green box, green chronometer seal tag, white price tag, booklet, and official Rolex warranty card (5-year international warranty remaining until 2028). Highly collectible.',
    price: 28900,
    isNegotiable: false,
    condition: 'Excellent',
    city: 'Dubai',
    area: 'Downtown Marina',
    phone: '+1 (555) 019-2834',
    whatsapp: '+1 (555) 019-2834',
    email: 'alex.luxury@example.com',
    images: [
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'
    ],
    packageType: 'Featured',
    status: 'Active',
    views: 890,
    clicks: 231,
    favorites: 73,
    createdAt: '2026-07-08T10:00:00Z',
    tags: ['rolex', 'daytona', 'watch', 'luxury', 'panda'],
    isPromoted: true,
    featuredDays: 14
  }
];

const initialReviews: Review[] = [
  {
    id: 'rev-1',
    adId: 'ad-tesla',
    reviewerId: 'user-seller2',
    reviewerName: 'Elena Rostova',
    reviewerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    sellerId: 'user-seller1',
    rating: 5,
    text: 'Purchased a high-end electronic device from Alex previously. The listing was exactly as described, response times were lightning fast, and transaction was extremely safe and smooth. Highly recommend doing business with him!',
    createdAt: '2026-06-20T14:30:00Z'
  },
  {
    id: 'rev-2',
    adId: 'ad-macbook',
    reviewerId: 'user-seller1',
    reviewerName: 'Alex Sterling',
    reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    sellerId: 'user-seller2',
    rating: 5,
    text: 'Elena is an outstanding seller and developer. Very clean deals, exceptional communication skills. Real luxury mindset!',
    createdAt: '2026-07-13T10:15:00Z'
  }
];

const initialBlogs: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'How to Value and Sell Your Luxury Car Online in 2026',
    slug: 'value-and-sell-your-luxury-car-online-2026',
    summary: 'A step-by-step masterclass on photographing, detailing, valuing, and successfully selling premium sports cars and EVs on online marketplaces.',
    content: `Selling a premium or luxury vehicle online requires a highly strategic approach. Unlike standard cars, luxury buyers are looking for meticulous details, history of maintenance, premium modifications, and a reliable transactional environment.

### 1. The Art of Presentation
First, detail is king. A high-end buyer will immediately dismiss an ad with low-resolution photographs, dirty backgrounds, or a dusty engine bay. Always schedule a professional exterior/interior detailing session before taking pictures.
- **Lighting:** Shoot during the "Golden Hour" (one hour after sunrise or before sunset).
- **Locations:** Choose a neutral, clean, and spacious location like an empty rooftop or modern architectural concrete backgrounds.
- **Angle Variety:** Provide 3/4 front, direct profile, rear profile, dashboard focus, steering wheel texture, seat conditions, and deep tread lines of premium tires.

### 2. Comprehensive Service Documentation
Upload images or explicitly mention the presence of certified dealership service records, tire specs, original battery health diagnostic logs, or custom ceramic/paint coating warranties. Transparency establishes instant confidence.

### 3. Smart Pricing
Determine whether your pricing is firm or negotiable. Premium packages like Velo's **Featured Ads** and **Premium Badging** will place your supercar at the top of organic listings, amplifying your click rates by up to 400%. Keep the conversation professional and secure.`,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
    author: 'Alex Sterling',
    createdAt: '2026-07-02T10:00:00Z',
    tags: ['Vehicles', 'Luxury', 'Selling Guide', 'Supercars']
  },
  {
    id: 'blog-2',
    title: '5 Design Principles of High-Value Luxury Properties',
    slug: '5-design-principles-high-value-luxury-properties',
    summary: 'Discover the ultimate architectural elements, materials, and amenities that define multi-million-dollar real estate assets.',
    content: `When browse premium listings, a discerning buyer immediately filters for core architectural integrity. Here are the five key elements currently driving peak real estate valuations:

### 1. Volumetric Grandeur & Ceiling Heights
Standard apartments settle on 8-to-9ft ceilings. Luxury spaces, however, feature a minimum of 11ft clearances, and frequently feature double-height entries. This volume creates immediate visual breathing room and grand acoustics.

### 2. Frameless Glazing & Floating Interfaces
Minimalism is the modern canvas of premium. Double-glazed architectural windows with ultra-slim aluminum framing make interior and exterior boundaries blend seamlessly.

### 3. Natural Organic Matter
Travertine marble, micro-cement flooring, custom walnut woodwork, and raw brass finishes grow in aesthetic depth over decades. Avoid synthetics or cheap laminates at all costs.`,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800',
    author: 'Sobia Administrator',
    createdAt: '2026-07-09T14:30:00Z',
    tags: ['Real Estate', 'Interior Design', 'Architecture', 'Property Valuation']
  }
];

const initialCoupons: Coupon[] = [
  { code: 'VELO50', discountPercent: 50, expiresAt: '2026-12-31T23:59:59Z' },
  { code: 'STARTFREE', discountPercent: 100, expiresAt: '2026-08-31T23:59:59Z' },
  { code: 'EXPERT20', discountPercent: 20, expiresAt: '2026-10-15T23:59:59Z' }
];

const initialReports: Report[] = [
  {
    id: 'rep-1',
    adId: 'ad-macbook',
    adTitle: 'MacBook Pro 16" (M3 Max) - 128GB RAM',
    reporterId: 'user-seller1',
    reporterName: 'Alex Sterling',
    reason: 'Incorrect Subcategory',
    description: 'This is posted in Electronics -> Audio Systems rather than Laptops.',
    status: 'Pending',
    createdAt: '2026-07-14T09:00:00Z'
  }
];

// In-Memory Database with Autoloader & Disk Persistence
let state: DatabaseState = {
  users: initialUsers,
  passwords: {
    'user-admin': 'admin123',
    'user-seller1': 'alex123',
    'user-seller2': 'elena123'
  },
  categories: initialCategories,
  ads: initialAds,
  chatRooms: [
    {
      id: 'room-1',
      adId: 'ad-tesla',
      buyerId: 'user-seller2',
      sellerId: 'user-seller1',
      lastMessageText: 'Is the PPF stealth paint matte or gloss finish?',
      updatedAt: '2026-07-14T18:22:00Z'
    }
  ],
  messages: [
    {
      id: 'msg-1',
      chatRoomId: 'room-1',
      senderId: 'user-seller2',
      text: 'Hello Alex, I am very interested in your Tesla Model S. Is the PPF stealth paint matte or gloss finish?',
      createdAt: '2026-07-14T18:22:00Z',
      isRead: false
    }
  ],
  reviews: initialReviews,
  favorites: [
    { userId: 'user-seller2', adId: 'ad-tesla' },
    { userId: 'user-seller2', adId: 'ad-porsche' }
  ],
  coupons: initialCoupons,
  reports: initialReports,
  blogs: initialBlogs
};

// Database persistence helpers
export function loadDatabase(): DatabaseState {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const fileData = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(fileData);
      // Ensure basic arrays are present in parsed data
      state = {
        users: parsed.users || initialUsers,
        passwords: parsed.passwords || {},
        categories: parsed.categories || initialCategories,
        ads: parsed.ads || initialAds,
        chatRooms: parsed.chatRooms || [],
        messages: parsed.messages || [],
        reviews: parsed.reviews || initialReviews,
        favorites: parsed.favorites || [],
        coupons: parsed.coupons || initialCoupons,
        reports: parsed.reports || initialReports,
        blogs: parsed.blogs || initialBlogs
      };
    } else {
      saveDatabase();
    }
  } catch (error) {
    console.error('Error loading database, resetting to seed data:', error);
    saveDatabase();
  }
  return state;
}

export function saveDatabase(): void {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write database file:', error);
  }
}

// Relational Operations
export const dbStore = {
  // Get database state
  get: () => {
    return state;
  },

  // Save changes
  sync: () => {
    saveDatabase();
  },

  // Users
  getUsers: () => state.users,
  getUserById: (id: string) => state.users.find(u => u.id === id),
  getUserByEmail: (email: string) => state.users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  createUser: (user: User, passwordSim: string) => {
    state.users.push(user);
    state.passwords[user.id] = passwordSim;
    saveDatabase();
    return user;
  },
  updateUser: (id: string, updates: Partial<User>) => {
    const userIndex = state.users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      state.users[userIndex] = { ...state.users[userIndex], ...updates } as User;
      saveDatabase();
      return state.users[userIndex];
    }
    return null;
  },

  // Auth check
  verifyCredentials: (email: string, pass: string) => {
    const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && state.passwords[user.id] === pass) {
      return user;
    }
    return null;
  },

  // Ads & Listings
  getAds: () => state.ads,
  getAdById: (id: string) => state.ads.find(a => a.id === id),
  createAd: (ad: Ad) => {
    state.ads.push(ad);
    saveDatabase();
    return ad;
  },
  updateAd: (id: string, updates: Partial<Ad>) => {
    const adIndex = state.ads.findIndex(a => a.id === id);
    if (adIndex !== -1) {
      state.ads[adIndex] = { ...state.ads[adIndex], ...updates } as Ad;
      saveDatabase();
      return state.ads[adIndex];
    }
    return null;
  },
  deleteAd: (id: string) => {
    const index = state.ads.findIndex(a => a.id === id);
    if (index !== -1) {
      state.ads.splice(index, 1);
      // Clean up favorites
      state.favorites = state.favorites.filter(f => f.adId !== id);
      saveDatabase();
      return true;
    }
    return false;
  },

  // Categories
  getCategories: () => state.categories,
  createCategory: (cat: Category) => {
    state.categories.push(cat);
    saveDatabase();
    return cat;
  },

  // Favorites
  getFavorites: (userId: string) => state.favorites.filter(f => f.userId === userId).map(f => f.adId),
  toggleFavorite: (userId: string, adId: string) => {
    const index = state.favorites.findIndex(f => f.userId === userId && f.adId === adId);
    let isFav = false;
    if (index !== -1) {
      state.favorites.splice(index, 1);
    } else {
      state.favorites.push({ userId, adId });
      isFav = true;
    }
    saveDatabase();
    return isFav;
  },

  // Reviews
  getReviewsBySeller: (sellerId: string) => state.reviews.filter(r => r.sellerId === sellerId),
  createReview: (review: Review) => {
    state.reviews.push(review);
    
    // Recalculate seller rating
    const sellerReviews = state.reviews.filter(r => r.sellerId === review.sellerId);
    const avgRating = sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length;
    
    const userIndex = state.users.findIndex(u => u.id === review.sellerId);
    if (userIndex !== -1) {
      state.users[userIndex].rating = parseFloat(avgRating.toFixed(1));
      state.users[userIndex].reviewsCount = sellerReviews.length;
    }
    
    saveDatabase();
    return review;
  },

  // Chat and Messaging
  getRoomsByUser: (userId: string) => {
    return state.chatRooms.filter(r => r.buyerId === userId || r.sellerId === userId);
  },
  getRoomMessages: (roomId: string) => {
    return state.messages.filter(m => m.chatRoomId === roomId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },
  getOrCreateRoom: (adId: string, buyerId: string, sellerId: string) => {
    let room = state.chatRooms.find(r => r.adId === adId && r.buyerId === buyerId && r.sellerId === sellerId);
    if (!room) {
      room = {
        id: `room-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        adId,
        buyerId,
        sellerId,
        lastMessageText: '',
        updatedAt: new Date().toISOString()
      };
      state.chatRooms.push(room);
      saveDatabase();
    }
    return room;
  },
  addMessage: (msg: Message) => {
    state.messages.push(msg);
    const roomIndex = state.chatRooms.findIndex(r => r.id === msg.chatRoomId);
    if (roomIndex !== -1) {
      state.chatRooms[roomIndex].lastMessageText = msg.text || (msg.image ? '📷 Image' : '✨ Reaction');
      state.chatRooms[roomIndex].updatedAt = new Date().toISOString();
    }
    saveDatabase();
    return msg;
  },
  markRoomRead: (roomId: string, userId: string) => {
    state.messages.forEach(m => {
      if (m.chatRoomId === roomId && m.senderId !== userId) {
        m.isRead = true;
      }
    });
    saveDatabase();
  },

  // Coupons
  getCouponByCode: (code: string) => {
    return state.coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && new Date(c.expiresAt) > new Date());
  },

  // Reports
  getReports: () => state.reports,
  createReport: (report: Report) => {
    state.reports.push(report);
    saveDatabase();
    return report;
  },
  updateReportStatus: (id: string, status: 'Pending' | 'Reviewed' | 'Resolved') => {
    const report = state.reports.find(r => r.id === id);
    if (report) {
      report.status = status;
      saveDatabase();
      return report;
    }
    return null;
  },

  // Blogs
  getBlogs: () => state.blogs,
  getBlogBySlug: (slug: string) => state.blogs.find(b => b.slug === slug),
  createBlogPost: (post: BlogPost) => {
    state.blogs.push(post);
    saveDatabase();
    return post;
  },

  // Platform Analytics & Stats
  getStats: (): PlatformStats => {
    const totalUsers = state.users.length;
    const totalAds = state.ads.length;
    const activeAds = state.ads.filter(a => a.status === 'Active').length;
    
    // Simulate some financial metrics based on packages selected
    let totalRevenue = 14500; // base seed revenue
    let totalTransactions = 54;
    
    // Calculate page views, clicks, favorites across all ads
    const viewsCount = state.ads.reduce((acc, ad) => acc + ad.views, 0);
    const clicksCount = state.ads.reduce((acc, ad) => acc + ad.clicks, 0);
    const favoritesCount = state.favorites.length;

    return {
      totalUsers,
      totalAds,
      activeAds,
      totalRevenue,
      totalTransactions,
      viewsCount,
      clicksCount,
      favoritesCount
    };
  }
};

// Auto-boot database on load
loadDatabase();
