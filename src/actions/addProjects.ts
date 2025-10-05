"use server";

import { db } from "../db/index";
import { project } from "../db/schema";
import nodemailer, { SendMailOptions } from "nodemailer";
import { eq } from "drizzle-orm";
// Create a more resilient transporter
const createTransporter = () => {
  try {
    return nodemailer.createTransport({
      host: "mail.gdggtbit.in",
      port: 587,
      secure: false,
      auth: {
        user: "openwave@gdggtbit.in",
        pass: "SagarTanav2003#@",
      },
    });
  } catch (error) {
    console.error("Failed to create email transporter:", error);
    // Return a mock transporter that logs instead of sending
    return {
      sendMail: async (options: SendMailOptions) => {
        return { accepted: [], rejected: [], messageId: "mock-id" };
      },
    };
  }
};

const transporter = createTransporter();

export async function addProject({
  email,
  projectName,
  comits,
  languages,
  contributors,
  aiDescription,
  projectOwner,
  shortdes,
  longdis,
  image_url,
  project_repository,
  stars,
  forks,
}: {
  email: string;
  projectName: string;
  comits: number;
  languages: string[];
  contributors: string[];
  aiDescription: string;
  projectOwner: string;
  shortdes: string;
  longdis: string;
  image_url: string;
  project_repository: string;
  stars: number;
  forks: number;
}) {
  try {
    // First insert the project
    try {
      await (db as any).insert(project).values({
        projectName: projectName,
        contributors: contributors,
        aiDescription: aiDescription,
        projectOwner: projectOwner,
        shortdes: shortdes,
        longdis: longdis,
        image_url: image_url,
        project_repository: project_repository,
        languages: languages,
        stars: stars,
        forks: forks,
        comits: comits,
      });
    } catch (dbError) {
      console.error("Database error during project creation:", dbError);
      return {
        success: false,
        error: "Failed to create project in database",
      };
    }

    // Then send email notification
    try {
      const info = await transporter.sendMail({
        from: "openwave@gdggtbit.in",
        to: email,
        subject: "New Project Added on openwave!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">New Project: ${projectName}</h1>
              <p><strong>Project Owner:</strong> ${projectOwner}</p>
              <p><strong>Description:</strong> ${shortdes}</p>
              <p><strong>Repository:</strong> ${project_repository}</p>
              <hr>
              <p>Visit openwave to learn more and start contributing!</p>
          </div>
        `,
      });

      return {
        success: true,
        emailSent: info.accepted.length > 0,
        messageId: info.messageId,
      };
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Return success true because project was created even if email failed
      return {
        success: true,
        emailSent: false,
        error: "Project created but notification email failed",
      };
    }
  } catch (error) {
    console.error("Error in project creation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getProjects(currentUser: string) {

  try {
    // Add error handling for database operations
    try {
      const projectsData = await (db as any).select().from(project).where(eq(project.projectOwner, currentUser));

      return { project: projectsData };
    } catch (dbError) {
      console.error("Database error fetching projects:", dbError);
      // Return empty array instead of failing
      return { project: [] };
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { error: "Internal Server Error", project: [] };
  }
}


export async function getAllProjects() {
  try {
    // Add error handling for database operations
    try {
      const projectsData = await (db as any).select().from(project);

      return { project: projectsData };
    } catch (dbError) {
      console.error("Database error fetching projects:", dbError);
      // Return empty array instead of failing
      return { project: [] };
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { error: "Internal Server Error", project: [] };
  }
}