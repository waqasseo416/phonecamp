import React from 'react';
import * as Icons from 'lucide-react';
import { Category } from '../types';

interface CategoryListProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export default function CategoryList({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryListProps) {
  
  // Dynamic component rendering helper for Lucide icons
  const renderIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="w-5.5 h-5.5" />;
    }
    return <Icons.Grid className="w-5.5 h-5.5" />;
  };

  return (
    <div className="w-full bg-slate-50 rounded-2xl p-6 border border-slate-200/60 select-none">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-black text-lg text-slate-800 tracking-tight uppercase">
          Browse by Arena
        </h3>
        {selectedCategory && (
          <button 
            onClick={() => onSelectCategory(null)}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            Clear selection
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id || selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className={`flex flex-col items-center text-center p-4 rounded-2xl border transition-all select-none cursor-pointer outline-none group ${
                isSelected 
                  ? 'border-blue-500 bg-white text-blue-600 shadow-md shadow-blue-100/50' 
                  : 'border-slate-200 bg-white hover:border-blue-500 hover:shadow-md hover:scale-102 text-slate-500'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mb-3 transition-all ${
                isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50'
              }`}>
                {renderIcon(cat.icon)}
              </div>
              <div className="w-full">
                <span className={`block text-[11px] font-black uppercase tracking-wider ${
                  isSelected ? 'text-slate-800' : 'text-slate-500 group-hover:text-slate-800'
                } transition-colors`}>
                  {cat.name}
                </span>
                <span className="block text-[9px] font-mono text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                  {cat.subcategories.length} niches
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
