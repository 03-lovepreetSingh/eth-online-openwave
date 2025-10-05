"use server";

import { cookies } from 'next/headers';

export async function checkSessionCookie() {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('authjs.session-token');
    
    return { 
      success: true,
      exists: !!sessionToken 
    };
  } catch (error) {
    console.error('Error checking session cookie:', error);
    return { 
      success: false,
      exists: false,
      error: 'Failed to check session cookie' 
    };
  }
}