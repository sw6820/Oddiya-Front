// API Configuration
// Handles different endpoints for development vs production

const isDevelopment = process.env.NODE_ENV === 'development';

export const API_CONFIG = {
  // Base API URL
  baseUrl: isDevelopment 
    ? 'http://localhost:8080/api'  // Backend runs on 8080
    : process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://api.oddiya.com',
  
  // Individual endpoints (matching backend controllers)
  endpoints: {
    // Video rendering endpoints (local Next.js API routes)
    renderVideo: '/render-video',
    travelPhotos: '/travel-photos',
    lambdaRender: '/lambda/render',
    lambdaProgress: '/lambda/progress',
    
    // Backend API endpoints
    auth: '/v1/auth',
    places: '/v1/places',
    travelPlans: '/v1/travel-plans',
    ai: '/v1/ai/travel-plans',
    upload: '/v1/files/upload',
    health: '/v1/health',
  },
  
  // CloudFront URL for assets
  cdnUrl: process.env.NEXT_PUBLIC_CLOUDFRONT_URL || '',
  
  // Helper to get full URL
  getUrl(endpoint: keyof typeof API_CONFIG.endpoints): string {
    return `${this.baseUrl}${this.endpoints[endpoint]}`;
  }
};

// Helper function for API calls
export async function apiCall<T>(
  endpoint: keyof typeof API_CONFIG.endpoints,
  options?: RequestInit
): Promise<T> {
  const url = API_CONFIG.getUrl(endpoint);
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  
  return response.json();
}