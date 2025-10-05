"use server";

import { db } from "../db/index";
import { Rewards } from "../db/schema";
import { and, desc, eq, like } from "drizzle-orm";

type Reward = typeof Rewards.$inferSelect;
type NewReward = typeof Rewards.$inferInsert;

interface RewardInput {
  projectName: string;
  Contributor_id: string;
  issue: string;
  issue_id: string;
  rewardAmount: number | string;
  date?: string;
  projectDescription?: string;
  projectOwner?: string;
  project_repository?: string;
  transactionHash?: string;
  Contributor?: string;
}

export async function createReward(input: RewardInput) {
  try {
    const {
      projectName,
      Contributor_id,
      issue,
      issue_id,
      rewardAmount,
      date,
      projectDescription,
      projectOwner,
      project_repository,
      transactionHash,
      Contributor,
    } = input;

    if (
      !projectName ||
      !Contributor_id ||
      !issue ||
      !issue_id ||
      !rewardAmount
    ) {
      return {
        success: false,
        error: "Missing required fields for reward creation",
      };
    }

    // Convert rewardAmount to number if it's a string
    const numericReward =
      typeof rewardAmount === "string"
        ? parseFloat(rewardAmount)
        : rewardAmount;

    if (isNaN(numericReward)) {
      return {
        success: false,
        error: "Invalid reward amount",
      };
    }

    const newReward: NewReward = {
      projectName,
      Contributor_id,
      issue,
      issue_id,
      rewardAmount: numericReward,
      date: date || new Date().toISOString(),
      projectDescription,
      projectOwner,
      project_repository,
      transactionHash,
      Contributor,
    };

    const result = await (db as any).insert(Rewards).values(newReward).returning();

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    console.error("Error creating reward:", error);
    return {
      success: false,
      error: "Failed to create reward",
    };
  }
}

export async function getRewards(contributorId?: string, projectName?: string) {
  try {
    let query = db.select().from(Rewards);

    if (contributorId && projectName) {
      query = query.where(
        and(
          eq(Rewards.Contributor_id, contributorId),
          eq(Rewards.projectName, projectName)
        )
      );
    } else if (contributorId) {
      query = query.where(eq(Rewards.Contributor_id, contributorId));
    } else if (projectName) {
      query = query.where(eq(Rewards.projectName, projectName));
    }

    query = query.orderBy(desc(Rewards.date));
    const rewards = await query;

    return {
      success: true,
      data: rewards,
    };
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return {
      success: false,
      error: "Failed to fetch rewards",
    };
  }
}