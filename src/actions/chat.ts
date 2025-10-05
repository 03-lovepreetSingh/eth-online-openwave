"use server";

import { db } from "../db/index";
import { messages } from "../db/schema";
import { eq, and, or, desc, gt, lt } from "drizzle-orm";

interface MessageData {
  from: string;
  text: string;
  timestamp: string;
  to: string;
}

export async function sendMessage({ from, text, timestamp, to }: MessageData) {
  try {
    const parsedTimestamp = new Date(timestamp);
    await db.insert(messages).values({
      sender_id: from,
      reciever_id: to,
      timestamp: parsedTimestamp,
      text: text,
    });
    return { success: true, data: "Success" };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error };
  }
}

export async function getMessages({
  username,
  cursor,
  pageSize = 50,
  selectedUser = null
}: {
  username: string;
  cursor?: string | null;
  pageSize?: number;
  selectedUser?: string | null;
}) {
  try {
    if (!username) {
      return { success: false, error: "Username is required" };
    }

    // Build the where condition
    const whereConditions = [
      selectedUser ? 
        or(
          and(eq(messages.sender_id, username), eq(messages.reciever_id, selectedUser)),
          and(eq(messages.sender_id, selectedUser), eq(messages.reciever_id, username))
        ) :
        or(eq(messages.sender_id, username), eq(messages.reciever_id, username))
    ];

    // Add cursor condition if provided (for pagination)
    if (cursor) {
      whereConditions.push(lt(messages.timestamp, new Date(cursor)));
    }

    // Execute the query with pagination
    const messagesData = await db
      .select()
      .from(messages)
      .where(and(...whereConditions))
      .orderBy(desc(messages.timestamp))
      .limit(pageSize);

    // Get the next cursor
    const nextCursor = messagesData.length > 0 
      ? messagesData[messagesData.length - 1].timestamp.toISOString() 
      : null;

    return { 
      success: true, 
      messages: messagesData,
      nextCursor,
      hasMore: messagesData.length === pageSize
    };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { success: false, error };
  }
}