"use server";

import { db } from '@/db';
import { contributorApplications } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface ContributorApplicationInput {
  username: string;
  projectName?: string | null;
  name: string;
  email: string;
  bio?: string | null;
  whyContribute?: string | null;
  exampleProjects?: string | null;
  languages?: string[];
  frameworks?: string[];
  tools?: string[];
  otherSkills?: string | null;
  experienceMatrix?: Record<string, any>;
  resumeUrl?: string | null;
  samplePatchesUrl?: string | null;
  sshPublicKey?: string | null;
  prLinks?: string | null;
  accessLevel?: string | null;
  ndaAgreement?: boolean;
  twoFactorEnabled?: boolean;
  earliestStartDate?: string | null;
  codeOfConductAgreed?: boolean;
  contributionGuidelinesAgreed?: boolean;
  fullName?: string | null;
  signatureDate?: string | null;
}

export async function submitContributorApplication(formData: ContributorApplicationInput) {
  try {
    // Validate required fields
    if (!formData.name || !formData.email) {
      return {
        success: false,
        error: 'Name and email are required'
      };
    }

    // Insert contributor application into database
    const result = await db.insert(contributorApplications).values({
      username: formData.username,
      projectName: formData.projectName || null,
      name: formData.name,
      email: formData.email,
      bio: formData.bio || null,
      whyContribute: formData.whyContribute || null,
      exampleProjects: formData.exampleProjects || null,
      languages: formData.languages || [],
      frameworks: formData.frameworks || [],
      tools: formData.tools || [],
      otherSkills: formData.otherSkills || null,
      experienceMatrix: formData.experienceMatrix || {},
      resumeUrl: formData.resumeUrl || null,
      samplePatchesUrl: formData.samplePatchesUrl || null,
      sshPublicKey: formData.sshPublicKey || null,
      prLinks: formData.prLinks || null,
      accessLevel: formData.accessLevel || null,
      ndaAgreement: formData.ndaAgreement || false,
      twoFactorEnabled: formData.twoFactorEnabled || false,
      earliestStartDate: formData.earliestStartDate || null,
      codeOfConductAgreed: formData.codeOfConductAgreed || false,
      contributionGuidelinesAgreed: formData.contributionGuidelinesAgreed || false,
      fullName: formData.fullName || null,
      signatureDate: formData.signatureDate || null,
      status: 'pending'
    }).returning();

    return {
      success: true,
      message: 'Contributor application submitted successfully',
      applicationId: result[0]?.id
    };
  } catch (error: any) {
    if (error.code === '23505') { // PostgreSQL unique violation error code
      return {
        success: false,
        error: error.message || 'You have already submitted an application for this project.'
      };
    } else {
      console.error('Error submitting contributor application:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export async function getContributorApplications(projectName: string, username: string) {
  try {
    if (!projectName || !username) {
      return {
        success: false,
        error: 'Project name and username are required'
      };
    }

    const applications = await db
      .select()
      .from(contributorApplications)
      .where(eq(contributorApplications.projectName, projectName))
      .orderBy(contributorApplications.submittedAt);

    return {
      success: true,
      data: applications
    };
  } catch (error) {
    console.error('Error fetching contributor applications:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}