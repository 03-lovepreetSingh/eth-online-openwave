"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserProfile(username: string) {
  try {
    if (!username) {
      return { success: false, error: "Username is required" };
    }

    const user = await db.select({
      id: users.id,
      maintainerWallet: users.maintainerWallet,
      fullName: users.fullName,
      image_url: users.image_url,
      metaMask: users.metaMask,
      email: users.email,
      Location: users.Location,
      Bio: users.Bio,
      Telegram: users.Telegram,
      Twitter: users.Twitter,
      Linkedin: users.Linkedin,
      rating: users.rating,
      skills: users.skills,
      formFilled: users.formFilled
    }).from(users).where(eq(users.id, username));
    
    if (!user || user.length === 0) {
      return { success: false, error: "User not found" };
    }

    return { success: true, data: user[0] };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

export async function getUserProfileById(username: string) {
  try {
    if (!username) {
      return { success: false, error: "Username is required" };
    }

    const user = await db.select({
      id: users.id,
      fullName: users.fullName,
      maintainerWallet: users.maintainerWallet,
      image_url: users.image_url,
      metaMask: users.metaMask,
      email: users.email,
      Location: users.Location,
      Bio: users.Bio,
      Telegram: users.Telegram,
      Twitter: users.Twitter,
      Linkedin: users.Linkedin,
      rating: users.rating,
      skills: users.skills,
      formFilled: users.formFilled
    }).from(users).where(eq(users.id, username));

    if (!user || user.length === 0) {
      return { success: false, error: "User not found" };
    }

    return { success: true, data: user[0] };
  } catch (error) {
    console.error("Error fetching user profile by ID:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

export async function updateUserProfile(
  username: string,
  profileData: {
    fullName?: string;
    maintainerWallet?: string;
    image_url?: string;
    metaMask?: string;
    email?: string;
    location?: string;
    bio?: string;
    telegram?: string;
    twitter?: string;
    linkedin?: string;
    rating?: number;
    skills?: string[];
    formFilled?: boolean;
  }
) {
  try {
    if (!username) {
      return { success: false, error: "Username is required" };
    }

    await db
      .update(users)
      .set({
        fullName: profileData.fullName || undefined,
        maintainerWallet: profileData.maintainerWallet || undefined,
        image_url: profileData.image_url || undefined,
        metaMask: profileData.metaMask || undefined,
        email: profileData.email || undefined,
        Location: profileData.location || undefined,
        Bio: profileData.bio || undefined,
        Telegram: profileData.telegram || undefined,
        Twitter: profileData.twitter || undefined,
        Linkedin: profileData.linkedin || undefined,
        rating: profileData.rating || undefined,
        skills: profileData.skills || undefined,
        formFilled: profileData.formFilled !== undefined ? profileData.formFilled : true,
      })
      .where(eq(users.id, username));

    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: "Internal Server Error" };
  }
}