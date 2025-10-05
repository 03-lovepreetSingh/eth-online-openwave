"use server";

import { db } from "@/db";
import { hackathons, hack_projects, project_votes, project_split_payments, hackathon_results } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

// Hackathon Actions
export async function createHackathon(formData: {
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  image_url?: string;
  created_by: string;
}) {
  try {
    const hackathon = await db.insert(hackathons).values({
      id: uuidv4(),
      ...formData,
      status: "upcoming",
    }).returning();

    revalidatePath("/hacks");
    return { success: true, hackathon: hackathon[0] };
  } catch (error) {
    console.error("Error creating hackathon:", error);
    return { success: false, error: "Failed to create hackathon" };
  }
}

export async function getAllHackathons() {
  try {
    const allHackathons = await db.select().from(hackathons).orderBy(hackathons.created_at);
    return { success: true, hackathons: allHackathons };
  } catch (error) {
    console.error("Error fetching hackathons:", error);
    return { success: false, error: "Failed to fetch hackathons" };
  }
}

export async function getHackathonById(id: string) {
  try {
    const hackathon = await db.select().from(hackathons).where(eq(hackathons.id, id));
    if (hackathon.length === 0) {
      return { success: false, error: "Hackathon not found" };
    }
    return { success: true, hackathon: hackathon[0] };
  } catch (error) {
    console.error("Error fetching hackathon:", error);
    return { success: false, error: "Failed to fetch hackathon" };
  }
}

// Hack Project Actions
export async function createHackProject(formData: {
  hackathon_id: string;
  project_name: string;
  description: string;
  repository: string;
  image_url?: string;
  owner_id: string;
  team_members: any[];
  tech_stack: string[];
  contract_address?: string;
}) {
  try {
    const project = await db.insert(hack_projects).values({
      id: uuidv4(),
      ...formData,
    }).returning();

    revalidatePath("/hacks");
    revalidatePath(`/hacks/${formData.hackathon_id}`);
    return { success: true, project: project[0] };
  } catch (error) {
    console.error("Error creating hack project:", error);
    return { success: false, error: "Failed to create hack project" };
  }
}

export async function getHackProjectsByHackathon(hackathonId: string) {
  try {
    const projects = await db.select().from(hack_projects).where(eq(hack_projects.hackathon_id, hackathonId));
    return { success: true, projects };
  } catch (error) {
    console.error("Error fetching hack projects:", error);
    return { success: false, error: "Failed to fetch hack projects" };
  }
}

export async function getHackProjectById(id: string) {
  try {
    const project = await db.select().from(hack_projects).where(eq(hack_projects.id, id));
    if (project.length === 0) {
      return { success: false, error: "Project not found" };
    }
    return { success: true, project: project[0] };
  } catch (error) {
    console.error("Error fetching hack project:", error);
    return { success: false, error: "Failed to fetch hack project" };
  }
}

// Voting Actions
export async function castVote(formData: {
  project_id: string;
  voter_id: string;
  vote_type: "contributor" | "maintainer";
}) {
  try {
    // Check if user already voted for this project
    const existingVote = await db.select()
      .from(project_votes)
      .where(and(
        eq(project_votes.project_id, formData.project_id),
        eq(project_votes.voter_id, formData.voter_id)
      ));

    if (existingVote.length > 0) {
      // Update existing vote
      await db.update(project_votes)
        .set({ vote_type: formData.vote_type })
        .where(and(
          eq(project_votes.project_id, formData.project_id),
          eq(project_votes.voter_id, formData.voter_id)
        ));
    } else {
      // Create new vote
      await db.insert(project_votes).values({
        id: uuidv4(),
        ...formData,
      });
    }

    revalidatePath(`/hacks/project/${formData.project_id}`);
    return { success: true };
  } catch (error) {
    console.error("Error casting vote:", error);
    return { success: false, error: "Failed to cast vote" };
  }
}

export async function getProjectVotes(projectId: string) {
  try {
    const votes = await db.select().from(project_votes).where(eq(project_votes.project_id, projectId));
    
    const contributorVotes = votes.filter(vote => vote.vote_type === "contributor").length;
    const maintainerVotes = votes.filter(vote => vote.vote_type === "maintainer").length;
    
    return { 
      success: true, 
      votes,
      contributorVotes,
      maintainerVotes,
      totalVotes: votes.length
    };
  } catch (error) {
    console.error("Error fetching project votes:", error);
    return { success: false, error: "Failed to fetch project votes" };
  }
}

export async function getUserVoteForProject(projectId: string, userId: string) {
  try {
    const vote = await db.select()
      .from(project_votes)
      .where(and(
        eq(project_votes.project_id, projectId),
        eq(project_votes.voter_id, userId)
      ));

    return { success: true, vote: vote[0] || null };
  } catch (error) {
    console.error("Error fetching user vote:", error);
    return { success: false, error: "Failed to fetch user vote" };
  }
}

// Split Payment Actions
export async function createSplitPayment(formData: {
  project_id: string;
  total_amount: string;
  contributor_share: string;
  maintainer_share: string;
  transaction_hash?: string;
}) {
  try {
    const payment = await db.insert(project_split_payments).values({
      id: uuidv4(),
      ...formData,
    }).returning();
    
    revalidatePath(`/hacks/project/${formData.project_id}`);
    return { success: true, payment: payment[0] };
  } catch (error) {
    console.error("Error creating split payment:", error);
    return { success: false, error: "Failed to create split payment" };
  }
}

export async function getProjectSplitPayments(projectId: string) {
  try {
    const payments = await db.select()
      .from(project_split_payments)
      .where(eq(project_split_payments.project_id, projectId));
    
    return { success: true, payments };
  } catch (error) {
    console.error("Error fetching split payments:", error);
    return { success: false, error: "Failed to fetch split payments" };
  }
}

export async function updateSplitPaymentStatus(paymentId: string, status: string, transactionHash?: string) {
  try {
    const updateData: any = { status };
    if (transactionHash) {
      updateData.transaction_hash = transactionHash;
    }

    await db.update(project_split_payments)
      .set(updateData)
      .where(eq(project_split_payments.id, paymentId));

    revalidatePath("/hacks");
    return { success: true };
  } catch (error) {
    console.error("Error updating split payment status:", error);
    return { success: false, error: "Failed to update split payment status" };
  }
}

// Dashboard Statistics
export async function getHacksDashboardStats() {
  try {
    const [hackathonCount] = await db.select({ count: sql<number>`count(*)` }).from(hackathons);
    const [projectCount] = await db.select({ count: sql<number>`count(*)` }).from(hack_projects);
    const [voteCount] = await db.select({ count: sql<number>`count(*)` }).from(project_votes);
    const [paymentCount] = await db.select({ count: sql<number>`count(*)` }).from(project_split_payments);

    return {
      success: true,
      stats: {
        totalHackathons: hackathonCount.count,
        totalProjects: projectCount.count,
        totalVotes: voteCount.count,
        totalPayments: paymentCount.count,
      }
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { success: false, error: "Failed to fetch dashboard stats" };
  }
}

// Results Actions
export async function createOrUpdateHackathonResult(formData: {
  hackathon_id: string;
  project_id: string;
  final_rank?: number;
  total_votes: number;
  yes_votes: number;
  no_votes: number;
  approval_percentage: number;
  voting_status: "pending" | "approved" | "rejected";
  total_funding?: string;
  contributors_funding?: string;
  maintainers_funding?: string;
  award_category?: string;
  judge_feedback?: string;
  demo_url?: string;
  presentation_url?: string;
  final_score?: string;
  metrics?: any;
}) {
  try {
    // Check if result already exists
    const existingResult = await db
      .select()
      .from(hackathon_results)
      .where(
        and(
          eq(hackathon_results.hackathon_id, formData.hackathon_id),
          eq(hackathon_results.project_id, formData.project_id)
        )
      )
      .limit(1);

    if (existingResult.length > 0) {
      // Update existing result
      const [updatedResult] = await db
        .update(hackathon_results)
        .set({
          ...formData,
          approval_percentage: formData.approval_percentage.toString(),
          updated_at: sql`now()`
        })
        .where(eq(hackathon_results.id, existingResult[0].id))
        .returning();

      revalidatePath("/hacks/results");
      return { success: true, result: updatedResult };
    } else {
      // Create new result
      const [newResult] = await db
        .insert(hackathon_results)
        .values({
          id: uuidv4(),
          ...formData,
          approval_percentage: formData.approval_percentage.toString(),
        })
        .returning();

      revalidatePath("/hacks/results");
      return { success: true, result: newResult };
    }
  } catch (error) {
    console.error("Error creating/updating hackathon result:", error);
    return { success: false, error: "Failed to create/update result" };
  }
}

export async function getHackathonResults(hackathon_id?: string) {
  try {
    const query = db
      .select({
        result: hackathon_results,
        hackathon: hackathons,
        project: hack_projects,
      })
      .from(hackathon_results)
      .leftJoin(hackathons, eq(hackathon_results.hackathon_id, hackathons.id))
      .leftJoin(hack_projects, eq(hackathon_results.project_id, hack_projects.id));

    const results = hackathon_id 
      ? await query.where(eq(hackathon_results.hackathon_id, hackathon_id))
      : await query;

    return { success: true, results };
  } catch (error) {
    console.error("Error fetching hackathon results:", error);
    return { success: false, error: "Failed to fetch results" };
  }
}

export async function calculateAndUpdateResults(hackathon_id: string) {
  try {
    // Get all projects for this hackathon
    const projects = await db
      .select()
      .from(hack_projects)
      .where(eq(hack_projects.hackathon_id, hackathon_id));

    for (const project of projects) {
      // Get vote counts for this project
      const votes = await db
        .select()
        .from(project_votes)
        .where(eq(project_votes.project_id, project.id));

      const totalVotes = votes.length;
      const yesVotes = votes.filter(vote => vote.vote_type === "yes").length;
      const noVotes = votes.filter(vote => vote.vote_type === "no").length;
      const approvalPercentage = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0;

      // Determine voting status (require 5 votes minimum for quorum)
      let votingStatus: "pending" | "approved" | "rejected" = "pending";
      if (totalVotes >= 5) {
        votingStatus = approvalPercentage >= 60 ? "approved" : "rejected";
      }

      // Get funding information
      const splitPayments = await db
        .select()
        .from(project_split_payments)
        .where(eq(project_split_payments.project_id, project.id));

      const totalFunding = splitPayments.reduce((sum, payment) => 
        sum + parseFloat(payment.total_amount || "0"), 0
      );
      const contributorsFunding = splitPayments.reduce((sum, payment) => 
        sum + parseFloat(payment.contributor_share || "0"), 0
      );
      const maintainersFunding = splitPayments.reduce((sum, payment) => 
        sum + parseFloat(payment.maintainer_share || "0"), 0
      );

      // Create or update result
      await createOrUpdateHackathonResult({
        hackathon_id,
        project_id: project.id,
        total_votes: totalVotes,
        yes_votes: yesVotes,
        no_votes: noVotes,
        approval_percentage: approvalPercentage,
        voting_status: votingStatus,
        total_funding: totalFunding.toString(),
        contributors_funding: contributorsFunding.toString(),
        maintainers_funding: maintainersFunding.toString(),
      });
    }

    // Rank approved projects by approval percentage
    const approvedResults = await db
      .select()
      .from(hackathon_results)
      .where(
        and(
          eq(hackathon_results.hackathon_id, hackathon_id),
          eq(hackathon_results.voting_status, "approved")
        )
      );

    // Sort by approval percentage and assign ranks
    const sortedResults = approvedResults.sort((a, b) => 
      parseFloat(b.approval_percentage || "0") - parseFloat(a.approval_percentage || "0")
    );

    for (let i = 0; i < sortedResults.length; i++) {
      await db
        .update(hackathon_results)
        .set({ 
          final_rank: i + 1,
          updated_at: sql`now()`
        })
        .where(eq(hackathon_results.id, sortedResults[i].id));
    }

    revalidatePath("/hacks/results");
    return { success: true, message: "Results calculated and updated successfully" };
  } catch (error) {
    console.error("Error calculating results:", error);
    return { success: false, error: "Failed to calculate results" };
  }
}