import axios from 'axios';

// Google API Base URLs
const ACCOUNT_API_URL = 'https://mybusinessaccountmanagement.googleapis.com/v1';
const INFO_API_URL = 'https://mybusinessbusinessinformation.googleapis.com/v1';
const REVIEW_API_URL = 'https://mybusiness.googleapis.com/v4';
const OAUTH_URL = 'https://oauth2.googleapis.com/token';

export const getAccounts = async (accessToken) => {
  try {
    constresponse = await axios.get(`${ACCOUNT_API_URL}/accounts`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data.accounts || [];
  } catch (error) {
    console.error('Error fetching accounts:', error.response?.data || error.message);
    throw error;
  }
};

export const getLocations = async (accessToken, accountName) => {
  try {
    // accountName format: "accounts/{accountId}"
    // We request specific fields using readMask to get categories and services
    const response = await axios.get(`${INFO_API_URL}/${accountName}/locations`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        readMask: 'name,title,categories,serviceItems,metadata',
      }
    });
    return response.data.locations || [];
  } catch (error) {
    console.error('Error fetching locations:', error.response?.data || error.message);
    throw error;
  }
};

export const getReviews = async (accessToken, locationName) => {
  try {
    // locationName format: "accounts/{accountId}/locations/{locationId}"
    // v4 API is used for reviews as per spec
    const response = await axios.get(`${REVIEW_API_URL}/${locationName}/reviews`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        pageSize: 50, // Batch size
        orderBy: 'createTime desc' // Newest first
      }
    });
    return response.data.reviews || [];
  } catch (error) {
    console.error('Error fetching reviews:', error.response?.data || error.message);
    throw error;
  }
};

export const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await axios.post(OAUTH_URL, {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error.response?.data || error.message);
    throw error;
  }
};