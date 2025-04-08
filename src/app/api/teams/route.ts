import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  console.log("GET /api/teams - Fetching teams");
  try {
    const teams = await prisma.team.findMany({
      include: {
        agents: {
          include: {
            call_scores: {
              orderBy: {
                call_date: 'desc'
              },
              take: 1
            },
            coaching_sessions: {
              orderBy: {
                session_date: 'desc'
              },
              take: 1
            },
            development_goals: {
              where: {
                status: 'IN_PROGRESS'
              }
            }
          }
        }
      }
    });
    console.log(`GET /api/teams - Successfully fetched ${teams.length} teams`);
    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      {
        error: "Failed to fetch teams",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log("POST /api/teams - Creating new team");
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 }
      );
    }

    const team = await prisma.team.create({
      data: {
        name,
        description,
      },
    });

    console.log(
      `POST /api/teams - Successfully created team with ID: ${team.id}`
    );
    return NextResponse.json(team);
  } catch (error) {
    console.error("Error creating team:", error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      {
        error: "Failed to create team",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
