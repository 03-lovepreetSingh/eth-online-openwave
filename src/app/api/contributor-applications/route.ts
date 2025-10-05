import { NextRequest, NextResponse } from 'next/server';

import { db } from '../../../db/index';
import { contributorApplications } from '../../../db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    // Get session to extract username

    const formData = await request.json();

    // Validate required fields
    if (!formData.name || !formData.email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Insert contributor application into database
    const result = await db.insert(contributorApplications).values({
      username: formData.username, // Auto-filled from session
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
      resumeUrl: formData.resumeUrl || null, // Handle file upload separately
      samplePatchesUrl: formData.samplePatchesUrl || null, // Handle file upload separately
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

    return NextResponse.json({
      success: true,
      message: 'Contributor application submitted successfully',
      applicationId: result[0]?.id
    });

  } catch (error : unknown) {
    if (error instanceof Error && (error as { code?: string }).code === '23505') { // PostgreSQL unique violation error code
      return NextResponse.json(
        { 
          success: false, 
          error: error.message || 'You have already submitted an application for this project.' 
        },
        { status: 400 }

      )
    }
    else{
    console.error('Error submitting contributor application:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
    }
  }
}

// GET endpoint to retrieve applications (for admin/project owners)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectName = searchParams.get('projectName');
    const username = searchParams.get('username');

    if (!projectName || !username) {
      return NextResponse.json(
        { success: false, error: 'Project name or username is required' },
        { status: 400 }
      );
    }

    const applications = await db.select().from(contributorApplications).where(eq(contributorApplications.projectName, projectName)).orderBy(contributorApplications.submittedAt);

    return NextResponse.json({
      success: true,
      applications
    });

  } catch (error) {
    console.error('Error fetching contributor applications:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// PUT endpoint to update application status
export async function PUT(request: Request) {
  try {
    const { applicationId, status } = await request.json();

    if (!applicationId || !status) {
      return NextResponse.json(
        { success: false, error: 'Application ID and status are required' },
        { status: 400 }
      );
    }

    const result = await db
      .update(contributorApplications)
      .set({ status })
      .where(eq(contributorApplications.id, applicationId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Application status updated successfully',
      application: result[0]
    });

  } catch (error) {
    console.error('Error updating contributor application:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { applicationId, status } = await request.json();

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: "Application ID and status are required" },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    await db
      .update(contributorApplications)
      .set({ status })
      .where(eq(contributorApplications.id, applicationId));

    return NextResponse.json({
      success: true,
      message: `Application ${status} successfully`,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { error: "Failed to update application status" },
      { status: 500 }
    );
  }
}