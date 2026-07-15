import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, User, ArrowLeft, Clock, MessageCircle, Share2, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { BlogPost } from '../types';

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const data = await api.getBlogs();
      setBlogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-400">
        <span className="text-xs">Accessing guidebook databases...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 text-left animate-fade-in">
      
      {selectedBlog ? (
        /* Blog Detail View */
        <div className="max-w-3xl mx-auto space-y-6">
          <button 
            onClick={() => setSelectedBlog(null)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-gray-150 hover:bg-white bg-gray-50 text-xs font-bold text-gray-600 mb-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Guides</span>
          </button>

          <img 
            src={selectedBlog.coverImage} 
            alt={selectedBlog.title} 
            className="w-full h-72 object-cover rounded-2xl border border-gray-150 shadow-sm" 
          />

          <div className="space-y-3">
            <div className="flex items-center space-x-4 text-xs font-mono text-gray-400">
              <span className="flex items-center space-x-1"><User className="w-3.5 h-3.5" /> <span>{selectedBlog.author}</span></span>
              <span className="flex items-center space-x-1"><Calendar className="w-3.5 h-3.5" /> <span>{new Date(selectedBlog.createdAt).toLocaleDateString()}</span></span>
              <span className="flex items-center space-x-1"><Clock className="w-3.5 h-3.5" /> <span>{selectedBlog.readTime}</span></span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-4xl text-gray-900 leading-tight">
              {selectedBlog.title}
            </h1>
          </div>

          <article className="prose prose-blue text-sm sm:text-base text-gray-700 leading-relaxed font-sans whitespace-pre-wrap pt-4 border-t border-gray-100">
            {selectedBlog.content}
          </article>
        </div>
      ) : (
        /* Blog Grid List */
        <div className="space-y-8 select-none">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-display font-black text-3xl text-gray-950 flex items-center justify-center space-x-2">
              <BookOpen className="w-7 h-7 text-blue-600" />
              <span>Velo SaaS Guides</span>
            </h2>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Unlock maximum conversions with expert guides on copywriting, safety regulations, and trading strategies written by top marketing architects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div 
                key={blog.id}
                onClick={() => setSelectedBlog(blog)}
                className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col h-full group"
              >
                <div className="aspect-[16/10] bg-gray-50 overflow-hidden relative">
                  <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" />
                  <span className="absolute top-3.5 left-3.5 px-2 py-1 bg-blue-600 text-[10px] font-bold text-white rounded uppercase tracking-wider">
                    MARKET GUIDE
                  </span>
                </div>

                <div className="p-5 flex-grow flex flex-col text-left">
                  <span className="text-[10px] text-gray-400 font-mono flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{blog.readTime}</span>
                  </span>

                  <h3 className="font-display font-bold text-base text-gray-900 group-hover:text-blue-600 transition-colors mt-2 line-clamp-2 leading-snug">
                    {blog.title}
                  </h3>

                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 mt-2 font-sans">
                    {blog.summary}
                  </p>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-semibold font-mono">
                    <span>By: {blog.author}</span>
                    <span className="text-blue-600 group-hover:translate-x-1 transition-transform inline-block">Read article →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
