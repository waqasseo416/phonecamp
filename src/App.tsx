import React, { useState, useEffect } from 'react';
import { 
  Search, SlidersHorizontal, LayoutGrid, Heart, Sparkles, ShieldCheck, 
  MapPin, Phone, MessageSquare, MessageCircle, Plus, RefreshCw, X, ChevronRight, Check, BookOpen 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from './lib/api';
import { Ad, Category, User, UserRole } from './types';

// Import our custom modular sub-components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdCard from './components/AdCard';
import CategoryList from './components/CategoryList';
import AdModal from './components/AdModal';
import MessagePanel from './components/MessagePanel';
import AdCreatorFlow from './components/AdCreatorFlow';
import SellerDashboard from './components/SellerDashboard';
import AdminPanel from './components/AdminPanel';
import BlogPage from './components/BlogPage';

export default function App() {
  // Authentication & session management states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // App navigation state
  // views: 'home', 'create-ad', 'chat', 'dashboard', 'admin', 'blogs', 'ad-detail'
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<string | null>(null);
  const [showWhatsAppWidget, setShowWhatsAppWidget] = useState(false);

  // Classified Ads Data & Search Filters
  const [categories, setCategories] = useState<Category[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loadingAds, setLoadingAds] = useState(false);
  
  // Active search parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  
  // Advanced filters accordion toggle
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filterCity, setFilterCity] = useState('');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [filterPostedToday, setFilterPostedToday] = useState(false);
  const [filterVerifiedSeller, setFilterVerifiedSeller] = useState(false);
  const [filterPromotedOnly, setFilterPromotedOnly] = useState(false);
  const [filterSort, setFilterSort] = useState('default');

  // Wishlist/Favorites map tracking
  const [favoritesMap, setFavoritesMap] = useState<Record<string, boolean>>({});

  // Popular Suggested Cities Helper for classified searches
  const suggestedCities = ['New York', 'London', 'Dubai', 'Islamabad', 'Karachi', 'Beverly Hills'];

  // Bootstrapping initial assets
  useEffect(() => {
    // 1. Recover auth sessions if exist in localStorage
    const savedToken = localStorage.getItem('velo_token');
    const savedUser = localStorage.getItem('velo_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
    }

    // 2. Load Categories list
    api.getCategories()
      .then(data => setCategories(data))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  // Fetch classified ads whenever search query or filters change
  useEffect(() => {
    loadClassifiedAds();
  }, [
    selectedCategory,
    selectedSubcategory,
    filterCity,
    filterMinPrice,
    filterMaxPrice,
    filterCondition,
    filterPostedToday,
    filterVerifiedSeller,
    filterPromotedOnly,
    filterSort
  ]);

  // Synchronize dynamic favorites map when user logs in or ads change
  useEffect(() => {
    if (currentUser && currentUser.favorites) {
      const map: Record<string, boolean> = {};
      currentUser.favorites.forEach(id => {
        map[id] = true;
      });
      setFavoritesMap(map);
    } else {
      setFavoritesMap({});
    }
  }, [currentUser]);

  const loadClassifiedAds = async (searchKeyword?: string) => {
    setLoadingAds(true);
    try {
      const list = await api.getAds({
        q: searchKeyword !== undefined ? searchKeyword : searchQuery,
        category: selectedCategory || '',
        subcategory: selectedSubcategory || '',
        city: filterCity,
        minPrice: filterMinPrice,
        maxPrice: filterMaxPrice,
        condition: filterCondition,
        postedToday: filterPostedToday,
        verifiedSeller: filterVerifiedSeller,
        promotedOnly: filterPromotedOnly,
        sort: filterSort
      });
      setAds(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAds(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadClassifiedAds();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setFilterCity('');
    setFilterMinPrice('');
    setFilterMaxPrice('');
    setFilterCondition('');
    setFilterPostedToday(false);
    setFilterVerifiedSeller(false);
    setFilterPromotedOnly(false);
    setFilterSort('default');
    loadClassifiedAds('');
  };

  // Authentication session triggers
  const handleLoginSuccess = (user: User, userToken: string) => {
    setCurrentUser(user);
    setToken(userToken);
    localStorage.setItem('velo_token', userToken);
    localStorage.setItem('velo_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('velo_token');
    localStorage.removeItem('velo_user');
    setCurrentView('home');
  };

  const handleProfileUpdated = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('velo_user', JSON.stringify(updatedUser));
  };

  // Saved bookmark toggling
  const handleToggleFavorite = async (adId: string) => {
    if (!currentUser) {
      alert('Please join or login to save items to your wishlist!');
      return;
    }

    try {
      const res = await api.toggleFavorite(currentUser.id, adId);
      
      // Update local state map
      setFavoritesMap(prev => ({
        ...prev,
        [adId]: res.isFavorite
      }));

      // Update current user cached favorites
      const updatedFavs = res.isFavorite 
        ? [...(currentUser.favorites || []), adId]
        : (currentUser.favorites || []).filter(id => id !== adId);
      
      const updatedUser = { ...currentUser, favorites: updatedFavs };
      setCurrentUser(updatedUser);
      localStorage.setItem('velo_user', JSON.stringify(updatedUser));

      // Refresh listing views/saves count instantly
      setAds(prev => prev.map(ad => {
        if (ad.id === adId) {
          return { ...ad, favorites: res.count };
        }
        return ad;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // Custom view switching coordinator
  const handleViewChange = (view: string, id?: string) => {
    setCurrentView(view);
    if (view === 'ad-detail' && id) {
      setSelectedAdId(id);
    } else {
      setSelectedAdId(null);
    }

    if (view === 'chat' && id) {
      setSelectedChatRoomId(id);
    } else {
      setSelectedChatRoomId(null);
    }

    // Scroll to top of applet smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="velo-marketplace-root" className="min-h-screen bg-[#fafafc] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Dynamic Header Navbar */}
      <Navbar 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onLoginSuccess={handleLoginSuccess}
        onViewChange={handleViewChange}
        currentView={currentView}
      />

      {/* Main app screen router */}
      <main className="flex-grow pb-16">
        <AnimatePresence mode="wait">
          
          {/* 1. Home / Explore Ads Grid Screen */}
          {currentView === 'home' && (
            <motion.div 
              key="home-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              
              {/* Luxury Hero Search Banner */}
              <section id="hero-banner" className="relative bg-blue-600 py-12 sm:py-16 shadow-xl overflow-hidden select-none">
                {/* Background decorative glowing circles */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/3 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/3" />

                <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-6">
                  
                  {/* Tagline */}
                  <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-500/30 text-blue-100 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider border border-blue-400/30">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse shrink-0" />
                    <span>The World's Premium Classifieds Platform</span>
                  </div>

                  <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
                    Trade Elite Assets. <br />
                    <span className="text-yellow-300">With Absolute Trust.</span>
                  </h1>

                  <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mx-auto leading-relaxed font-sans font-medium opacity-90">
                    Inspired by LuxMart architecture. Experience fully automated AI copywriting, secure chat negotiation panels, and vetted listings with verified buyers.
                  </p>

                  {/* Integrated Search Bar */}
                  <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-2xl flex items-center gap-2 border border-blue-400/30">
                    <div className="flex-grow flex items-center pl-3 gap-3">
                      <Search className="w-5 h-5 text-slate-400 shrink-0" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="What premium asset, vehicle, or SaaS service are you seeking today?"
                        className="w-full py-2.5 text-slate-700 outline-none placeholder:text-slate-400 text-sm font-medium"
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 text-xs shrink-0 select-none cursor-pointer uppercase tracking-wider"
                    >
                      Search
                    </button>
                  </form>

                  {/* Suggested Cities Filters */}
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs pt-2">
                    <span className="text-blue-200 font-semibold font-mono">Suggested Regions:</span>
                    {suggestedCities.map((c) => (
                      <button 
                        key={c}
                        onClick={() => setFilterCity(c)}
                        className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                          filterCity === c 
                            ? 'bg-white text-blue-600 border-white shadow-md' 
                            : 'bg-white/10 text-white border-white/10 hover:bg-white/20 hover:border-white/20'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>

                </div>
              </section>

              {/* Arena Categories Grid Selection */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <CategoryList 
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              </section>

              {/* Advanced Filtering & Classified Grid Matrix */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                
                {/* Advanced Sliders Header Controls */}
                <div className="bg-white rounded-2xl border border-gray-150 p-4.5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm select-none">
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${showAdvanced ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'}`}
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      <span>Advanced Search Filters</span>
                    </button>

                    {(selectedCategory || selectedSubcategory || filterCity || filterMinPrice || filterMaxPrice || filterCondition || filterVerifiedSeller || filterPromotedOnly) && (
                      <button 
                        onClick={handleResetFilters}
                        className="text-xs font-bold text-red-500 hover:underline px-2"
                      >
                        Reset Search
                      </button>
                    )}
                  </div>

                  {/* Sorting matrix selection */}
                  <div className="flex items-center space-x-2 w-full md:w-auto">
                    <span className="text-xs font-mono text-gray-400 whitespace-nowrap">Sort Matrix:</span>
                    <select 
                      value={filterSort}
                      onChange={(e) => setFilterSort(e.target.value)}
                      className="text-xs font-bold px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none text-gray-700"
                    >
                      <option value="default">Promoted Boost + Newest</option>
                      <option value="newest">Just Posted (Newest)</option>
                      <option value="oldest">Historical Postings</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                    </select>
                  </div>

                </div>

                {/* Expanded Advanced Filters Accordion */}
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-white rounded-2xl border border-gray-150 p-5 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs select-none">
                        
                        {/* City Filter */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Filter by City</label>
                          <input 
                            type="text" 
                            value={filterCity}
                            onChange={(e) => setFilterCity(e.target.value)}
                            placeholder="e.g. London, Dubai" 
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-200"
                          />
                        </div>

                        {/* Price Range */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Capital Minimum ($)</label>
                          <input 
                            type="number" 
                            value={filterMinPrice}
                            onChange={(e) => setFilterMinPrice(e.target.value)}
                            placeholder="Min price" 
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-200"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Capital Maximum ($)</label>
                          <input 
                            type="number" 
                            value={filterMaxPrice}
                            onChange={(e) => setFilterMaxPrice(e.target.value)}
                            placeholder="Max price" 
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-200"
                          />
                        </div>

                        {/* Condition selection */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Asset Condition</label>
                          <select 
                            value={filterCondition}
                            onChange={(e) => setFilterCondition(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700"
                          >
                            <option value="">Any Condition</option>
                            <option value="New">Brand New only</option>
                            <option value="Like New">Like New / Mint</option>
                            <option value="Excellent">Excellent</option>
                            <option value="Good">Good</option>
                            <option value="Fair">Fair / Used</option>
                          </select>
                        </div>

                        {/* Checkboxes parameters */}
                        <div className="sm:col-span-4 pt-3 border-t border-gray-100 flex flex-wrap gap-5">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={filterVerifiedSeller}
                              onChange={(e) => setFilterVerifiedSeller(e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4" 
                            />
                            <span className="font-semibold text-gray-600">Vetted Verified Sellers only</span>
                          </label>

                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={filterPromotedOnly}
                              onChange={(e) => setFilterPromotedOnly(e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4" 
                            />
                            <span className="font-semibold text-gray-600">Promoted & Boosted listings only</span>
                          </label>

                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={filterPostedToday}
                              onChange={(e) => setFilterPostedToday(e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4" 
                            />
                            <span className="font-semibold text-gray-600">Posted in Last 24 Hours</span>
                          </label>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Active Filter Badges */}
                {(selectedCategory || selectedSubcategory || filterCity || filterMinPrice || filterMaxPrice || filterCondition || filterVerifiedSeller || filterPromotedOnly) && (
                  <div className="flex flex-wrap gap-2 text-xs select-none">
                    {selectedCategory && (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg flex items-center space-x-1 font-semibold">
                        <span>Category: {selectedCategory}</span>
                        <button onClick={() => setSelectedCategory(null)}>✕</button>
                      </span>
                    )}
                    {filterCity && (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg flex items-center space-x-1 font-semibold">
                        <span>City: {filterCity}</span>
                        <button onClick={() => setFilterCity('')}>✕</button>
                      </span>
                    )}
                    {filterMinPrice && (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg flex items-center space-x-1 font-semibold">
                        <span>Price &gt;= ${filterMinPrice}</span>
                        <button onClick={() => setFilterMinPrice('')}>✕</button>
                      </span>
                    )}
                    {filterMaxPrice && (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg flex items-center space-x-1 font-semibold">
                        <span>Price &lt;= ${filterMaxPrice}</span>
                        <button onClick={() => setFilterMaxPrice('')}>✕</button>
                      </span>
                    )}
                  </div>
                )}

                {/* Main listings Grid results */}
                {loadingAds ? (
                  <div className="py-24 text-center text-gray-400">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <span className="text-sm">Querying active marketplace matrix...</span>
                  </div>
                ) : ads.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-150 p-16 text-center text-gray-400 select-none">
                    <SlidersHorizontal className="w-10 h-10 mx-auto mb-3 opacity-35 text-gray-400" />
                    <h4 className="font-display font-bold text-gray-800 text-sm">No Classified Listings Found</h4>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                      We couldn't find any listings matching your active parameters. Try expanding your search queries or resetting search filters.
                    </p>
                    <button 
                      onClick={handleResetFilters}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 cursor-pointer"
                    >
                      Reset All Parameters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {ads.map((ad) => (
                      <AdCard 
                        key={ad.id}
                        ad={ad}
                        isFavorited={!!favoritesMap[ad.id]}
                        onToggleFavorite={(id) => { handleToggleFavorite(id); }}
                        onAdClick={(id) => handleViewChange('ad-detail', id)}
                      />
                    ))}
                  </div>
                )}

              </section>

            </motion.div>
          )}

          {/* 2. Create Ad Flow Wizard */}
          {currentView === 'create-ad' && (
            <motion.div 
              key="create-ad-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <AdCreatorFlow 
                currentUser={currentUser} 
                categories={categories}
                onAdCreated={loadClassifiedAds}
                onViewChange={handleViewChange}
              />
            </motion.div>
          )}

          {/* 3. Detailed Classified ad view */}
          {currentView === 'ad-detail' && selectedAdId && (
            <motion.div 
              key="ad-detail-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <AdModal 
                adId={selectedAdId}
                currentUser={currentUser}
                onClose={() => handleViewChange('home')}
                onToggleFavorite={handleToggleFavorite}
                isFavorited={!!favoritesMap[selectedAdId]}
                onInitiateChat={(roomId) => handleViewChange('chat', roomId)}
              />
            </motion.div>
          )}

          {/* 4. Chat Rooms Stream */}
          {currentView === 'chat' && (
            <motion.div 
              key="chat-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MessagePanel 
                currentUser={currentUser}
                initialRoomId={selectedChatRoomId}
              />
            </motion.div>
          )}

          {/* 5. Seller Studio Dashboard */}
          {currentView === 'dashboard' && (
            <motion.div 
              key="dashboard-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <SellerDashboard 
                currentUser={currentUser}
                onProfileUpdated={handleProfileUpdated}
                onViewChange={handleViewChange}
              />
            </motion.div>
          )}

          {/* 6. Administrative Command Desk */}
          {currentView === 'admin' && currentUser?.role === UserRole.ADMIN && (
            <motion.div 
              key="admin-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminPanel />
            </motion.div>
          )}

          {/* 7. Guides & Blogs Page */}
          {currentView === 'blogs' && (
            <motion.div 
              key="blogs-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <BlogPage />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Luxury Footer */}
      <Footer onViewChange={handleViewChange} />

      {/* Floating Support WhatsApp Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none">
        <AnimatePresence>
          {showWhatsAppWidget && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 mb-3 w-80 text-left overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-xs text-slate-800 uppercase tracking-wider">Velo Helpdesk</h4>
                    <span className="text-[9px] font-mono font-semibold text-emerald-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active Support Online
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowWhatsAppWidget(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-2.5">
                <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">
                  Have questions about listing premium items, verified statuses, or subscription plans? Our executive support desk is here to help!
                </p>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="block text-[8px] font-mono text-slate-400 font-bold uppercase">Official Support Number</span>
                    <span className="block text-xs font-bold text-slate-700 font-mono mt-0.5">+92 341 8417790</span>
                  </div>
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md uppercase font-sans">VETTED</span>
                </div>
              </div>

              <a
                href="https://wa.me/923418417790?text=Hello,%20I%20have%20a%20question%20about%20Velo%20Classifieds."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-100 flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-4.5 h-4.5 fill-white/10" />
                <span>Start Chat on WhatsApp</span>
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowWhatsAppWidget(!showWhatsAppWidget)}
          className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-200 hover:scale-105 active:scale-95 transition-all relative group cursor-pointer"
        >
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[8px] text-white items-center justify-center font-bold">1</span>
          </span>
          <MessageCircle className="w-6 h-6 fill-white/10" />
        </button>
      </div>

    </div>
  );
}
