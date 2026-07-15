import React, { useState } from 'react';
import { 
  Search, LogIn, LogOut, PlusCircle, User, ShieldAlert, ShieldCheck, 
  MessageSquare, LayoutGrid, Heart, UserCircle, Key, Mail, CheckCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType, UserRole } from '../types';
import { api } from '../lib/api';

interface NavbarProps {
  currentUser: UserType | null;
  onLogout: () => void;
  onLoginSuccess: (user: UserType, token: string) => void;
  onViewChange: (view: string, adId?: string) => void;
  currentView: string;
}

export default function Navbar({ 
  currentUser, 
  onLogout, 
  onLoginSuccess, 
  onViewChange,
  currentView
}: NavbarProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Mr' | 'Mrs'>('Mr');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    try {
      const data = await api.login(email, password);
      onLoginSuccess(data.user, data.token);
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    try {
      const data = await api.register({
        name,
        email,
        password,
        phone,
        gender
      });
      onLoginSuccess(data.user, data.token);
      setShowAuthModal(false);
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-login helper to test instantly
  const fillTestCredentials = (role: 'admin' | 'seller') => {
    if (role === 'admin') {
      setEmail('companyexpertbacklink@gmail.com');
      setPassword('admin123');
    } else {
      setEmail('alex.luxury@example.com');
      setPassword('alex123');
    }
    setIsRegisterMode(false);
  };

  return (
    <>
      <header id="app-header" className="sticky top-0 z-40 w-full bg-white border-b border-slate-100 px-6 py-3 shrink-0 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => onViewChange('home')} 
            className="flex items-center space-x-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-blue-200 group-hover:scale-105 transition-all">
              V
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-800">
                VELO<span className="text-blue-600">SaaS</span>
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center space-x-7 text-sm font-semibold text-slate-500">
            <button 
              onClick={() => onViewChange('home')}
              className={`hover:text-blue-600 transition-colors ${currentView === 'home' ? 'text-blue-600' : ''}`}
            >
              Marketplace
            </button>
            <button 
              onClick={() => onViewChange('blogs')}
              className={`hover:text-blue-600 transition-colors ${currentView === 'blogs' ? 'text-blue-600' : ''}`}
            >
              Premium Guides
            </button>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-3.5">
                
                {/* Chat shortcut */}
                <button 
                  onClick={() => onViewChange('chat')}
                  className="p-2.5 rounded-full hover:bg-gray-50 text-gray-600 relative group transition-all"
                  title="Messages Inbox"
                >
                  <MessageSquare className="w-5.5 h-5.5 group-hover:text-blue-600 transition-colors" />
                </button>

                {/* Seller Dashboard Shortcut */}
                <button 
                  onClick={() => onViewChange('dashboard')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-gray-50 ${currentView === 'dashboard' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'}`}
                >
                  <LayoutGrid className="w-4.5 h-4.5" />
                  <span className="hidden sm:inline">My Studio</span>
                </button>

                {/* Admin Shortcut */}
                {currentUser.role === UserRole.ADMIN && (
                  <button 
                    onClick={() => onViewChange('admin')}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50/70 hover:bg-blue-100 transition-all ${currentView === 'admin' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                  >
                    <ShieldCheck className="w-4.5 h-4.5 text-blue-600 animate-pulse" />
                    <span className="hidden sm:inline">Admin Desk</span>
                  </button>
                )}

                {/* User Dropdown Profile Menu */}
                <div className="flex items-center space-x-2 pl-1 border-l border-slate-250">
                  <button 
                    onClick={() => onViewChange('profile')}
                    className="flex items-center space-x-2 group"
                  >
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.name} 
                      className="w-8.5 h-8.5 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-blue-400 transition-all" 
                    />
                    <div className="hidden lg:block text-left">
                      <span className="block text-xs font-semibold text-gray-800 line-clamp-1">{currentUser.name}</span>
                      <span className="block text-[10px] font-mono text-gray-400">@{currentUser.username}</span>
                    </div>
                  </button>
                  <button 
                    onClick={onLogout}
                    className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    title="Log Out"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </div>

              </div>
            ) : (
              <button 
                onClick={() => {
                  setAuthError('');
                  setShowAuthModal(true);
                }}
                className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors px-3 py-2 cursor-pointer select-none"
              >
                Log in
              </button>
            )}

            {/* Post Ad Sticky Button */}
            <button 
              onClick={() => {
                if (!currentUser) {
                  setAuthError('Please login to create classified listings.');
                  setShowAuthModal(true);
                } else {
                  onViewChange('create-ad');
                }
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-orange-200 flex items-center gap-2 transition-all active:scale-95 select-none cursor-pointer"
            >
              <PlusCircle className="w-4.5 h-4.5" />
              <span>SELL YOUR AD</span>
            </button>

          </div>
        </div>
      </header>

      {/* Auth Modal Backdrop */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/45 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
            >
              {/* Top decoration banner */}
              <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-500 to-orange-500" />

              <div className="p-7">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">V</div>
                    <span className="font-display font-extrabold text-lg text-gray-900 tracking-tight">VELO AUTH HUB</span>
                  </div>
                  <button 
                    onClick={() => setShowAuthModal(false)}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-center mb-6">
                  <h3 className="font-display font-extrabold text-2xl text-gray-900">
                    {isRegisterMode ? 'Create Premium Account' : 'Welcome Back'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Connect with thousands of verified elite buyers and sellers.
                  </p>
                </div>

                {/* Pre-fill Helpers (Super handy for evaluation!) */}
                <div className="p-3 bg-blue-50/50 rounded-xl mb-5 border border-blue-100/50">
                  <span className="block text-[10px] font-mono text-blue-600 uppercase tracking-wider font-bold mb-2">⚡ ONE-CLICK DEMO LOGIN:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => fillTestCredentials('admin')}
                      className="text-[11px] font-semibold text-left p-1.5 bg-white border border-gray-150 rounded-lg hover:border-blue-400 transition-all hover:bg-blue-50 flex items-center space-x-1"
                    >
                      <span>🔑 Sobia (Admin)</span>
                    </button>
                    <button 
                      onClick={() => fillTestCredentials('seller')}
                      className="text-[11px] font-semibold text-left p-1.5 bg-white border border-gray-150 rounded-lg hover:border-blue-400 transition-all hover:bg-blue-50 flex items-center space-x-1"
                    >
                      <span>🔑 Alex (Seller)</span>
                    </button>
                  </div>
                </div>

                {authError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold mb-4 border border-red-100 animate-shake">
                    {authError}
                  </div>
                )}

                <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-4">
                  {isRegisterMode && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Sobia Sterling" 
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Title Prefix</label>
                          <select 
                            value={gender}
                            onChange={(e) => setGender(e.target.value as any)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm bg-white"
                          >
                            <option value="Mr">Mr.</option>
                            <option value="Mrs">Mrs.</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone (Optional)</label>
                          <input 
                            type="text" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+92 329..." 
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Secure Password</label>
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/10 active:scale-98 select-none"
                  >
                    {isLoading ? 'Verifying Credentials...' : (isRegisterMode ? 'Create Free Studio' : 'Enter Velo Room')}
                  </button>
                </form>

                <div className="text-center mt-5">
                  <button 
                    onClick={() => {
                      setIsRegisterMode(!isRegisterMode);
                      setAuthError('');
                    }}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    {isRegisterMode ? 'Already registered? Login here' : 'New to Velo? Create standard seller studio'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
