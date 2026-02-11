import React, { useState } from 'react';
import { Review, RelevanceStatus } from '../types';
import { X, Star, FileText, Check, Copy } from 'lucide-react';
import { generateReportText } from '../services/geminiService';

interface ReviewDetailModalProps {
  review: Review;
  businessCategory: string;
  onClose: () => void;
}

export const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({ review, businessCategory, onClose }) => {
  const [reportText, setReportText] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateReport = async () => {
    if (!review.analysis) return;
    setIsGenerating(true);
    const text = await generateReportText(review.text, review.analysis, businessCategory);
    setReportText(text);
    setIsGenerating(false);
  };

  const handleCopy = () => {
    if (reportText) {
      navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!review) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div>
             <h2 className="text-xl font-bold text-gray-900">Review Details</h2>
             <p className="text-sm text-gray-500">ID: {review.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Reviewer Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                 {review.reviewerName.charAt(0)}
               </div>
               <div>
                 <h3 className="font-semibold text-gray-900">{review.reviewerName}</h3>
                 <div className="flex items-center text-xs text-gray-500 mt-0.5">
                   <span>{new Date(review.createTime).toLocaleDateString()}</span>
                 </div>
               </div>
            </div>
            <div className="flex text-yellow-400 bg-yellow-50 px-2 py-1 rounded-lg">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300"} />
                ))}
            </div>
          </div>

          {/* Full Review Text */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
             <p className="text-gray-800 leading-relaxed italic">"{review.text}"</p>
          </div>

          {/* AI Analysis Section */}
          {review.analysis && (
            <div className="space-y-4">
               <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
                 AI Analysis
               </h3>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-xl border border-gray-200">
                   <span className="text-xs text-gray-500 block mb-1">Status</span>
                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase
                      ${review.status === RelevanceStatus.RELEVANT ? 'bg-green-100 text-green-800' : 
                        review.status === RelevanceStatus.IRRELEVANT ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {review.status.replace('_', ' ')}
                   </span>
                 </div>
                 <div className="p-4 rounded-xl border border-gray-200">
                   <span className="text-xs text-gray-500 block mb-1">Confidence Score</span>
                   <div className="flex items-center gap-2">
                     <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-blue-600 rounded-full" 
                         style={{ width: `${review.analysis.confidence * 100}%` }}
                       ></div>
                     </div>
                     <span className="text-sm font-bold">{(review.analysis.confidence * 100).toFixed(0)}%</span>
                   </div>
                 </div>
               </div>

               <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                  <span className="text-xs font-bold text-blue-800 uppercase block mb-2">Reasoning</span>
                  <p className="text-sm text-gray-700">{review.analysis.reason}</p>
               </div>

               {review.status === RelevanceStatus.IRRELEVANT && (
                 <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Reporting Assistance</h3>
                       <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                         Detected Policy: {review.analysis.policy_category}
                       </span>
                    </div>

                    {!reportText ? (
                      <button 
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                        className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        {isGenerating ? <span className="animate-spin">⌛</span> : <FileText size={18} />}
                        {isGenerating ? 'Generating Draft...' : 'Generate Report Explanation'}
                      </button>
                    ) : (
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Draft Explanation</span>
                          <button 
                            onClick={handleCopy}
                            className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'Copied' : 'Copy Text'}
                          </button>
                        </div>
                        <div className="p-4">
                           <p className="text-sm text-gray-600 leading-relaxed">{reportText}</p>
                        </div>
                      </div>
                    )}
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};