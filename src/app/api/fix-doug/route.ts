import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Find Doug Curtright
    const dougAgent = await prisma.agent.findFirst({
      where: {
        firstName: "Doug",
        lastName: { contains: "Curt" },
      },
    });

    if (!dougAgent) {
      return NextResponse.json({ error: "Doug Curtright not found" }, { status: 404 });
    }

    // Find Frederick Holguin's team
    const frederickTeam = await prisma.team.findFirst({
      where: {
        name: { contains: "Frederick" },
      },
    });

    if (!frederickTeam) {
      return NextResponse.json({ error: "Frederick's team not found" }, { status: 404 });
    }

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
      agent: updatedDoug
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