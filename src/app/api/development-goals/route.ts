import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentId, goalType, description, targetDate, status, progress } = body;

    const goal = await prisma.developmentGoal.create({
      data: {
        agent_id: agentId,
        goal_type: goalType,
        description,
        target_date: new Date(targetDate),
        status: status || 'not_started',
        progress: progress || '0',
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Error creating development goal:", error);
    return NextResponse.json(
      { error: "Failed to create development goal" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");

    if (!agentId) {
      return NextResponse.json(
        { error: "Agent ID is required" },
        { status: 400 }
      );
    }

    const goals = await prisma.developmentGoal.findMany({
      where: {
        agent_id: agentId,
      },
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error("Error fetching development goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch development goals" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, progress } = body;

    const goal = await prisma.developmentGoal.update({
      where: { id },
      data: {
        status,
        progress: progress.toString(),
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Error updating development goal:", error);
    return NextResponse.json(
      { error: "Failed to update development goal" },
      { status: 500 }
    );
  }
} 