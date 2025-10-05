import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
import { project } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { projectName, maintainerUserIds, action = 'replace' } = body;

        // Validation code
        if (!projectName) {
            return NextResponse.json(
                { error: 'projectName is required' }, 
                { status: 400 }
            );
        }

        if (!maintainerUserIds || !Array.isArray(maintainerUserIds)) {
            return NextResponse.json(
                { error: 'maintainerUserIds must be an array' }, 
                { status: 400 }
            );
        }

        // Validate that all maintainerUserIds are strings
        const invalidIds = maintainerUserIds.filter(id => typeof id !== 'string' || id.trim() === '');
        if (invalidIds.length > 0) {
            return NextResponse.json(
                { error: 'All maintainer user IDs must be non-empty strings' }, 
                { status: 400 }
            );
        }

        // Get existing project - use consistent field for querying
        const existingProject = await db
            .select()
            .from(project)
            .where(eq(project.project_repository, projectName))
            .limit(1);

        if (existingProject.length === 0) {
            return NextResponse.json(
                { error: 'Project not found' }, 
                { status: 404 }
            );
        }

        const existingMaintainers = existingProject[0].maintainerUserIds || [] as string[];
        let finalMaintainers;

        switch (action) {
            case 'append':
                // Add new maintainers, avoid duplicates
                finalMaintainers = [...new Set([...existingMaintainers as string[], ...maintainerUserIds])];
                break;
            case 'remove':
                // Remove specified maintainers
                finalMaintainers = (existingMaintainers as string[]).filter((id: string) => !maintainerUserIds.includes(id));
                break;
            case 'replace':
            default:
                // Replace entire array
                finalMaintainers = maintainerUserIds;
                break;
        }

        // Update the project - use consistent field
        const updatedProject = await db
            .update(project)
            .set({ 
                maintainerUserIds: finalMaintainers
            })
            .where(eq(project.project_repository, projectName))
            .returning();

        return NextResponse.json({
            message: `Project maintainers ${action}d successfully`,
            project: updatedProject[0],
            action: action
        }, { status: 200 });

    } catch (error) {
        console.error('Error updating project maintainers:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' }, 
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const projectName = url.searchParams.get('projectName');

        if (!projectName) {
            return NextResponse.json(
                { error: 'projectName is required' }, 
                { status: 400 }
            );
        }

        const projects = await db
            .select({
                maintainerUserIds: project.maintainerUserIds
            })
            .from(project)
            .where(eq(project.project_repository, projectName))
            .limit(1);

        if (projects.length === 0) {
            return NextResponse.json(
                { error: 'Project not found' }, 
                { status: 404 }
            );
        }

        return NextResponse.json({
            maintainerUserIds: projects[0].maintainerUserIds || []
        });

    } catch (error) {
        console.error('Error fetching project maintainers:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' }, 
            { status: 500 }
        );
    }
}