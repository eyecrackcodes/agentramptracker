import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");
    const status = searchParams.get("status");
    const includeMetrics = searchParams.get("includeMetrics") === "true";

    console.log("Fetching agents with teamId:", teamId, "status:", status);

    if (teamId) {
      // First verify team exists
      const team = await prisma.team.findUnique({
        where: { id: teamId },
      });

      if (!team) {
        console.log(`Team with ID ${teamId} not found`);
        return NextResponse.json(
          { error: `Team with ID ${teamId} not found` },
          { status: 404 }
        );
      }
    }

    // Build where clause
    let whereClause: any = {};

    if (teamId) {
      whereClause.teamId = teamId;
    }

    // Filter by status
    if (status === "active") {
      // Active agents (not archived)
      whereClause.status = { not: "A" };
    } else if (status === "archived") {
      // Only archived agents
      whereClause.status = "A";
    } else if (status === "training") {
      // Only training agents
      whereClause.status = "T";
    } else if (status === "performance") {
      // Only performance agents
      whereClause.status = "P";
    }

    const agents = await prisma.agent.findMany({
      where: whereClause,
      include: {
        team: true,
        metrics: includeMetrics,
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });

    console.log(`Found ${agents.length} agents`);
    return NextResponse.json(agents);
  } catch (error) {
    console.error("Failed to fetch agents:", error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      {
        error: "Failed to fetch agents",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      teamId,
      targetLeadsPerDay,
      startDate,
      status,
      tenure,
    } = body;

    if (!firstName || !lastName || !email || !teamId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const agent = await prisma.agent.create({
      data: {
        firstName,
        lastName,
        email,
        teamId,
        targetLeadsPerDay: targetLeadsPerDay || 8,
        startDate: startDate ? new Date(startDate) : new Date(),
        status: status || "P",
        tenure: tenure || null,
      },
      include: {
        team: true,
      },
    });

    return NextResponse.json(agent);
  } catch (error) {
    console.error("Failed to create agent:", error);
    return NextResponse.json(
      {
        error: "Failed to create agent",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
