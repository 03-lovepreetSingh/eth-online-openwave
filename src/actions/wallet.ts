"use server";

import { db } from "@/db";
import { wallet } from "@/db/schema";
import { eq } from "drizzle-orm";
import Decimal from "decimal.js";

// Type inference
type Wallet = typeof wallet.$inferSelect;
type NewWallet = typeof wallet.$inferInsert;

// Interface for input
interface WalletInput {
  id: string;
  walletBalance: string;
}

export async function createWallet({ id, walletBalance }: WalletInput) {
  try {
    if (!id) return { success: false, error: "Missing 'id' field" };
    const balance = new Decimal(walletBalance || "0");

    // Check if wallet already exists
    const existing = await db.select().from(wallet).where(eq(wallet.id, id));
    if (existing.length > 0) {
      return { success: false, error: "Wallet already exists" };
    }

    const newWallet: NewWallet = {
      id,
      walletBalance: balance.toString(),
    };

    await db.insert(wallet).values(newWallet);

    return { success: true, data: newWallet };
  } catch (err: any) {
    console.error(err);
    return { success: false, error: "Internal server error" };
  }
}

export async function getWallet(id: string) {
  try {
    if (!id) return { success: false, error: "Missing 'id' field" };

    const result = await db.select().from(wallet).where(eq(wallet.id, id));
    if (result.length === 0) {
      return { success: false, error: "Wallet not found" };
    }

    return { success: true, data: result[0] };
  } catch (err: any) {
    console.error(err);
    return { success: false, error: "Internal server error" };
  }
}

export async function updateWalletBalance({ id, walletBalance }: WalletInput) {
  try {
    if (!id) return { success: false, error: "Missing 'id' field" };
    
    const balance = new Decimal(walletBalance || "0");
    if (balance.isNaN() || balance.isNegative()) {
      return { success: false, error: "Invalid balance amount" };
    }

    // Check if wallet exists
    const existing = await db.select().from(wallet).where(eq(wallet.id, id));
    if (existing.length === 0) {
      return { success: false, error: "Wallet not found" };
    }

    await db.update(wallet)
      .set({ walletBalance: balance.toString() })
      .where(eq(wallet.id, id));

    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { success: false, error: "Internal server error" };
  }
}