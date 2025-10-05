"use server";

import { db } from "@/db";
import { wallet, walletTransactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Decimal from "decimal.js";

// Type inference
type WalletTransaction = typeof walletTransactions.$inferSelect;
type NewWalletTransaction = typeof walletTransactions.$inferInsert;

interface WalletTransactionsInput {
  username: string;
  amount: string;
  transactionType: "receive" | "withdraw";
  timestamp?: Date;
}

export async function createTransaction({
  username,
  amount,
  transactionType,
  timestamp = new Date(),
}: WalletTransactionsInput) {
  try {
    if (!username || !amount || !transactionType) {
      return { success: false, error: "Missing required fields" };
    }

    const type = transactionType.toLowerCase() as "receive" | "withdraw";
    if (type !== "receive" && type !== "withdraw") {
      return { success: false, error: "Invalid transaction type" };
    }

    const existingWallet = await db
      .select()
      .from(wallet)
      .where(eq(wallet.id, username));

    if (existingWallet.length === 0) {
      return { success: false, error: "Wallet does not exist for this user" };
    }

    const currentBalance = new Decimal(existingWallet[0].walletBalance || "0");
    const amountDecimal = new Decimal(amount);

    let newBalance: Decimal;
    if (type === "receive") {
      newBalance = currentBalance.add(amountDecimal);
    } else {
      // Withdraw
      if (currentBalance.lessThan(amountDecimal)) {
        return { success: false, error: "Insufficient balance" };
      }
      newBalance = currentBalance.sub(amountDecimal);
    }

    // Update wallet balance
    await db
      .update(wallet)
      .set({ walletBalance: newBalance.toString() })
      .where(eq(wallet.id, username));

    // Create transaction record
    const newTransaction: NewWalletTransaction = {
      username,
      amount: amountDecimal.toString(),
      transactionType: type,
      timestamp,
    };

    await db.insert(walletTransactions).values(newTransaction);

    return {
      success: true,
      data: {
        transaction: newTransaction,
        newBalance: newBalance.toString(),
      },
    };
  } catch (err: any) {
    console.error(err);
    return { success: false, error: "Internal server error" };
  }
}

export async function getTransactions(username: string, limit: number = 10) {
  try {
    if (!username) {
      return { success: false, error: "Username is required" };
    }

    const transactions = await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.username, username))
      .orderBy(desc(walletTransactions.timestamp))
      .limit(limit);

    return { success: true, data: transactions };
  } catch (err: any) {
    console.error(err);
    return { success: false, error: "Internal server error" };
  }
}