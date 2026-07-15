import React, { useState, useEffect } from 'react';
import { 
  Users, AlertTriangle, ShieldCheck, DollarSign, Sparkles, Check, 
  X, FileText, ArrowUpRight, Loader2, RefreshCw, Layers 
} from 'lucide-react';
import { api } from '../lib/api';
import { Ad, Report, PlatformStats } from '../types';

export default function AdminPanel() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [pendingAds, setPendingAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const metrics = await api.getAdminStats();
      setStats(metrics);

      const complaints = await api.getAdminReports();
      setReports(complaints);

      const ads = await api.getAds();
      setPendingAds(ads.filter(a => a.status === 'Pending'));
    } catch (err) {
      console.error('Error loading admin control panel:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerateAd = async (adId: string, status: 'Active' | 'Rejected') => {
    setActioningId(adId);
    try {
      await api.updateAdStatus(adId, status);
      setPendingAds(prev => prev.filter(ad => ad.id !== adId));
      
      // Reload stats to reflect approved ad count
      const updatedStats = await api.getAdminStats();
      setStats(updatedStats);
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      await api.updateReportStatus(reportId, 'Resolved');
      setReports(prev => prev.filter(rep => rep.id !== reportId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 text-left">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-gray-100 pb-5 select-none">
        <div>
          <h2 className="font-display font-black text-2xl text-gray-950 flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <span>Velo Central Command</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">Authorized for administrators. Moderate listings, review complaints, and index search status.</p>
        </div>

        <button 
          onClick={loadAdminData}
          disabled={loading}
          className="flex items-center space-x-1 px-3 py-2 border border-gray-200 hover:bg-gray-50 text-xs font-semibold rounded-lg font-mono transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Matrix</span>
        </button>
      </div>

      {/* Admin metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 select-none">
        {[
          { label: 'Registered Members', val: stats?.usersCount || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50/50' },
          { label: 'Total Classifieds', val: stats?.adsCount || 0, icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50/50' },
          { label: 'Complaints & Reports', val: reports.length, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50/50' },
          { label: 'Simulated Paid Volume', val: `$${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50/50' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">{item.label}</span>
                <span className="block font-display font-black text-2xl text-gray-900 mt-2">{item.val}</span>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.color} ${item.bg}`}>
                <Icon className="w-5.5 h-5.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Sitemaps Status Indicator */}
      <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50/20 rounded-2xl border border-blue-100 mb-8 select-none flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <FileText className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="block text-sm font-bold text-blue-900">Search Engine Index Status (95+ SEO Rating)</span>
            <p className="text-xs text-blue-700 leading-relaxed mt-0.5">
              The dynamic robots.txt file is configured with direct links pointing to Google crawlers, and the dynamic Sitemap index auto-synchronizes each active premium classified listing to ensure rapid PageRank.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <a href="/sitemap.xml" target="_blank" className="px-4 py-2 bg-white hover:bg-gray-50 border border-blue-200 text-xs font-bold text-blue-700 rounded-xl transition-all shadow-sm flex items-center space-x-1">
            <span>Inspect Sitemap.xml</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Verification Queue (Approving Paid Listings) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-lg text-gray-900 flex items-center space-x-1.5">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Premium Verification Queue ({pendingAds.length})</span>
            </h3>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold bg-gray-50 px-2 py-0.5 rounded border border-gray-150">Pending Approval</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-150">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
              <span className="text-xs">Accessing queue registers...</span>
            </div>
          ) : pendingAds.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-150 p-12 text-center text-gray-400">
              <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-40 animate-pulse" />
              <h4 className="font-display font-bold text-gray-800 text-sm">All Clear!</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                There are currently no premium classified advertisements awaiting administrative moderation.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingAds.map((ad) => (
                <div key={ad.id} className="p-4 bg-white border border-gray-150 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-gray-300 transition-colors">
                  <div className="flex items-center space-x-3.5">
                    <img src={ad.images[0]} alt={ad.title} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-100 bg-gray-50" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-[9px] font-extrabold text-amber-800 uppercase tracking-widest flex items-center space-x-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{ad.packageType}</span>
                        </span>
                        <span className="text-xs text-gray-400 font-mono">Asking: ${ad.price}</span>
                      </div>
                      <h4 className="font-display font-bold text-sm text-gray-900 mt-1 line-clamp-1">{ad.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-mono">Location: {ad.area}, {ad.city}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleModerateAd(ad.id, 'Rejected')}
                      disabled={actioningId === ad.id}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
                      title="Reject and flag ad"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => handleModerateAd(ad.id, 'Active')}
                      disabled={actioningId === ad.id}
                      className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1 cursor-pointer"
                      title="Approve ad to live grid"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Complaints / Flagged spam reports */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-lg text-gray-900 flex items-center space-x-1.5">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>Spam Flags ({reports.length})</span>
            </h3>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">Unresolved Reports</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400 bg-white rounded-2xl border border-gray-150">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500 mx-auto" />
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-150 p-8 text-center text-gray-400">
              <ShieldCheck className="w-6 h-6 mx-auto mb-2 text-emerald-500 opacity-40" />
              <p className="text-xs">No active reports. Community is healthy and clean!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div key={rep.id} className="p-4 bg-white border border-gray-150 rounded-2xl text-xs space-y-3 shadow-sm text-left">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-gray-800 uppercase text-[9px] px-1.5 py-0.5 bg-red-50 text-red-600 rounded">
                        {rep.reason}
                      </span>
                      <h4 className="font-display font-bold text-gray-900 mt-1.5">Ad Context: {rep.adTitle}</h4>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed italic bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    "{rep.description || 'No detailed complain statement provided.'}"
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[10px] text-gray-400">
                    <span>By: {rep.reporterName}</span>
                    <button 
                      onClick={() => handleResolveReport(rep.id)}
                      className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold transition-all"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
