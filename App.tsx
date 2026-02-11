import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { BusinessCard } from './components/BusinessCard';
import { ReviewCard } from './components/ReviewCard';
import { AnalyticsChart } from './components/AnalyticsChart';
import { LandingPage } from './components/LandingPage';
import { ReviewDetailModal } from './components/ReviewDetailModal';
import { MOCK_BUSINESS, MOCK_REVIEWS, BACKEND_URL } from './constants';
import { Review, RelevanceStatus, User, BusinessProfile } from './types';
import { analyzeReviewWithGemini } from './services/geminiService';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  // App Data State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [business, setBusiness] = useState<BusinessProfile>(MOCK_BUSINESS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // Check for Token on Mount (OAuth Callback)
  useEffect(() => {
    const checkAuth = async () => {
      // 1. Check URL for token (Callback from backend)
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get('token');
      
      let token = tokenFromUrl;

      if (token) {
        localStorage.setItem('auth_token', token);
        // Clear URL
        window.history.replaceState({}, document.title, "/");
      } else {
        // 2. Check LocalStorage
        token = localStorage.getItem('auth_token');
      }

      if (token) {
        setUser({
            id: 'user_oauth',
            name: 'Business Owner',
            email: 'owner@business.com',
            avatarUrl: ''
        });

        // Fetch Real Data from Backend
        try {
          const response = await axios.get(`${BACKEND_URL}/api/reviews`);
          if (response.data && response.data.business) {
            // Map backend data to frontend types
            const backendReviews = response.data.reviews.map((r: any) => ({
              id: r.id,
              reviewerName: r.reviewer_name,
              rating: r.rating,
              text: r.text,
              createTime: r.created_time || r.createTime, // fallback
              status: r.status,
              analysis: r.analysis
            }));
            
            setBusiness(response.data.business);
            setReviews(backendReviews);
          } else {
             // Fallback to mocks if DB empty
             setReviews(MOCK_REVIEWS);
          }
        } catch (err) {
          console.error("Failed to fetch data:", err);
          // Fallback to mocks on error
          setReviews(MOCK_REVIEWS);
        }
      }

      setIsAuthLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    // Redirect to Backend OAuth endpoint
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  // AI Analysis Logic
  const handleAnalyzeAll = async () => {
    setIsAnalyzing(true);
    const updatedReviews = [...reviews];
    
    // Process only pending reviews to save resources
    for (let i = 0; i < updatedReviews.length; i++) {
      if (updatedReviews[i].status === RelevanceStatus.PENDING) {
        // Call backend wrapper
        const analysis = await analyzeReviewWithGemini(updatedReviews[i].text, business);
        updatedReviews[i].analysis = analysis;
        
        if (analysis.confidence >= 0.85 && analysis.relevance === 'irrelevant') {
            updatedReviews[i].status = RelevanceStatus.IRRELEVANT;
        } else if (analysis.confidence < 0.60) {
             updatedReviews[i].status = RelevanceStatus.RELEVANT;
        } else if (analysis.confidence >= 0.60 && analysis.confidence < 0.85) {
             updatedReviews[i].status = RelevanceStatus.NEEDS_REVIEW;
        } else {
             updatedReviews[i].status = RelevanceStatus.RELEVANT;
        }
        
        // Update local state progressively
        setReviews([...updatedReviews]);
      }
    }
    setIsAnalyzing(false);
  };

  const handleAnalyzeSingle = async (reviewId: string) => {
    const index = reviews.findIndex(r => r.id === reviewId);
    if (index === -1) return;

    const updatedReviews = [...reviews];
    const analysis = await analyzeReviewWithGemini(updatedReviews[index].text, business);
    
    updatedReviews[index].analysis = analysis;
    
    if (analysis.confidence >= 0.85 && analysis.relevance === 'irrelevant') {
        updatedReviews[index].status = RelevanceStatus.IRRELEVANT;
    } else if (analysis.confidence < 0.60) {
        updatedReviews[index].status = RelevanceStatus.RELEVANT;
    } else if (analysis.confidence >= 0.60 && analysis.confidence < 0.85) {
        updatedReviews[index].status = RelevanceStatus.NEEDS_REVIEW;
    } else {
        updatedReviews[index].status = RelevanceStatus.RELEVANT;
    }
    
    setReviews(updatedReviews);
  };

  // Filtering Logic
  const filteredReviews = reviews.filter(r => {
    if (activeTab === 'overview' || activeTab === 'all') return true;
    return r.status === activeTab;
  });

  const stats = {
    total: reviews.length,
    flagged: reviews.filter(r => r.status === RelevanceStatus.IRRELEVANT).length,
    needsReview: reviews.filter(r => r.status === RelevanceStatus.NEEDS_REVIEW).length
  };

  const pendingCount = reviews.filter(r => r.status === RelevanceStatus.PENDING).length;

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-blue-600" /></div>;
  }

  if (!user) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <Layout user={user} onLogout={handleLogout} activeTab={activeTab} onTabChange={setActiveTab}>
      
      {/* Overview Section */}
      {activeTab === 'overview' && (
        <>
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-500 mt-1">Real-time analysis of your business reputation.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <BusinessCard business={business} stats={stats} />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Relevance Distribution</h3>
                <AnalyticsChart reviews={reviews} />
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Pending: <span className="font-bold text-gray-900">{pendingCount}</span></span>
                    <button
                      onClick={handleAnalyzeAll}
                      disabled={isAnalyzing || pendingCount === 0}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        isAnalyzing || pendingCount === 0 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                      }`}
                    >
                      {isAnalyzing && <Loader2 className="animate-spin w-4 h-4" />}
                      {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
                    </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Review List Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h2 className="text-xl font-bold text-gray-900">
             {activeTab === 'overview' ? 'Recent Reviews' : 
              activeTab === 'all' ? 'All Reviews' : 
              activeTab === RelevanceStatus.IRRELEVANT ? 'Flagged Reviews' : 'Needs Review'}
           </h2>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-400">No reviews found in this category.</p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <ReviewCard 
                key={review.id} 
                review={review}
                businessCategory={business.category}
                onRefreshAnalysis={handleAnalyzeSingle}
                onViewDetails={setSelectedReview}
              />
            ))
          )}
        </div>
      </div>

      {selectedReview && (
        <ReviewDetailModal 
          review={selectedReview} 
          businessCategory={business.category}
          onClose={() => setSelectedReview(null)} 
        />
      )}
    </Layout>
  );
};

export default App;