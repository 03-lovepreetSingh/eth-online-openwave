"use server";

import { db } from "@/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";

interface Payment {
  amount: string;
  username: string;
}

export async function createPayment({ amount, username }: Payment) {
  try {
    if (!amount) {
      return { success: false, error: "Amount is required" };
    }

    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber)) {
      return { success: false, error: "Invalid amount value" };
    }

    const result = await db.insert(payments).values({
      amount: amountNumber,
      username
    }).returning();

    return {
      success: true,
      message: 'Payment Successful',
      payment: result[0]
    };
  } catch (error) {
    console.error('Error creating payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: `Failed to process payment: ${errorMessage}` };
  }
}

export async function getPaymentsByUsername(username: string) {
  try {
    if (!username) {
      return { success: false, error: "Username is required" };
    }

    const userPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.username, username));

    return {
      success: true,
      payments: userPayments
    };
  } catch (error) {
    console.error('Error fetching payments:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: `Failed to fetch payments: ${errorMessage}` };
  }
}