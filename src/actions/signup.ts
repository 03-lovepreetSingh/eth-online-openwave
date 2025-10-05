"use server";

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface SignupData {
  id: string;
  email: string;
  fullName?: string;
  metaMask?: string;
  image_url?: string;
  Location?: string;
  Bio?: string;
  Telegram?: string;
  Twitter?: string;
  Linkedin?: string;
  skills?: string[];
  termsAccepted?: boolean;
  formFilled?: boolean;
}

export async function createUser(userData: SignupData) {
  try {
    // Insert user into database
    await db.insert(users).values({
      id: userData.id,
      email: userData.email,
      fullName: userData.fullName,
      image_url: userData.image_url,
      metaMask: userData.metaMask,
      formFilled: userData.formFilled || true, // Default to true if not provided
      Location: userData.Location,
      Bio: userData.Bio,
      Telegram: userData.Telegram,
      Twitter: userData.Twitter,
      Linkedin: userData.Linkedin,
      skills: userData.skills || undefined,
      termsAccepted: userData.termsAccepted
    });

    return {
      success: true,
      message: 'User signed up successfully'
    };
  } catch (error) {
    console.error('Error in signup process:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function getAllUsers() {
  try {
    const usersData = await db.select().from(users);
    return { success: true, data: usersData };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: 'Failed to fetch users' };
  }
}