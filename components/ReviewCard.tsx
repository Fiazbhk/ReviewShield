import React from 'react';
import { Review, RelevanceStatus } from '../types';
import { Star, AlertTriangle, CheckCircle, HelpCircle, ChevronRight } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
  businessCategory: string; // Kept for prop compatibility, though mostly used in Modal now
  onRefreshAnalysis: (reviewId: string) => void;
  onViewDetails: (review: Review) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onRefreshAnalysis, onViewDetails }) => {
  const getStatusColor = (status: RelevanceStatus) => {
    switch (status) {
      case RelevanceStatus.RELEVANT: return 'bg-green-100 text-green-800 border-green-200';
      case RelevanceStatus.IRRELEVANT: return 'bg-red-100 text-red-800 border-red-200';
      case RelevanceStatus.NEEDS_REVIEW: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: RelevanceStatus) => {
    switch (status) {
      case RelevanceStatus.RELEVANT: return <CheckCircle size={14} className="mr-1.5" />;
      case RelevanceStatus.IRRELEVANT: return <AlertTriangle size={14} className="mr-1.5" />;
      case RelevanceStatus.NEEDS_REVIEW: return <HelpCircle size={14} className="mr-1.5" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 transition-all hover:shadow-md hover:border-blue-200 group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
             {review.reviewerName.charAt(0)}
           </div>
           <div>
              <h4 className="text-sm font-semibold text-gray-900">{review.reviewerName}</h4>
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300"} />
                  ))}
                </div>
                <span className="text-xs text-gray-400">{new Date(review.createTime).toLocaleDateString()}</span>
              </div>
           </div>
        </div>
        
        {review.status !== RelevanceStatus.PENDING && (
          <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center border ${getStatusColor(review.status)}`}>
            {getStatusIcon(review.status)}
            <span className="uppercase tracking-wide" style={{fontSize: '10px'}}>{review.status.replace('_', ' ')}</span>
          </div>
        )}
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">"{review.text}"</p>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        {review.analysis ? (
           <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Confidence:</span>
              <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500" style={{width: `${review.analysis.confidence * 100}%`}}></div>
              </div>
           </div>
        ) : (
           <span className="text-xs text-gray-400 italic">Analysis Pending</span>
        )}

        <div className="flex gap-2">
           {!review.analysis && (
              <button 
                onClick={(e) => { e.stopPropagation(); onRefreshAnalysis(review.id); }}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
              >
                Analyze
              </button>
           )}
           <button 
             onClick={() => onViewDetails(review)}
             className="text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors flex items-center"
           >
             View Details <ChevronRight size={14} className="ml-1 text-gray-400" />
           </button>
        </div>
      </div>
    </div>
  );
};