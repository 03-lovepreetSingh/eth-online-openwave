"use server";

import { db } from '../db/index';
import { project } from '../db/schema';
import { eq } from 'drizzle-orm';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "mail.gdggtbit.in",
  port: 587,
  secure: false,
  auth: {
    user: "openwave@gdggtbit.in",
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface ProjectData {
  email?: string;
  projectName: string;
  languages?: string[];
  contributors?: string[];
  aiDescription?: string;
  projectOwner?: string;
  shortdes?: string;
  longdis?: string;
  image_url?: string;
  project_repository: string;
  stars?: number;
  forks?: number;
}

export async function createSpecificRepo(projectData: ProjectData) {
  try {
    // Insert the project
    await db.insert(project).values({
      contributors: projectData.contributors,
      aiDescription: projectData.aiDescription,
      projectOwner: projectData.projectOwner,
      projectName: projectData.projectName,
      shortdes: projectData.shortdes,
      longdis: projectData.longdis,
      image_url: projectData.image_url,
      project_repository: projectData.project_repository,
      languages: projectData.languages,
      stars: projectData.stars,
      forks: projectData.forks,
    });

    // Send email notification if email is provided
    if (projectData.email) {
      try {
        await transporter.sendMail({
          from: '"openwave" <openwave@gdggtbit.in>',
          to: projectData.email,
          subject: "Project Added Successfully",
          text: `Your project ${projectData.projectName} has been added successfully.`,
          html: `<b>Your project ${projectData.projectName} has been added successfully.</b>`,
        });
        
        return {
          success: true,
          emailSent: true,
          message: 'Project added successfully and notification email sent'
        };
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        return {
          success: true,
          emailSent: false,
          message: 'Project added successfully but failed to send notification email'
        };
      }
    }

    return {
      success: true,
      emailSent: false,
      message: 'Project added successfully'
    };
  } catch (error) {
    console.error('Error adding project:', error);
    return { 
      success: false, 
      emailSent: false,
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}