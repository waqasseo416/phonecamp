import React, { useState, useEffect } from 'react';
import { 
  Check, ArrowRight, ArrowLeft, Upload, Sparkles, Shield, Tag, 
  MapPin, Phone, HelpCircle, Loader2, DollarSign, Gift, Clock, FileText, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { Category, AdCondition, PackageType } from '../types';

interface AdCreatorFlowProps {
  currentUser: any;
  categories: Category[];
  onAdCreated: () => void;
  onViewChange: (view: string) => void;
}

export default function AdCreatorFlow({ 
  currentUser, 
  categories, 
  onAdCreated,
  onViewChange 
}: AdCreatorFlowProps) {
  const [step, setStep] = useState(1);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiScore, setAiScore] = useState<number | null>(null);

  // Form States
  const [categoryId, setCategoryId] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [condition, setCondition] = useState<AdCondition>('Good');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [whatsapp, setWhatsapp] = useState(currentUser?.whatsapp || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [tagsInput, setTagsInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  
  // Package Billing States
  const [packageType, setPackageType] = useState<PackageType>('Free');
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponSuccess, setCouponSuccess] = useState('');
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-set subcategories when category changes
  const selectedCat = categories.find(c => c.id === categoryId);
  const subcategoryList = selectedCat ? selectedCat.subcategories : [];

  useEffect(() => {
    if (subcategoryList.length > 0) {
      setSubcategory(subcategoryList[0]);
    }
  }, [categoryId]);

  // Tag list helper
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagsInput.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
      if (clean && !tags.includes(clean)) {
        setTags([...tags, clean]);
        setTagsInput('');
      }
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Image Simulation Mock helper
  const handleDragDropMock = () => {
    const defaultLuxuryPlaceholders = [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=800'
    ];
    // Add one by one
    if (images.length < 5) {
      const next = defaultLuxuryPlaceholders[images.length];
      setImages([...images, next]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Coupon validator
  const handleValidateCoupon = async () => {
    if (!couponCode) return;
    setValidatingCoupon(true);
    setCouponError('');
    setCouponSuccess('');
    try {
      const result = await api.validateCoupon(couponCode);
      setDiscountPercent(result.discountPercent);
      setCouponSuccess(`Success! ${result.discountPercent}% discount applied.`);
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon.');
      setDiscountPercent(0);
    } finally {
      setValidatingCoupon(false);
    }
  };

  // AI assistant SEO autocompleter
  const handleAIEngineOptimize = async () => {
    if (!title) {
      alert('Please write an ad title first to let the AI analyze your context!');
      return;
    }
    setLoadingAI(true);
    try {
      const res = await api.optimizeAdWithAI({
        title,
        category: selectedCat?.name,
        description
      });
      setTitle(res.optimizedTitle);
      setDescription(res.optimizedDescription);
      setTags(res.suggestedTags);
      setAiScore(res.seoScore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  };

  // Calculate final billing details
  const getPackagePrice = (pkg: PackageType) => {
    switch (pkg) {
      case 'Featured': return 390;
      case 'Premium': return 590;
      case 'Top': return 790;
      case 'Highlight': return 290;
      default: return 0;
    }
  };

  const basePrice = getPackagePrice(packageType);
  const finalPrice = Math.max(0, basePrice - (basePrice * discountPercent) / 100);

  const handleSubmitAd = async () => {
    setIsSubmitting(true);
    try {
      await api.createAd({
        userId: currentUser.id,
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
        tags
      });
      setStep(4); // Advance to confirmation screen
    } catch (err) {
      console.error('Failed to register classified:', err);
      alert('Failed to register your ad. Please review parameters.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      
      {/* Progress Arrow Steps */}
      <div className="bg-white rounded-xl border border-gray-150 p-4 mb-8 flex items-center justify-between shadow-sm select-none">
        {['Ad Details', 'Photos', 'Payment', 'Finish'].map((label, idx) => {
          const currentStepIdx = idx + 1;
          const isActive = step === currentStepIdx;
          const isCompleted = step > currentStepIdx;
          return (
            <div key={idx} className="flex items-center space-x-2 flex-1 justify-center last:flex-none">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : (isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400')}`}>
                {isCompleted ? <Check className="w-4 h-4" /> : currentStepIdx}
              </div>
              <span className={`text-xs font-bold hidden sm:inline ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                {label}
              </span>
              {idx < 3 && <div className="h-0.5 bg-gray-100 flex-grow max-w-16 hidden sm:block" />}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Specifications Details */}
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl border border-gray-150 p-7 shadow-sm space-y-6"
          >
            <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="font-display font-extrabold text-xl text-gray-900">Create Classified Listing</h3>
                <p className="text-xs text-gray-400 mt-1">Specify detailed attributes to reach target luxury buyers.</p>
              </div>
              
              {/* AI Optimise Button */}
              <button 
                type="button"
                onClick={handleAIEngineOptimize}
                disabled={loadingAI}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 font-semibold text-xs transition-colors cursor-pointer"
              >
                {loadingAI ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                    <span>Optimize with AI</span>
                  </>
                )}
              </button>
            </div>

            {aiScore !== null && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle className="w-5.5 h-5.5 text-emerald-600" />
                  <div>
                    <span className="block text-xs font-bold text-emerald-800">SEO Score Autoloader Triggered</span>
                    <p className="text-[10px] text-emerald-600 mt-0.5">Your title, descriptions, tags have been optimized for Google Search ranking.</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider block">SEO INDEX</span>
                  <span className="font-display font-extrabold text-lg text-emerald-700">{aiScore}/100</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category Arena *</label>
                <select 
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm bg-white"
                >
                  <option value="">Select arena</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Niche Subcategory *</label>
                <select 
                  required
                  disabled={!categoryId}
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm bg-white disabled:opacity-50"
                >
                  <option value="">Select subcategory</option>
                  {subcategoryList.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ad Heading Title *</label>
              <input 
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Tesla Model S Plaid 2024 - Stealth Edition" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
              />
              <span className="text-[10px] text-gray-400 mt-1.5 block">A premium heading contains a brand, version, specifications, and condition.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Item Description *</label>
              <textarea 
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail product specifications, maintenance history, reason for sale, list parameters..." 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Asking Price ($) *</label>
                <input 
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 84500" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Negotiability</label>
                <select 
                  value={isNegotiable ? 'yes' : 'no'}
                  onChange={(e) => setIsNegotiable(e.target.value === 'yes')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm bg-white"
                >
                  <option value="no">Firm Price Only</option>
                  <option value="yes">Negotiable Deal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Condition Rating</label>
                <select 
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as AdCondition)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm bg-white"
                >
                  <option value="New">Brand New</option>
                  <option value="Like New">Like New / Mint</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair / Used</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">City *</label>
                <input 
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New York, London, Dubai" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Area / Suburb</label>
                <input 
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Manhattan, Beverly Hills" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl space-y-4 border border-gray-100">
              <h4 className="font-display font-bold text-sm text-gray-900 flex items-center space-x-1.5">
                <Phone className="w-4.5 h-4.5 text-blue-600" />
                <span>Contact Specifications</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</label>
                  <input 
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">WhatsApp Hub</label>
                  <input 
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Secure Email</label>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Tags section */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Organic Keywords & Tags</label>
              <input 
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Press comma or enter to register tags..." 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
              />
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {tags.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100 font-medium">
                    <span>#{tag}</span>
                    <button type="button" onClick={() => handleRemoveTag(idx)} className="text-blue-500 hover:text-blue-700 ml-1">✕</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Button */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                disabled={!categoryId || !title || !description || !price || !city}
                onClick={() => setStep(2)}
                className="flex items-center space-x-1.5 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 active:scale-98 cursor-pointer select-none shadow-lg shadow-blue-500/10"
              >
                <span>Proceed to Photos</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
            </div>

          </motion.div>
        )}

        {/* Step 2: Photos upload & Naked warning */}
        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl border border-gray-150 p-7 shadow-sm space-y-6"
          >
            <div>
              <h3 className="font-display font-extrabold text-xl text-gray-900">Upload Visual Assets</h3>
              <p className="text-xs text-gray-400 mt-1">Provide up to 5 clear, authentic photographs of the item.</p>
            </div>

            {/* Critical requested naked warning */}
            <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-xs leading-relaxed font-semibold">
              Note: Do not upload naked or bold pictures otherwise your ad will be deleted.
            </div>

            {/* Drag Drop Simulator Zone */}
            <div 
              onClick={handleDragDropMock}
              className="border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-2xl p-10 text-center cursor-pointer transition-colors bg-gray-50/30 group"
            >
              <Upload className="w-10 h-10 text-gray-400 mx-auto group-hover:scale-105 transition-transform group-hover:text-blue-500" />
              <span className="block text-sm font-bold text-gray-700 mt-3">Drag & drop files here</span>
              <span className="block text-xs text-gray-400 mt-1">(or click to simulate selecting files)</span>
              <span className="text-[10px] font-mono text-gray-400 block mt-2">Maximum files: 5. Supported formats: PNG, JPG, WebP</span>
            </div>

            {/* Image Preview List */}
            {images.length > 0 && (
              <div className="space-y-3">
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Previews ({images.length}/5)</span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group bg-gray-50">
                      <img src={img} alt="preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-black text-white text-[10px] transition-colors"
                      >
                        ✕
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-black/50 py-1 text-center text-[9px] font-bold text-white uppercase tracking-wider">
                        {idx === 0 ? 'Primary' : `Photo ${idx + 1}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Video Tour Link (Optional)</label>
              <input 
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="e.g. YouTube tour link or virtual walkthrough" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
              />
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center space-x-1.5 px-4 py-3 rounded-xl text-xs font-bold border border-gray-200 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>

              <button
                type="button"
                disabled={images.length === 0}
                onClick={() => setStep(3)}
                className="flex items-center space-x-1.5 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 active:scale-98 cursor-pointer select-none"
              >
                <span>Select Package</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
            </div>

          </motion.div>
        )}

        {/* Step 3: Package select & Coupon invoicing */}
        {step === 3 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl border border-gray-150 p-7 shadow-sm space-y-6"
          >
            <div>
              <h3 className="font-display font-extrabold text-xl text-gray-900">Configure Promotion Package</h3>
              <p className="text-xs text-gray-400 mt-1">Select a monetization plan to boost visibility by up to 5x.</p>
            </div>

            {/* Packages Selection List */}
            <div className="space-y-3">
              {[
                { name: 'Free', price: 'USD 0.00', desc: 'Standard classified listing on the organic results grid.', duration: '1 month' },
                { name: 'Featured', price: 'USD 14.99', desc: 'Slightly higher organic ranking and 14 days featured tags.', duration: '14 days' },
                { name: 'Premium', price: 'USD 29.99', desc: 'Premium luxury badges. Ranks higher than Featured. Maximum views.', duration: '30 days' },
                { name: 'Top', price: 'USD 49.99', desc: 'Places classified listing permanently in top sliders of home page.', duration: '7 days' },
                { name: 'Highlight', price: 'USD 9.99', desc: 'Adds high contrast orange background grids in result searches.', duration: '7 days' }
              ].map((pkg, idx) => {
                const isSelected = packageType === pkg.name;
                return (
                  <div
                    key={idx}
                    onClick={() => setPackageType(pkg.name as PackageType)}
                    className={`p-4 border rounded-2xl cursor-pointer text-left transition-all flex items-center justify-between select-none ${isSelected ? 'border-blue-500 bg-blue-50/30' : 'border-gray-150 hover:bg-gray-50/50'}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-gray-800">{pkg.name} Package</span>
                        <p className="text-xs text-gray-400 mt-0.5 max-w-md leading-relaxed">{pkg.desc}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-4">
                      <span className="block text-sm font-extrabold text-gray-900">{pkg.price}</span>
                      <span className="block text-[10px] font-mono text-gray-400 mt-0.5 uppercase tracking-wider">{pkg.duration}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Invoicing and Promo Code Section */}
            {packageType !== 'Free' && (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 space-y-4">
                <h4 className="font-display font-bold text-sm text-gray-900 flex items-center space-x-1.5">
                  <DollarSign className="w-4.5 h-4.5 text-blue-600" />
                  <span>Monetization Billing Invoice</span>
                </h4>

                <div className="flex items-center space-x-2">
                  <input 
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Coupon (e.g. VELO50)" 
                    className="flex-grow px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-500 uppercase font-mono"
                  />
                  <button 
                    type="button"
                    onClick={handleValidateCoupon}
                    disabled={validatingCoupon || !couponCode}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold disabled:opacity-50 select-none cursor-pointer"
                  >
                    {validatingCoupon ? 'Validating...' : 'Apply'}
                  </button>
                </div>

                {couponSuccess && <span className="block text-[11px] font-semibold text-emerald-600">{couponSuccess}</span>}
                {couponError && <span className="block text-[11px] font-semibold text-red-500">{couponError}</span>}

                {/* Pricing summary */}
                <div className="pt-2 border-t border-gray-200 text-xs space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{packageType} package fee</span>
                    <span className="font-bold">${basePrice.toFixed(2)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Promo code discount ({discountPercent}%)</span>
                      <span>-${((basePrice * discountPercent) / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-extrabold pt-2 border-t border-dashed border-gray-200">
                    <span className="font-sans">Total Due</span>
                    <span className="text-blue-700">${finalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center space-x-1.5 px-4 py-3 rounded-xl text-xs font-bold border border-gray-200 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitAd}
                className="flex items-center space-x-1.5 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 active:scale-98 cursor-pointer select-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing Classified...</span>
                  </>
                ) : (
                  <>
                    <span>Publish Ad</span>
                    <ArrowRight className="w-4.5 h-4.5" />
                  </>
                )}
              </button>
            </div>

          </motion.div>
        )}

        {/* Step 4: Finish / Confirmation */}
        {step === 4 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-gray-150 p-10 shadow-sm text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <h2 className="font-display font-black text-2xl text-gray-900 leading-snug">
                Congratulations! Your ad has been published!
              </h2>
              <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">
                {packageType !== 'Free' 
                  ? 'Your listing has been submitted for pending administrative review. Once authorized by administrators, it will instantly deploy live with premium highlighting tags.' 
                  : 'Your organic classified ad is now live on our search matrix. Prospective buyers can now contact you via secure chats or WhatsApp call links.'}
              </p>
            </div>

            {packageType !== 'Free' && (
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 text-xs text-left max-w-md mx-auto flex items-start space-x-2.5">
                <Clock className="w-5 h-5 text-orange-500 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="font-bold text-orange-800 block">Pending Review Pipeline</span>
                  <p className="text-[10px] text-orange-600 leading-relaxed mt-0.5">
                    Because you have chosen the {packageType} bundle, administrators will confirm the payments and verify files. Reviews usually complete under 15 minutes.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-gray-100 max-w-sm mx-auto">
              <button
                type="button"
                onClick={() => {
                  onAdCreated();
                  onViewChange('home');
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold transition-all"
              >
                Back to home page
              </button>

              <button
                type="button"
                onClick={() => {
                  onAdCreated();
                  onViewChange('dashboard');
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                My Ads Panel
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
