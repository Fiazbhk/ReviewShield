import express from 'express';
import { createUser, findUserByEmail, upsertBusiness } from '../models/db.js';
import { encryptToken } from '../utils/tokenEncryption.js';
import { getAccounts, getLocations } from '../services/googleService.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Use environment variables for OAuth
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/auth/google/callback';

// GET /auth/google
router.get('/google', (req, res) => {
  if (!CLIENT_ID) {
    const mockToken = jwt.sign({ id: 'mock_user', email: 'demo@example.com' }, JWT_SECRET, { expiresIn: '1h' });
    return res.redirect(`http://localhost:3000?token=${mockToken}`);
  }

  const scopes = [
    'https://www.googleapis.com/auth/business.manage',
    'openid',
    'email',
    'profile'
  ];

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scopes.join(' ')}&access_type=offline&prompt=consent`;

  res.redirect(authUrl);
});

// GET /auth/google/callback
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Authorization code missing');
  }

  try {
    // 1. Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    const { access_token, refresh_token, id_token } = tokenResponse.data;

    // 2. Get User Info
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { email, name, picture } = userResponse.data;

    // 3. Upsert User in DB
    let user = findUserByEmail(email);
    if (!user) {
      user = createUser({
        id: 'user_' + Date.now(),
        email,
        name,
        avatarUrl: picture,
        access_token: encryptToken(access_token),
        refresh_token: encryptToken(refresh_token),
        created_at: new Date()
      });
    } else {
      // Update tokens if user exists
      user.access_token = encryptToken(access_token);
      if (refresh_token) user.refresh_token = encryptToken(refresh_token);
    }

    // 4. Onboard Business Data (Fetch Accounts & Locations)
    try {
      const accounts = await getAccounts(access_token);
      if (accounts.length > 0) {
        const account = accounts[0]; // Take first account
        const locations = await getLocations(access_token, account.name);
        
        if (locations.length > 0) {
          const location = locations[0]; // Take first location
          
          // Map Google Categories/Services to our schema
          const primaryCat = location.primaryCategory?.displayName || "General Business";
          const additionalCats = (location.additionalCategories || []).map(c => c.displayName);
          const services = (location.serviceItems || []).map(s => s.structuredServiceItem?.serviceTypeId || s.freeFormServiceItem?.label || "Service");

          upsertBusiness({
            id: `biz_${location.name.split('/').pop()}`,
            user_id: user.id,
            account_id: account.name,
            location_id: location.name, // "accounts/x/locations/y"
            name: location.title,
            category: primaryCat,
            additionalCategories: additionalCats,
            services: services,
            location: location.metadata?.mapsUri || "No address provided",
            created_at: new Date()
          });
        }
      }
    } catch (bizError) {
      console.error("Failed to fetch business data during onboarding:", bizError);
      // Continue login even if fetching biz data fails, can retry later
    }

    // 5. Create Session JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    // 6. Redirect back to Frontend
    res.redirect(`http://localhost:3000?token=${token}`);

  } catch (error) {
    console.error('OAuth Error:', error.response?.data || error.message);
    res.redirect('http://localhost:3000?error=auth_failed');
  }
});

export default router;