import express from 'express';
import { getReviewsByBusiness, getBusinesses } from '../models/db.js';
import { classifyReview, generateReport } from '../services/geminiService.js';

const router = express.Router();

// Middleware to verify JWT would go here.
// For prototype, we skip strict JWT verification middleware implementation 
// and assume the user is authorized to see the mock business.

// GET /api/reviews
router.get('/', (req, res) => {
  // In a real app, retrieve user from req.user (from JWT)
  // Find their business
  const businesses = getBusinesses();
  if (businesses.length === 0) {
    return res.json({
      business: null,
      reviews: []
    });
  }
  
  const myBusiness = businesses[0]; // Just picking the first one for demo
  const reviews = getReviewsByBusiness(myBusiness.id);
  
  // Sort by created_time desc
  reviews.sort((a, b) => new Date(b.created_time) - new Date(a.created_time));
  
  res.json({
    business: myBusiness,
    reviews: reviews
  });
});

// POST /api/reviews/analyze
// Stateless proxy for AI analysis to protect API key
router.post('/analyze', async (req, res) => {
  const { text, businessContext } = req.body;
  
  if (!text || !businessContext) {
    return res.status(400).json({ error: "Missing text or business context" });
  }

  try {
    const analysis = await classifyReview(text, businessContext);
    res.json(analysis);
  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: "Analysis failed" });
  }
});

// POST /api/reviews/report
// Stateless proxy for Report Generation
router.post('/report', async (req, res) => {
  const { reviewText, reason, businessCategory } = req.body;

  if (!reviewText || !reason || !businessCategory) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const reportText = await generateReport(reviewText, reason, businessCategory);
    res.json({ text: reportText });
  } catch (error) {
    console.error("Report Gen Error:", error);
    res.status(500).json({ error: "Report generation failed" });
  }
});

export default router;