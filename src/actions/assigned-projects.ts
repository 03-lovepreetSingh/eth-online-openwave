"use server";

import { db } from "@/db";
import { eq } from "drizzle-orm";

export async function getProjectsData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/add-projects`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data: data.project };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

export async function getUserIssues() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/showIssues`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user issues: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data: data.projects };
  } catch (error) {
    console.error("Error fetching user issues:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

export async function getAssignedIssues(contributor: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/getContributions/?contributor=${contributor}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch assigned issues: ${response.statusText}`);
    }

    const data = await response.json();
    const assignedIssues = data.project.filter((issue: any) => issue.status === "assigned") || [];
    return { success: true, data: assignedIssues };
  } catch (error) {
    console.error("Error fetching assigned issues:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

export async function updateIssueStatus(issueId: string, status: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/updateIssueStatus`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issueId, status }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update issue status: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error updating issue status:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

export async function getAllAssignedProjectsData(username: string) {
  try {
    const [projectsResult, userIssuesResult, assignedIssuesResult] = await Promise.all([
      getProjectsData(),
      getUserIssues(),
      getAssignedIssues(username),
    ]);

    if (!projectsResult.success) {
      throw new Error(projectsResult.error);
    }

    if (!userIssuesResult.success) {
      throw new Error(userIssuesResult.error);
    }

    if (!assignedIssuesResult.success) {
      throw new Error(assignedIssuesResult.error);
    }

    return {
      success: true,
      data: {
        projects: projectsResult.data,
        userIssues: userIssuesResult.data,
        assignedIssues: assignedIssuesResult.data,
      },
    };
  } catch (error) {
    console.error("Error fetching all assigned projects data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      data: {
        projects: [],
        userIssues: [],
        assignedIssues: [],
      },
    };
  }
}