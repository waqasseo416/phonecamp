import React, { useState, useEffect } from 'react';
import { 
  Eye, RefreshCw, Trash2, Edit3, Settings, Shield, User, MapPin, 
  Phone, Globe, Sparkles, MessageSquare, Heart, CheckCircle, Save, Loader2 
} from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { Ad, User as UserType } from '../types';

interface SellerDashboardProps {
  currentUser: UserType | null;
  onProfileUpdated: (updatedUser: UserType) => void;
  onViewChange: (view: string) => void;
}

export default function SellerDashboard({ 
  currentUser, 
  onProfileUpdated,
  onViewChange 
}: SellerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'listings' | 'profile'>('listings');
  const [userAds, setUserAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);
  const [renewingId, setRenewingId] = useState<string | null>(null);

  // Profile Edit fields
  const [name, setName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [whatsapp, setWhatsapp] = useState(currentUser?.whatsapp || '');
  const [gender, setGender] = useState<'Mr' | 'Mrs'>(currentUser?.gender || 'Mr');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [cover, setCover] = useState(currentUser?.cover || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadUserAds();
    }
  }, [currentUser]);

  const loadUserAds = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const all = await api.getAds();
      const filtered = all.filter(ad => ad.userId === currentUser.id);
      setUserAds(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRenewAd = async (adId: string) => {
    setRenewingId(adId);
    try {
      // Renewing updates the post date to now, shifting the listing to the top of "newest" sorting!
      await api.updateAd(adId, { createdAt: new Date().toISOString() });
      await loadUserAds();
    } catch (err) {
      console.error(err);
    } finally {
      setRenewingId(null);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this listing? This operation is irreversible.')) return;
    try {
      await api.deleteAd(adId);
      setUserAds(prev => prev.filter(ad => ad.id !== adId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setUpdatingProfile(true);
    setSaveSuccess(false);

    try {
      const updated = await api.updateProfile({
        userId: currentUser.id,
        name,
        bio,
        phone,
        whatsapp,
        gender,
        avatar,
        cover,
      });
      onProfileUpdated(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Aggregated traffic analytics
  const totalViews = userAds.reduce((sum, ad) => sum + ad.views, 0);
  const totalClicks = userAds.reduce((sum, ad) => sum + ad.clicks, 0);
  const totalFavorites = userAds.reduce((sum, ad) => sum + ad.favorites, 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      
      {/* Seller Header Canvas */}
      <div className="relative rounded-3xl overflow-hidden border border-gray-150 shadow-sm bg-white mb-8">
        <div className="h-44 bg-gray-100 relative">
          <img 
            src={currentUser?.cover || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200"} 
            alt="cover decoration" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        <div className="px-6 pb-6 relative flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-10 gap-4">
          <div className="flex items-end space-x-4">
            <img 
              src={currentUser?.avatar} 
              alt={currentUser?.name} 
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-md shrink-0 bg-white" 
            />
            <div className="pb-2">
              <div className="flex items-center space-x-1.5">
                <h2 className="font-display font-black text-2xl text-gray-900 leading-none">
                  {currentUser?.gender === 'Mr' ? 'Mr.' : 'Mrs.'} {currentUser?.name}
                </h2>
                {currentUser?.isVerified && (
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-[10px] font-extrabold text-blue-700 uppercase tracking-widest flex items-center space-x-0.5">
                    <CheckCircle className="w-3 h-3 text-blue-600 fill-blue-600" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400 block mt-1 font-mono">@{currentUser?.username} • Member since 2026</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 pb-2">
            <button 
              onClick={() => onViewChange('create-ad')}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/10 active:scale-95 cursor-pointer"
            >
              Post New Classified
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Classifieds', val: userAds.length, color: 'text-blue-600', desc: 'Active Listings' },
          { label: 'Classified Views', val: totalViews, color: 'text-emerald-600', desc: 'Unique page impressions' },
          { label: 'Buyer Contacts / Clicks', val: totalClicks, color: 'text-amber-600', desc: 'Contact visualisations' },
          { label: 'Wishlist Bookmarks', val: totalFavorites, color: 'text-rose-600', desc: 'Saves for future trading' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm text-left select-none">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">{item.label}</span>
            <span className={`block font-display font-black text-3xl my-2 ${item.color}`}>
              {item.val}
            </span>
            <span className="text-[10px] text-gray-400 leading-none block">{item.desc}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-150 mb-6 font-display font-bold text-sm">
        <button 
          onClick={() => setActiveTab('listings')}
          className={`pb-3.5 px-4 border-b-2 transition-all relative ${activeTab === 'listings' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
        >
          My Classified Listings
          {userAds.length > 0 && (
            <span className="ml-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-[10px] font-bold text-blue-600">
              {userAds.length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`pb-3.5 px-4 border-b-2 transition-all relative ${activeTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
        >
          Studio Settings
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'listings' ? (
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
              <span className="text-sm">Accessing listings databases...</span>
            </div>
          ) : userAds.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-150 p-12 text-center text-gray-400 select-none">
              <Trash2 className="w-10 h-10 mx-auto mb-3 opacity-30 text-gray-400" />
              <h4 className="font-display font-bold text-gray-800 text-sm">No Listings in this Studio</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                You haven't posted any classified ads yet. Publish your first item to begin tracking metrics!
              </p>
              <button 
                onClick={() => onViewChange('create-ad')}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 select-none"
              >
                Create First Ad
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm divide-y divide-gray-100">
              {userAds.map((ad) => (
                <div key={ad.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left hover:bg-gray-50/40 transition-colors select-none">
                  <div className="flex items-center space-x-4">
                    <img src={ad.images[0]} alt={ad.title} className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-100 bg-gray-50" />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-[9px] font-bold text-gray-500 uppercase tracking-wider">{ad.subcategory}</span>
                        {['Premium', 'Featured'].includes(ad.packageType) && (
                          <span className="px-2 py-0.5 rounded bg-orange-100 text-[9px] font-extrabold text-orange-700 uppercase tracking-widest flex items-center space-x-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>{ad.packageType}</span>
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${ad.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {ad.status}
                        </span>
                      </div>
                      <h4 className="font-display font-extrabold text-base text-gray-900 mt-1 line-clamp-1">{ad.title}</h4>
                      <span className="text-xs text-gray-400 font-mono mt-0.5 block">Price: ${ad.price.toLocaleString()} • Posted {new Date(ad.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    
                    {/* Quick Analytics badge */}
                    <div className="hidden lg:flex items-center space-x-4 text-xs font-mono text-gray-400 mr-4">
                      <div className="flex items-center space-x-1"><Eye className="w-3.5 h-3.5" /> <span>{ad.views}</span></div>
                      <div className="flex items-center space-x-1"><MessageSquare className="w-3.5 h-3.5" /> <span>{ad.clicks}</span></div>
                    </div>

                    {/* Renew Listing Button - Pushes creation date forward to rank higher */}
                    <button
                      onClick={() => handleRenewAd(ad.id)}
                      disabled={renewingId === ad.id}
                      className="p-2 rounded-xl border border-gray-150 hover:bg-gray-50 text-gray-600 hover:text-blue-600 transition-all active:scale-95 flex items-center space-x-1 text-xs font-bold"
                      title="Bump ad to the top of search listings"
                    >
                      <RefreshCw className={`w-4 h-4 ${renewingId === ad.id ? 'animate-spin text-blue-500' : ''}`} />
                      <span className="hidden sm:inline">Bump Listing</span>
                    </button>

                    <button
                      onClick={() => handleDeleteAd(ad.id)}
                      className="p-2 rounded-xl border border-red-100 hover:bg-red-50 text-red-500 transition-colors active:scale-95"
                      title="Delete ad permanentely"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Profile Studio Editing Settings */
        <form onSubmit={handleUpdateProfile} className="bg-white rounded-2xl border border-gray-150 p-7 shadow-sm space-y-5 text-left">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-display font-extrabold text-lg text-gray-900">Studio & Profile Settings</h3>
            <p className="text-xs text-gray-400 mt-0.5">Customize your verified seller brand identity.</p>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-semibold">
              Profile details successfully written to dbStore.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Prefix Salutation</label>
              <select 
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm bg-white"
              >
                <option value="Mr">Mr. (Salutation)</option>
                <option value="Mrs">Mrs. (Salutation)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Display Brand Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Bio / Description Statement</label>
            <textarea 
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Authorized luxury broker with over 15 years experience..." 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Voice Contact Phone</label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">WhatsApp Link Number</label>
              <input 
                type="text" 
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Avatar Image URL</label>
              <input 
                type="text" 
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Studio Cover Wallpaper URL</label>
              <input 
                type="text" 
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={updatingProfile}
              className="flex items-center space-x-1.5 px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 active:scale-98 cursor-pointer select-none"
            >
              {updatingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Studio Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
