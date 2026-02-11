// Simple In-Memory Database for Prototype/Hackathon
// In production, replace this with PostgreSQL/Prisma/Supabase calls.

const db = {
  users: [],
  businesses: [
    // Initial mock data can remain for fallback/testing
    {
      id: 'biz_123',
      user_id: 'user_1', // Only works if we manually create user_1 or if user logs in and matches this
      account_id: 'acc_001',
      location_id: 'loc_001',
      name: "Joe's Artisan Coffee (Mock)",
      category: "Coffee Shop",
      additionalCategories: ["Bakery", "Internet Cafe"],
      services: ["Espresso Bar", "Free Wi-Fi", "Pastries", "Coffee Beans Retail", "Catering"],
      created_at: new Date()
    }
  ],
  reviews: [
     {
      id: 'rev_001',
      business_id: 'biz_123',
      review_id: 'g_rev_001',
      reviewer_name: "Alice Johnson",
      rating: 5,
      text: "The espresso here is fantastic! Best beans in the city.",
      status: 'pending',
      created_time: "2023-10-25T10:30:00Z"
    },
    {
      id: 'rev_002',
      business_id: 'biz_123',
      review_id: 'g_rev_002',
      reviewer_name: "Bob Smith",
      rating: 1,
      text: "My package from Amazon was delivered to the wrong house next door. Terrible delivery service!",
      status: 'pending',
      created_time: "2023-10-24T14:15:00Z"
    }
  ]
};

export const createUser = (user) => {
  db.users.push(user);
  return user;
};

export const findUserByEmail = (email) => db.users.find(u => u.email === email);

export const getUserById = (id) => db.users.find(u => u.id === id);

export const getBusinesses = () => db.businesses;

export const getBusinessById = (id) => db.businesses.find(b => b.id === id);

export const upsertBusiness = (businessData) => {
  const existingIndex = db.businesses.findIndex(b => b.location_id === businessData.location_id);
  if (existingIndex >= 0) {
    db.businesses[existingIndex] = { ...db.businesses[existingIndex], ...businessData };
    return db.businesses[existingIndex];
  } else {
    db.businesses.push(businessData);
    return businessData;
  }
};

export const getReviewsByBusiness = (businessId) => 
  db.reviews.filter(r => r.business_id === businessId);

export const upsertReview = (reviewData) => {
  const existingIndex = db.reviews.findIndex(r => r.review_id === reviewData.review_id);
  if (existingIndex >= 0) {
    // We preserve the existing analysis and status if it was already processed
    const existing = db.reviews[existingIndex];
    if (existing.status !== 'pending') {
      // Only update mutable fields from Google (e.g. if text changed? unlikely)
      // Usually we just skip if already processed
      return existing;
    }
    db.reviews[existingIndex] = { ...existing, ...reviewData };
    return db.reviews[existingIndex];
  } else {
    db.reviews.push(reviewData);
    return reviewData;
  }
};

export default db;