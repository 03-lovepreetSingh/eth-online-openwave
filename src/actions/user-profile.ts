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

    return { success: true, user };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

export async function updateUserProfile({
  username,
  fullName,
  image_url,
  metaMask,
  Location,
  Bio,
  Telegram,
  Twitter,
  Linkedin,
  skills
}: {
  username: string;
  fullName?: string;
  image_url?: string;
  metaMask?: string;
  Location?: string;
  Bio?: string;
  Telegram?: string;
  Twitter?: string;
  Linkedin?: string;
  skills?: string[];
}) {
  try {
    if (!username) {
      return { success: false, error: "Username is required" };
    }

    const updateData: any = {};
    
    if (fullName !== undefined) updateData.fullName = fullName;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (metaMask !== undefined) updateData.metaMask = metaMask;
    if (Location !== undefined) updateData.Location = Location;
    if (Bio !== undefined) updateData.Bio = Bio;
    if (Telegram !== undefined) updateData.Telegram = Telegram;
    if (Twitter !== undefined) updateData.Twitter = Twitter;
    if (Linkedin !== undefined) updateData.Linkedin = Linkedin;
    if (skills !== undefined) updateData.skills = skills;
    
    // Mark form as filled if this is a complete profile update
    if (Object.keys(updateData).length > 0) {
      updateData.formFilled = true;
    }

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, username));

    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: "Internal Server Error" };
  }
}