import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
import { users } from '../../../db/schema';

import { eq ,or } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
        const { compare } = await request.json();

        if (!compare) {
            return NextResponse.json({ error: 'Missing compare parameter' }, { status: 400 });
        }

        const usersData = await db.select().from(users).where(eq(users.id, compare));
        return NextResponse.json({ users: usersData });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const maintainerParam = searchParams.get("mainatiner");

    if (!maintainerParam) {
        return NextResponse.json({ error: 'Missing mainatiner parameter' }, { status: 400 });
    }

    try {
        // Parse the maintainer parameter - it could be a single ID or a JSON array
        let maintainerIds: string[];
        
        try {
            // Try to parse as JSON array first
            maintainerIds = JSON.parse(maintainerParam);
            // Ensure it's an array
            if (!Array.isArray(maintainerIds)) {
                maintainerIds = [maintainerParam];
            }
        } catch {
            // If parsing fails, treat as a single ID
            maintainerIds = [maintainerParam];
        }

        // Filter out empty strings and null values
        maintainerIds = maintainerIds.filter(id => id && id.trim() !== '');

        if (maintainerIds.length === 0) {
            return NextResponse.json({ users: [] });
        }

        // Build the query with OR conditions for multiple IDs
        let query;
        if (maintainerIds.length === 1) {
            query = db.select().from(users).where(eq(users.id, maintainerIds[0]));
        } else {
            // Create OR conditions for multiple maintainer IDs
            const orConditions = maintainerIds.map(id => eq(users.id, id));
            query = db.select().from(users).where(or(...orConditions));
        }

        const usersData = await query.execute();
        return NextResponse.json({ users: usersData });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}



