import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This is a placeholder API route - you can implement authentication 
// using Supabase Auth later if needed

export async function GET() {
  try {
    // For now, we'll just return all agents from our Supabase database
    // Later you can implement proper authentication
    const agents = await prisma.agent.findMany({
      include: {
        team: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    return NextResponse.json(agents);
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // For now, we'll just create a new agent
    // Later you can implement proper authentication
    const body = await request.json();
    const { firstName, lastName, email, teamId, startDate } = body;

    if (!firstName || !lastName || !email || !teamId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const agent = await prisma.agent.create({
      data: {
        firstName,
        lastName,
        email,
        teamId,
        startDate: startDate ? new Date(startDate) : new Date(),
        status: "P", // Default to Performance
      },
      include: {
        team: true,
      },
    });

    return NextResponse.json(agent);
  } catch (error) {
    console.error("Error creating agent:", error);
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    );
  }
}
