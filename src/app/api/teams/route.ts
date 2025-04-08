import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  console.log("GET /api/teams - Fetching teams");
  try {
    // Check for database connection by trying a lightweight operation
    try {
      // Use a lightweight findMany operation that works with the Supabase adapter
      await prisma.team.findMany({ take: 1 });
      console.log("Database connection test successful");
    } catch (connError) {
      console.error("Database connection test failed:", connError);
      return NextResponse.json(
        {
          error: "Database connection failed",
          details:
            connError instanceof Error ? connError.message : String(connError),
        },
        { status: 500 }
      );
    }

    // Try a simpler query first without related models
    let teams;
    try {
      // First attempt with a simpler query - just teams and agents
      teams = await prisma.team.findMany({
        include: {
          agents: true,
        },
      });
      console.log(
        `GET /api/teams - Successfully fetched ${
          teams.length
        } teams with ${teams.reduce(
          (acc: number, team: any) => acc + (team.agents?.length || 0),
          0
        )} agents`
      );
    } catch (basicQueryError) {
      console.error("Error fetching teams with basic query:", basicQueryError);
      // If even this fails, try fetching just teams without agents
      try {
        teams = await prisma.team.findMany();
        console.log(
          `GET /api/teams - Fallback: fetched ${teams.length} teams without agents`
        );
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        return NextResponse.json(
          {
            error: "Failed to fetch teams",
            details:
              fallbackError instanceof Error
                ? fallbackError.message
                : String(fallbackError),
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error in teams route:", error);
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
