import React from 'react';
import { BusinessProfile } from '../types';
import { MapPin, Store, Tag, BarChart } from 'lucide-react';

interface BusinessCardProps {
  business: BusinessProfile;
  stats: {
    total: number;
    flagged: number;
    needsReview: number;
  };
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ business, stats }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{business.name}</h2>
          <div className="flex items-center text-gray-500 mt-2 text-sm">
            <MapPin size={16} className="mr-1" />
            <span>{business.location}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
             <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
               {business.category}
             </span>
             {business.additionalCategories.map((cat, i) => (
               <span key={i} className="bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">
                 {cat}
               </span>
             ))}
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="flex gap-4">
           <div className="text-center p-3 bg-gray-50 rounded-lg min-w-[80px]">
             <span className="block text-2xl font-bold text-gray-900">{stats.total}</span>
             <span className="text-xs text-gray-500 uppercase font-medium">Reviews</span>
           </div>
           <div className="text-center p-3 bg-red-50 rounded-lg min-w-[80px]">
             <span className="block text-2xl font-bold text-red-600">{stats.flagged}</span>
             <span className="text-xs text-red-800 uppercase font-medium">Flagged</span>
           </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
          <Store size={14} className="mr-2" /> Services Detected
        </h3>
        <div className="flex flex-wrap gap-2">
          {business.services.map((service, idx) => (
            <span key={idx} className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
              {service}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};