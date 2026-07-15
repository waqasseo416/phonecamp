import express from "express";
import * as path from "path";
import { dbStore } from "./src/dbStore";
import { GoogleGenAI, Type } from "@google/genai";
import { UserRole, Ad, AdStatus, AdCondition, PackageType } from "./src/types";

// Lazy-loaded Gemini AI client helper to prevent crash on startup if key is missing
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

export function createExpressApp() {
  const app = express();

  // Middleware for body parsing and static resources
  app.use(express.json({ limit: "50mb" }));

  // Dynamic API Logs or simulation middleware
  app.use((req, res, next) => {
    // Basic audit logger
    if (req.path.startsWith("/api")) {
      console.log(`[API ${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
  });

  // ==========================================
  // AUTHENTICATION ENDPOINTS
  // ==========================================

  // Login
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = dbStore.verifyCredentials(email, password);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Return authenticated user along with simulated token
    res.json({
      token: `simulated-jwt-${user.id}-${Date.now()}`,
      user,
    });
  });

  // Register
  app.post("/api/auth/register", (req, res) => {
    const { name, email, password, phone, whatsapp, gender } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    const existingUser = dbStore.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "A user with this email already exists." });
    }

    const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "_") + Math.floor(Math.random() * 100);
    
    // Automatically set the specific user email in metadata as Admin, otherwise user
    const isSpecialAdmin = email.toLowerCase() === "companyexpertbacklink@gmail.com";

    const newUser = {
      id: `user-${Date.now()}`,
      email: email.toLowerCase(),
      name,
      username,
      phone: phone || "",
      whatsapp: whatsapp || "",
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200",
      bio: "Joined the Velo Classifieds elite community.",
      role: isSpecialAdmin ? UserRole.ADMIN : UserRole.USER,
      createdAt: new Date().toISOString(),
      isVerified: isSpecialAdmin, // admin is verified out of the box
      rating: 5.0,
      reviewsCount: 0,
      socialLinks: {},
      gender: gender || "Mr",
    };

    dbStore.createUser(newUser, password);
    res.json({
      token: `simulated-jwt-${newUser.id}-${Date.now()}`,
      user: newUser,
    });
  });

  // Me (Profile retrieval)
  app.get("/api/auth/me", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const token = authHeader.split(" ")[1];
    const match = token.match(/simulated-jwt-([a-zA-Z0-9_\-]+)-/);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials token." });
    }

    const userId = match[1];
    const user = dbStore.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User profile not found." });
    }

    res.json(user);
  });

  // Profile Update
  app.post("/api/auth/update", (req, res) => {
    const { userId, name, bio, phone, whatsapp, gender, avatar, cover, socialLinks } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const updated = dbStore.updateUser(userId, {
      name,
      bio,
      phone,
      whatsapp,
      gender,
      avatar,
      cover,
      socialLinks,
    });

    if (!updated) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json(updated);
  });

  // ==========================================
  // CLASSIFIED ADS SEARCH & READ ENDPOINTS
  // ==========================================

  // List & Advanced Search with dynamic sorting
  app.get("/api/ads", (req, res) => {
    const { 
      q, 
      category, 
      subcategory, 
      city, 
      area, 
      minPrice, 
      maxPrice, 
      condition, 
      postedToday, 
      verifiedSeller, 
      promotedOnly,
      sort 
    } = req.query;

    let adsList = [...dbStore.getAds()];

    // Filtering by text query (q) - Keyword search
    if (q) {
      const searchStr = String(q).toLowerCase();
      adsList = adsList.filter(ad => 
        ad.title.toLowerCase().includes(searchStr) || 
        ad.description.toLowerCase().includes(searchStr) ||
        ad.tags.some(t => t.toLowerCase().includes(searchStr))
      );
    }

    // Filtering by category id or slug
    if (category) {
      const catIdOrSlug = String(category);
      const categories = dbStore.getCategories();
      const matchCat = categories.find(c => c.id === catIdOrSlug || c.slug === catIdOrSlug);
      if (matchCat) {
        adsList = adsList.filter(ad => ad.categoryId === matchCat.id);
      }
    }

    // Subcategory
    if (subcategory) {
      const sub = String(subcategory).toLowerCase();
      adsList = adsList.filter(ad => ad.subcategory.toLowerCase() === sub);
    }

    // Location: City & Area
    if (city) {
      const c = String(city).toLowerCase();
      adsList = adsList.filter(ad => ad.city.toLowerCase() === c);
    }
    if (area) {
      const a = String(area).toLowerCase();
      adsList = adsList.filter(ad => ad.area.toLowerCase() === a);
    }

    // Price Bounds
    if (minPrice) {
      adsList = adsList.filter(ad => ad.price >= Number(minPrice));
    }
    if (maxPrice) {
      adsList = adsList.filter(ad => ad.price <= Number(maxPrice));
    }

    // Condition
    if (condition) {
      const cond = String(condition);
      adsList = adsList.filter(ad => ad.condition === cond);
    }

    // Posted Today (last 24 hours)
    if (postedToday === "true") {
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
      adsList = adsList.filter(ad => new Date(ad.createdAt).getTime() >= dayAgo);
    }

    // Verified Seller filtering
    if (verifiedSeller === "true") {
      const users = dbStore.getUsers();
      adsList = adsList.filter(ad => {
        const seller = users.find(u => u.id === ad.userId);
        return seller ? seller.isVerified : false;
      });
    }

    // Promoted Ads filtering
    if (promotedOnly === "true") {
      adsList = adsList.filter(ad => ad.isPromoted);
    }

    // Sorting Logic
    if (sort) {
      switch (String(sort)) {
        case "newest":
          adsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case "oldest":
          adsList.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case "price_low":
          adsList.sort((a, b) => a.price - b.price);
          break;
        case "price_high":
          adsList.sort((a, b) => b.price - a.price);
          break;
        default:
          // Default sorting has promoted ads showing first, then newest
          adsList.sort((a, b) => {
            if (a.isPromoted && !b.isPromoted) return -1;
            if (!a.isPromoted && b.isPromoted) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
      }
    } else {
      // Default: Promoted first, then newest
      adsList.sort((a, b) => {
        if (a.isPromoted && !b.isPromoted) return -1;
        if (!a.isPromoted && b.isPromoted) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    res.json(adsList);
  });

  // Get single ad detail & Increment Stats (Views & Clicks)
  app.get("/api/ads/:id", (req, res) => {
    const { id } = req.params;
    const { incClick } = req.query; // query parameter if user clicked "View Phone/Website"

    const ad = dbStore.getAdById(id);
    if (!ad) {
      return res.status(404).json({ error: "Classified listing not found." });
    }

    // Increment Metrics
    if (incClick === "true") {
      ad.clicks += 1;
    } else {
      ad.views += 1;
    }
    dbStore.sync();

    // Get seller details
    const seller = dbStore.getUserById(ad.userId);

    res.json({
      ad,
      seller,
    });
  });

  // Toggle favorite bookmark
  app.post("/api/ads/:id/toggle-favorite", (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const isFav = dbStore.toggleFavorite(userId, id);
    const ad = dbStore.getAdById(id);
    if (ad) {
      ad.favorites += isFav ? 1 : -1;
      if (ad.favorites < 0) ad.favorites = 0;
      dbStore.sync();
    }

    res.json({ isFavorite: isFav, count: ad ? ad.favorites : 0 });
  });

  // Create new classified ad
  app.post("/api/ads/create", (req, res) => {
    const {
      userId,
      categoryId,
      subcategory,
      title,
      description,
      price,
      isNegotiable,
      condition,
      city,
      area,
      phone,
      whatsapp,
      email,
      images,
      videoUrl,
      packageType,
      tags,
      scheduledAt
    } = req.body;

    if (!userId || !categoryId || !title || !description || price === undefined) {
      return res.status(400).json({ error: "Missing required listing fields." });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "-") + "-" + Math.floor(Math.random() * 10000);

    const isPremium = ['Featured', 'Premium', 'Top', 'Highlight'].includes(packageType);

    const newAd: Ad = {
      id: `ad-${Date.now()}`,
      userId,
      categoryId,
      subcategory: subcategory || "General",
      title,
      slug,
      description,
      price: Number(price),
      isNegotiable: !!isNegotiable,
      condition: condition || 'Good',
      city: city || 'Unknown',
      area: area || 'Downtown',
      phone: phone || '',
      whatsapp: whatsapp || '',
      email: email || '',
      images: images && images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800' // fallback item image
      ],
      videoUrl: videoUrl || "",
      packageType: packageType || 'Free',
      // Ads that select a paid bundle are pending review (as shown in the confirmation flow screenshot), free are approved instantly
      status: isPremium ? 'Pending' : 'Active',
      views: 0,
      clicks: 0,
      favorites: 0,
      createdAt: new Date().toISOString(),
      tags: tags || [],
      isPromoted: isPremium,
      featuredDays: packageType === 'Premium' ? 30 : (packageType === 'Featured' ? 14 : 7),
      scheduledAt: scheduledAt || undefined
    };

    dbStore.createAd(newAd);
    res.json(newAd);
  });

  // Update classified ad
  app.put("/api/ads/:id", (req, res) => {
    const { id } = req.params;
    const updated = dbStore.updateAd(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Ad not found." });
    }
    res.json(updated);
  });

  // Delete ad
  app.delete("/api/ads/:id", (req, res) => {
    const { id } = req.params;
    const success = dbStore.deleteAd(id);
    if (!success) {
      return res.status(404).json({ error: "Ad listing not found." });
    }
    res.json({ success: true, message: "Listing deleted successfully." });
  });

  // Post dynamic reviews on sellers
  app.post("/api/ads/:id/review", (req, res) => {
    const { id } = req.params;
    const { reviewerId, rating, text } = req.body;

    if (!reviewerId || !rating) {
      return res.status(400).json({ error: "Reviewer ID and rating are required." });
    }

    const ad = dbStore.getAdById(id);
    if (!ad) {
      return res.status(404).json({ error: "Listing not found." });
    }

    const reviewer = dbStore.getUserById(reviewerId);
    if (!reviewer) {
      return res.status(404).json({ error: "Reviewer account not found." });
    }

    const newReview = {
      id: `rev-${Date.now()}`,
      adId: id,
      reviewerId,
      reviewerName: reviewer.name,
      reviewerAvatar: reviewer.avatar,
      sellerId: ad.userId,
      rating: Number(rating),
      text: text || "",
      createdAt: new Date().toISOString(),
    };

    dbStore.createReview(newReview);
    res.json(newReview);
  });

  // ==========================================
  // REAL-TIME-LIKE CHAT & MESSAGING
  // ==========================================

  // Get active rooms for user
  app.get("/api/chat/rooms", (req, res) => {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const rooms = dbStore.getRoomsByUser(String(userId));
    const ads = dbStore.getAds();
    const users = dbStore.getUsers();

    // Map rich relationship details for rooms
    const richRooms = rooms.map(room => {
      const ad = ads.find(a => a.id === room.adId);
      const buyer = users.find(u => u.id === room.buyerId);
      const seller = users.find(u => u.id === room.sellerId);
      const messages = dbStore.getRoomMessages(room.id);
      const unreadCount = messages.filter(m => m.senderId !== userId && !m.isRead).length;

      return {
        ...room,
        ad,
        buyer,
        seller,
        unreadCount,
        lastMessage: messages[messages.length - 1] || null
      };
    });

    res.json(richRooms);
  });

  // Initiate or retrieve chat room
  app.post("/api/chat/rooms/get-or-create", (req, res) => {
    const { adId, buyerId, sellerId } = req.body;
    if (!adId || !buyerId || !sellerId) {
      return res.status(400).json({ error: "Missing room properties." });
    }

    const room = dbStore.getOrCreateRoom(adId, buyerId, sellerId);
    res.json(room);
  });

  // Get messages for a specific room
  app.get("/api/chat/rooms/:roomId/messages", (req, res) => {
    const { roomId } = req.params;
    const { userId } = req.query;

    const messages = dbStore.getRoomMessages(roomId);
    
    // Auto-mark room as read
    if (userId) {
      dbStore.markRoomRead(roomId, String(userId));
    }

    res.json(messages);
  });

  // Send message
  app.post("/api/chat/rooms/:roomId/messages", (req, res) => {
    const { roomId } = req.params;
    const { senderId, text, image, emoji } = req.body;

    if (!senderId) {
      return res.status(400).json({ error: "Sender ID is required." });
    }

    const newMessage = {
      id: `msg-${Date.now()}`,
      chatRoomId: roomId,
      senderId,
      text: text || "",
      image,
      emoji,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    dbStore.addMessage(newMessage);
    res.json(newMessage);
  });

  // ==========================================
  // COUPONS, FINANCE, REPORTS & CATEGORIES
  // ==========================================

  // List all categories
  app.get("/api/categories", (req, res) => {
    res.json(dbStore.getCategories());
  });

  // Validate Discount Coupon
  app.post("/api/coupons/validate", (req, res) => {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Coupon code is required." });
    }

    const coupon = dbStore.getCouponByCode(code);
    if (!coupon) {
      return res.status(404).json({ error: "Invalid, expired, or non-existent coupon." });
    }

    res.json(coupon);
  });

  // Report spam or violation
  app.post("/api/reports/create", (req, res) => {
    const { adId, reporterId, reason, description } = req.body;
    if (!adId || !reporterId || !reason) {
      return res.status(400).json({ error: "Missing required reporting properties." });
    }

    const ad = dbStore.getAdById(adId);
    if (!ad) {
      return res.status(404).json({ error: "Listing not found." });
    }

    const reporter = dbStore.getUserById(reporterId);
    if (!reporter) {
      return res.status(404).json({ error: "Reporter not found." });
    }

    const newReport = {
      id: `rep-${Date.now()}`,
      adId,
      adTitle: ad.title,
      reporterId,
      reporterName: reporter.name,
      reason,
      description: description || "",
      status: 'Pending' as const,
      createdAt: new Date().toISOString(),
    };

    dbStore.createReport(newReport);
    res.json(newReport);
  });

  // Blogs retrieve
  app.get("/api/blogs", (req, res) => {
    res.json(dbStore.getBlogs());
  });

  app.get("/api/blogs/:slug", (req, res) => {
    const blog = dbStore.getBlogBySlug(req.params.slug);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found." });
    }
    res.json(blog);
  });

  // ==========================================
  // ADMINISTRATION CONTROL ENDPOINTS
  // ==========================================

  // Get Admin statistics
  app.get("/api/admin/stats", (req, res) => {
    res.json(dbStore.getStats());
  });

  // List all spam reports
  app.get("/api/admin/reports", (req, res) => {
    res.json(dbStore.getReports());
  });

  // Moderate reports status
  app.post("/api/admin/reports/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // Pending, Reviewed, Resolved

    const updated = dbStore.updateReportStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: "Report not found." });
    }

    res.json(updated);
  });

  // Approve or reject pending premium classified ads
  app.post("/api/admin/ads/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // Active, Rejected, Expired

    const ad = dbStore.getAdById(id);
    if (!ad) {
      return res.status(404).json({ error: "Ad not found." });
    }

    ad.status = status;
    dbStore.sync();

    res.json(ad);
  });

  // ==========================================
  // GEMINI AI SMART OPTIMIZATION
  // ==========================================

  // Auto SEO optimizer using Gemini
  app.post("/api/gemini/optimize-seo", async (req, res) => {
    const { title, category, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Listing title is required." });
    }

    const ai = getAI();
    if (!ai) {
      // Graceful fallback if Gemini API Key is missing or invalid
      console.log("Gemini API key is not configured, providing beautiful fallback.");
      const mockTags = title.toLowerCase().split(/\s+/).filter(w => w.length > 3).slice(0, 5);
      return res.json({
        optimizedTitle: `💎 Pristine ${title} | Certified Deal`,
        optimizedDescription: `Stunning ${title} in immaculate condition. ${description || "Carefully curated and fully verified listing."} Excellent pricing. Fully backed by Velo Elite Buyer Protection. Contact today for viewings and secure checkout.`,
        suggestedTags: [...mockTags, "premium", "luxury", "classifieds"],
        seoScore: 98,
        metaDescription: `Discover this incredible ${title}. High-end luxury classified listing at an outstanding value. Click to view pictures, chats, and seller reviews.`,
      });
    }

    try {
      const prompt = `You are a high-end Luxury SEO Expert, Copywriter, and Classified Ad Optimizer.
Analyze the following classified ad details:
Title: "${title}"
Category: "${category || "General"}"
Original Description: "${description || ""}"

Improve this classified ad for maximum Google Search ranking and premium SaaS marketplace appeal.
Return a clean JSON object containing EXACTLY:
1. "optimizedTitle": a high-impact, professional title (under 60 characters).
2. "optimizedDescription": a beautiful, premium, comprehensive product/service description containing a list of rich bullet features, why buy this, and safe payment highlights.
3. "suggestedTags": an array of 5 to 8 highly relevant organic SEO tags.
4. "seoScore": an integer from 90 to 100 representing the estimated ranking potential.
5. "metaDescription": a short 140-character meta summary perfect for Google ranking.

Respond in pure JSON conform to this schema, without any backticks, markdown, or text wrapping.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              optimizedTitle: { type: Type.STRING },
              optimizedDescription: { type: Type.STRING },
              suggestedTags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              seoScore: { type: Type.INTEGER },
              metaDescription: { type: Type.STRING },
            },
            required: ["optimizedTitle", "optimizedDescription", "suggestedTags", "seoScore", "metaDescription"],
          },
        },
      });

      const data = JSON.parse(response.text?.trim() || "{}");
      res.json(data);
    } catch (error) {
      console.error("Gemini optimization error:", error);
      res.status(500).json({ error: "AI Optimization failed, utilizing server engine fallback." });
    }
  });

  return app;
}

async function startServer() {
  const app = createExpressApp();
  const PORT = 3000;

  // ==========================================
  // VITE DEV OR STATIC SITE SERVING
  // ==========================================

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started and running on http://localhost:${PORT}`);
  });
}

// Automatically start server unless running in serverless environment
if (!process.env.NETLIFY && process.env.NODE_ENV !== "test") {
  startServer().catch((err) => {
    console.error("Critical: Express Server boot crashed:", err);
  });
}
