'use server';

import { cookies } from 'next/headers';

/**
 * Gets the access token from the HttpOnly cookie
 * This function must be called from a Server Component or Route Handler
 */
export async function getAccessToken(): Promise<string | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('access_token')?.value;
  return token || null;
}

/**
 * Gets the user ID from the JWT token
 * This function must be called from a Server Component or Route Handler
 */
export async function getUserIdFromToken(): Promise<string | null> {
  const token = await getAccessToken();
  
  if (!token) {
    return null;
  }
  
  try {
    // Extract user ID from the JWT token
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      return payload.sub || payload.id || null;
    }
  } catch (error) {
    console.error("Error parsing JWT token:", error);
  }
  
  return null;
} 