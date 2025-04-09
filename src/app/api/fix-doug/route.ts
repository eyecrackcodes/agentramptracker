import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Find Doug Curtright using findMany instead of findFirst
    const dougAgents = await prisma.agent.findMany({
      where: {
        firstName: "Doug",
        lastName: { contains: "Curt" },
      },
      take: 1, // Limit to one result
    });

    if (!dougAgents || dougAgents.length === 0) {
      return NextResponse.json(
        { error: "Doug Curtright not found" },
        { status: 404 }
      );
    }

    const dougAgent = dougAgents[0];

    // Find Frederick Holguin's team using findMany instead of findFirst
    const frederickTeams = await prisma.team.findMany({
      where: {
        name: { contains: "Frederick" },
      },
      take: 1, // Limit to one result
    });

    if (!frederickTeams || frederickTeams.length === 0) {
      return NextResponse.json(
        { error: "Frederick's team not found" },
        { status: 404 }
      );
    }

    const frederickTeam = frederickTeams[0];

    // Update Doug's team assignment
    const updatedDoug = await prisma.agent.update({
      where: { id: dougAgent.id },
      data: { teamId: frederickTeam.id },
      include: { team: true },
    });

    return NextResponse.json({
      message: "Doug Curtright's team assignment has been fixed",
      previousTeamId: dougAgent.teamId,
      newTeamId: frederickTeam.id,
      agent: updatedDoug,
    });
  } catch (error) {
    console.error("Error fixing Doug's team assignment:", error);
    return NextResponse.json(
      {
        error: "Failed to fix Doug's team assignment",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
