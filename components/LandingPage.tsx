import React from 'react';
import { Shield, CheckCircle, BarChart3, MessageSquare } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Shield className="text-blue-600" size={28} />
              <span className="text-xl font-bold tracking-tight text-gray-900">ReviewShield</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-500 hover:text-gray-900 font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-500 hover:text-gray-900 font-medium">How it Works</a>
            </div>
            <button 
              onClick={onLogin}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
            Protect Your Business Reputation with AI
          </h1>
          <p className="text-xl text-gray-500 mb-10 leading-relaxed">
            Automatically detect and manage off-topic, misleading, and spam reviews on your Google Business Profile using advanced Gemini AI.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onLogin}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-300 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all shadow-sm"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
              Connect Google Business Profile
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-400">No credit card required • Secure OAuth Connection</p>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Precision Classification</h3>
              <p className="text-gray-500">
                Gemini AI analyzes every review against your specific services to identify relevance with high confidence.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Explainable Reasoning</h3>
              <p className="text-gray-500">
                Get clear, natural language explanations for why a review was flagged as off-topic or misleading.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="text-purple-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Reporting Assistance</h3>
              <p className="text-gray-500">
                Auto-generate professional, policy-aligned text to help you report violations to Google efficiently.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};