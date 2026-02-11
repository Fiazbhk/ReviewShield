import { BusinessProfile, Review, RelevanceStatus, PolicyCategory } from './types';

// Determine Backend URL based on environment
// In production, this would be your Render/Railway URL
export const BACKEND_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? 'https://your-production-app.onrender.com' // Replace with actual deployment URL
  : 'http://localhost:5000';

export const MOCK_BUSINESS: BusinessProfile = {
  id: 'biz_123',
  name: "Joe's Artisan Coffee",
  category: "Coffee Shop",
  additionalCategories: ["Bakery", "Internet Cafe"],
  services: ["Espresso Bar", "Free Wi-Fi", "Pastries", "Coffee Beans Retail", "Catering"],
  location: "123 Main St, Seattle, WA"
};

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev_001',
    reviewerName: "Alice Johnson",
    rating: 5,
    text: "The espresso here is fantastic! Best beans in the city.",
    createTime: "2023-10-25T10:30:00Z",
    status: RelevanceStatus.PENDING
  },
  {
    id: 'rev_002',
    reviewerName: "Bob Smith",
    rating: 1,
    text: "My package from Amazon was delivered to the wrong house next door. Terrible delivery service!",
    createTime: "2023-10-24T14:15:00Z",
    status: RelevanceStatus.PENDING
  },
  {
    id: 'rev_003',
    reviewerName: "Charlie Davis",
    rating: 3,
    text: "Coffee was okay, but the music was a bit too loud for working.",
    createTime: "2023-10-23T09:00:00Z",
    status: RelevanceStatus.PENDING
  },
  {
    id: 'rev_004',
    reviewerName: "Diana Prince",
    rating: 1,
    text: "I bought a car from the dealership down the street and it broke down immediately. Do not trust them!",
    createTime: "2023-10-22T16:45:00Z",
    status: RelevanceStatus.PENDING
  },
  {
    id: 'rev_005',
    reviewerName: "Evan Wright",
    rating: 5,
    text: "Great atmosphere and the staff is super friendly. Love the avocado toast.",
    createTime: "2023-10-21T08:20:00Z",
    status: RelevanceStatus.PENDING
  }
];

export const APP_NAME = "ReviewShield";