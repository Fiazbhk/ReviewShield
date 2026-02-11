import { BusinessProfile, AIAnalysisResult, PolicyCategory } from '../types';
import { BACKEND_URL } from '../constants';

// This service now acts as a client-side wrapper calling the secure backend
// It no longer imports @google/genai directly, satisfying security requirements.

export const analyzeReviewWithGemini = async (
  reviewText: string,
  business: BusinessProfile
): Promise<AIAnalysisResult> => {
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/reviews/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: reviewText,
        businessContext: business
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json() as AIAnalysisResult;
    return result;

  } catch (error) {
    console.error("Gemini Analysis Request Failed:", error);
    // Return a safe fallback indicating failure to analyze
    return {
      relevance: 'relevant',
      confidence: 0,
      reason: "Analysis failed due to network or server error.",
      policy_category: PolicyCategory.NONE
    };
  }
};

export const generateReportText = async (
  reviewText: string,
  analysis: AIAnalysisResult,
  businessCategory: string
): Promise<string> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/reviews/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewText: reviewText,
          reason: analysis.reason,
          businessCategory: businessCategory
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data.text;
    } catch (e) {
      console.error(e);
      return "Error generating report text via server.";
    }
}