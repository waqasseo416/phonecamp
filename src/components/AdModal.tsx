import React, { useState, useEffect } from 'react';
import { 
  Heart, Eye, ShieldCheck, MapPin, Phone, MessageSquare, AlertTriangle, 
  ChevronLeft, ChevronRight, Star, RefreshCw, Sparkles, Send, CheckCircle, ArrowLeft 
} from 'lucide-react';
import { api } from '../lib/api';
import { Ad, User, Review } from '../types';

interface AdModalProps {
  adId: string;
  currentUser: User | null;
  onClose: () => void;
  onToggleFavorite: (adId: string) => void;
  isFavorited: boolean;
  onInitiateChat: (roomId: string) => void;
}

export default function AdModal({ 
  adId, 
  currentUser, 
  onClose, 
  onToggleFavorite, 
  isFavorited,
  onInitiateChat 
}: AdModalProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  
  // Contacts revealing states
  const [showPhone, setShowPhone] = useState(false);
  const [showWhatsapp, setShowWhatsapp] = useState(false);

  // Spam reporting form states
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('Spam');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');

  // Seller reviews states
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);

  useEffect(() => {
    loadAdDetail();
  }, [adId]);

  const loadAdDetail = async () => {
    setLoading(true);
    try {
      const data = await api.getAdDetail(adId, false); // Fetch and increment views count automatically
      setAd(data.ad);
      setSeller(data.seller);
      
      // Load all reviews matching this seller
      const allAds = await api.getAds();
      const matchSeller = data.seller;
      if (matchSeller && matchSeller.reviews) {
        setReviewsList(matchSeller.reviews);
      }
    } catch (err) {
      console.error('Failed to load ad detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevealContact = async (type: 'phone' | 'whatsapp') => {
    if (type === 'phone') setShowPhone(true);
    if (type === 'whatsapp') setShowWhatsapp(true);

    // Call API with incClick flag to log buyer engagement stats
    try {
      await api.getAdDetail(adId, true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLodgeReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !ad) {
      alert('Please login to lodge report flags.');
      return;
    }

    try {
      await api.reportAd(ad.id, currentUser.id, reportReason, reportDescription);
      setReportSuccess('Thank you. The report flag has been successfully filed in the Admin Desk.');
      setReportDescription('');
      setTimeout(() => {
        setShowReportForm(false);
        setReportSuccess('');
      }, 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublishReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !ad) {
      alert('Please login to submit review stars.');
      return;
    }
    setSubmittingReview(true);
    try {
      const rev = await api.postReview(ad.id, currentUser.id, rating, reviewText);
      setReviewsList(prev => [rev, ...prev]);
      setReviewText('');
      setRating(5);
      
      // Reload seller score details
      const updateData = await api.getAdDetail(adId, false);
      setSeller(updateData.seller);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCommenceChat = async () => {
    if (!currentUser || !ad) {
      alert('Please join or login to start secure negotiations.');
      return;
    }
    if (currentUser.id === ad.userId) {
      alert("This classified ad belongs to your own studio!");
      return;
    }

    try {
      const room = await api.getOrCreateRoom(ad.id, currentUser.id, ad.userId);
      onInitiateChat(room.id);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-32 text-center text-gray-400">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2.5" />
        <span className="text-sm">Retrieving classified ad parameters...</span>
      </div>
    );
  }

  if (!ad || !seller) {
    return (
      <div className="w-full max-w-4xl mx-auto py-20 text-center text-gray-400">
        <p className="text-sm">This classified listing is no longer available or was removed by administrators.</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 text-left animate-slide-up">
      
      {/* Back button */}
      <button 
        onClick={onClose}
        className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-gray-150 hover:bg-white bg-gray-50 text-xs font-bold text-gray-600 mb-6 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Grid</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Visuals & Description */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Cover/Carousel */}
          <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm relative aspect-[4/3] group">
            <img 
              src={ad.images[activeImageIdx]} 
              alt={ad.title} 
              className="w-full h-full object-cover" 
            />

            {/* Carousels navigation */}
            {ad.images.length > 1 && (
              <>
                <button 
                  onClick={() => setActiveImageIdx(prev => (prev === 0 ? ad.images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black text-white transition-colors"
                >
                  <ChevronLeft className="w-4.5 h-4.5" />
                </button>
                <button 
                  onClick={() => setActiveImageIdx(prev => (prev === ad.images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black text-white transition-colors"
                >
                  <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </>
            )}

            {/* Carousel index pills */}
            <div className="absolute bottom-4 inset-x-0 flex justify-center space-x-1.5">
              {ad.images.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === activeImageIdx ? 'bg-white w-4' : 'bg-white/55'}`}
                />
              ))}
            </div>
          </div>

          {/* Ad Description Card */}
          <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-4">
            <h3 className="font-display font-black text-lg text-gray-950">Overview & Parameters</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
              {ad.description}
            </p>

            {/* Specifications Details Grid */}
            <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="block text-[10px] text-gray-400 uppercase font-mono tracking-wider font-bold">CONDITION</span>
                <span className="font-bold text-gray-800 mt-1 block">{ad.condition}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="block text-[10px] text-gray-400 uppercase font-mono tracking-wider font-bold">NEGOTIABLE</span>
                <span className="font-bold text-gray-800 mt-1 block">{ad.isNegotiable ? 'Negotiable Deal' : 'Firm Price Only'}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="block text-[10px] text-gray-400 uppercase font-mono tracking-wider font-bold">NICHE CATEGORY</span>
                <span className="font-bold text-gray-800 mt-1 block">{ad.subcategory}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="block text-[10px] text-gray-400 uppercase font-mono tracking-wider font-bold">REGULAR DATES</span>
                <span className="font-bold text-gray-800 mt-1 block">{new Date(ad.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Video tour slot */}
          {ad.videoUrl && (
            <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm">
              <h3 className="font-display font-black text-lg text-gray-950 mb-3">Walkthrough Tour Video</h3>
              <p className="text-xs text-gray-400 mb-3">The seller provided a walkthrough tour link:</p>
              <a 
                href={ad.videoUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs font-bold text-blue-600 hover:underline flex items-center space-x-1"
              >
                <span>{ad.videoUrl}</span>
              </a>
            </div>
          )}

          {/* Seller Feedback & Ratings Reviews System */}
          <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-5">
            <h3 className="font-display font-black text-lg text-gray-900">Seller Feedback & Reviews</h3>

            {/* Post Review Form */}
            {currentUser ? (
              <form onSubmit={handlePublishReview} className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="block text-xs font-bold text-gray-700">Submit Seller Feedback stars</span>
                
                <div className="flex items-center space-x-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-5.5 h-5.5 ${star <= rating ? 'fill-amber-400' : ''}`} />
                    </button>
                  ))}
                </div>

                <textarea
                  rows={2}
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details on payment security, punctuality, communication..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:border-blue-500 outline-none"
                />

                <div className="flex justify-end">
                  <button 
                    type="submit"
                    disabled={submittingReview || !reviewText.trim()}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {submittingReview ? 'Publishing...' : 'Publish Feedback'}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-gray-400 bg-blue-50/50 p-3.5 rounded-xl">Please join or login to write star feedback reviews on sellers.</p>
            )}

            {/* Reviews list */}
            <div className="divide-y divide-gray-100 space-y-4">
              {reviewsList.length === 0 ? (
                <p className="text-xs text-gray-400 pt-3">No star reviews received yet. Be the first to review this seller!</p>
              ) : (
                reviewsList.map((rev) => (
                  <div key={rev.id} className="pt-4 first:pt-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img src={rev.reviewerAvatar} alt={rev.reviewerName} className="w-7 h-7 rounded-full object-cover bg-gray-100" />
                        <span className="text-xs font-bold text-gray-800">{rev.reviewerName}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center space-x-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>

                    <p className="text-xs text-gray-600 italic">
                      "{rev.text}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right column: Capital & Contact Cards */}
        <div className="space-y-6">
          
          {/* Ad Meta summary card */}
          <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-5 text-center">
            
            <div className="text-left">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block font-bold">ESTIMATED VALUATION</span>
              <span className="font-display font-black text-3xl text-gray-900 block mt-1.5">
                {ad.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
              </span>
              <span className="text-[10px] text-blue-600 font-bold block mt-1 font-mono uppercase">
                {ad.isNegotiable ? '✓ Negotiable deal' : '✓ Firm Capital'}
              </span>
            </div>

            {/* Dynamic visual tag for promoted state */}
            {['Featured', 'Premium'].includes(ad.packageType) && (
              <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-orange-100 flex items-center space-x-2 text-left">
                <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                <span className="text-[10px] font-bold text-orange-800 leading-tight">
                  This classified listing has been highlighted as an elite {ad.packageType} choice.
                </span>
              </div>
            )}

            {/* Action triggers */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              
              {/* Message Seller */}
              <button
                onClick={handleCommenceChat}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-4.5 h-4.5" />
                <span>Start Secure Chat</span>
              </button>

              {/* Reveal Phone */}
              <button
                onClick={() => handleRevealContact('phone')}
                className="w-full py-3.5 bg-white border border-gray-250 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2"
              >
                <Phone className="w-4.5 h-4.5 text-blue-600" />
                <span>{showPhone ? ad.phone : 'Reveal Phone Number'}</span>
              </button>

              {/* WhatsApp Contact */}
              <button
                onClick={() => handleRevealContact('whatsapp')}
                className="w-full py-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-4.5 h-4.5 text-emerald-600" />
                <span>{showWhatsapp ? ad.whatsapp : 'Reveal WhatsApp Contact'}</span>
              </button>

              {/* Bookmark Toggle */}
              <button 
                onClick={() => onToggleFavorite(ad.id)}
                className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${isFavorited ? 'bg-red-50 border-red-100 text-red-600' : 'bg-white border-gray-200 text-gray-500 hover:text-gray-800'}`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{isFavorited ? 'Remove Wishlist' : 'Save to Wishlist'}</span>
              </button>

            </div>

          </div>

          {/* Seller Bio Card */}
          <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-4">
            <h4 className="font-display font-black text-sm text-gray-900 uppercase tracking-wide">Listing Publisher</h4>

            <div className="flex items-center space-x-3">
              <img src={seller.avatar} alt={seller.name} className="w-12 h-12 rounded-xl object-cover border border-gray-150 bg-gray-50" />
              <div>
                <div className="flex items-center space-x-1">
                  <span className="font-display font-bold text-sm text-gray-900">{seller.gender === 'Mr' ? 'Mr.' : 'Mrs.'} {seller.name}</span>
                  {seller.isVerified && (
                    <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500" />
                  )}
                </div>
                <span className="text-[10px] text-gray-400 font-mono block">Verified Seller Hub</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed italic font-sans">
              "{seller.bio || 'Professional classified merchant on the Velo Network.'}"
            </p>

            {/* Seller micro score */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-400 font-mono">SELLER INDEX</span>
              <div className="flex items-center space-x-1 font-bold text-gray-800">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{seller.rating.toFixed(1)} / 5.0</span>
              </div>
            </div>
          </div>

          {/* Spam / Violation Flagging Form */}
          <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-3">
            <button 
              onClick={() => setShowReportForm(!showReportForm)}
              className="w-full text-left font-display font-black text-xs text-gray-500 uppercase tracking-wider flex items-center justify-between"
            >
              <span>Flag Listing violations</span>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </button>

            {showReportForm && (
              <form onSubmit={handleLodgeReport} className="space-y-3 pt-3 border-t border-gray-100 animate-fade-in">
                
                {reportSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-[11px] leading-relaxed font-semibold">
                    {reportSuccess}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Reason for Flagging</label>
                  <select 
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-2 rounded-lg border border-gray-250 text-xs bg-white"
                  >
                    <option value="Spam">Spam / Excessive Duplicate</option>
                    <option value="Fraud">Fraudulent / Misleading pricing</option>
                    <option value="Bold">Naked / Bold pictures uploaded</option>
                    <option value="Other">Other violation parameters</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Detailed description</label>
                  <textarea 
                    rows={2}
                    required
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Provide details to assist administrators..." 
                    className="w-full p-2.5 rounded-lg border border-gray-200 text-xs"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
                >
                  Lodge Spam Flag
                </button>
              </form>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
