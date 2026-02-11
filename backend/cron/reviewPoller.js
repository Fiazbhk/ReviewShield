import cron from 'node-cron';
import { getBusinesses, upsertReview, getUserById } from '../models/db.js';
import { getReviews, refreshAccessToken } from '../services/googleService.js';
import { classifyReview } from '../services/geminiService.js';
import { decryptToken } from '../utils/tokenEncryption.js';

// Logic for decision engine based on spec
const determineStatus = (analysis) => {
  const { relevance, confidence } = analysis;
  
  if (relevance === 'irrelevant' && confidence >= 0.85) {
    return 'irrelevant'; // Flagged
  } else if (relevance === 'irrelevant' && confidence >= 0.60) {
    return 'needs_review';
  } else {
    return 'relevant';
  }
};

export const startReviewPoller = () => {
  // Schedule to run every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    console.log('Running Review Poller...');
    const businesses = getBusinesses();

    for (const business of businesses) {
      try {
        console.log(`Processing business: ${business.name} (${business.id})`);
        
        // 1. Get User for Credentials
        const user = getUserById(business.user_id);
        if (!user || !user.refresh_token) {
          console.warn(`No user or refresh token found for business ${business.id}`);
          continue;
        }

        // 2. Refresh Token
        // Decrypt stored refresh token
        const decryptedRefreshToken = decryptToken(user.refresh_token);
        if (!decryptedRefreshToken) {
            console.error(`Failed to decrypt refresh token for user ${user.id}`);
            continue;
        }

        let accessToken;
        try {
            accessToken = await refreshAccessToken(decryptedRefreshToken);
        } catch (authError) {
            console.error(`Auth refresh failed for user ${user.id}:`, authError.message);
            continue;
        }
        
        // 3. Fetch Reviews from Google
        const fetchedReviews = await getReviews(accessToken, business.location_id);
        
        for (const gReview of fetchedReviews) {
          // Normalize Google Review Data
          const reviewId = gReview.reviewId;
          const reviewerName = gReview.reviewer?.displayName || 'Anonymous';
          const starRating = gReview.starRating; 
          // Map STAR_RATING enum to number
          const ratingMap = { 'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5 };
          const rating = ratingMap[starRating] || 0;
          const comment = gReview.comment || "";
          
          if (!comment) continue; // Skip empty reviews for classification purposes

          // 4. Classify with Gemini
          // Note: In a real app, we should check if we already have this review and if it is analyzed
          // 'upsertReview' handles existence check, but we do AI analysis before that here.
          // Optimization: Check DB first to avoid re-running AI.
          
          const analysis = await classifyReview(comment, business);
          
          const reviewRecord = {
            id: `rev_${reviewId}`, // Internal ID
            business_id: business.id,
            review_id: reviewId, // Google ID
            reviewer_name: reviewerName,
            rating: rating,
            text: comment,
            analysis: analysis,
            status: determineStatus(analysis),
            created_time: gReview.createTime // ISO string
          };

          upsertReview(reviewRecord);
          console.log(`Processed review: ${reviewId} -> ${reviewRecord.status}`);
        }
      } catch (error) {
        console.error(`Error processing business ${business.id}:`, error);
      }
    }
  });
};