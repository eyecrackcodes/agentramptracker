import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");
    const teamId = searchParams.get("teamId");
    const excludeArchived = searchParams.get("excludeArchived") === "true";
    const headers = request.headers;

    // Check for admin request to fetch all metrics
    const isFetchAllRequest =
      request.headers.get("x-fetch-all") === "true" && agentId === "all";

    // Create a where clause for filtering
    const whereClause: any = {};

    if (agentId && agentId !== "all") {
      whereClause.agentId = agentId;
    } else if (teamId) {
      whereClause.agent = {
        teamId,
      };
    }

    // Filter out archived agents if requested
    if (excludeArchived) {
      whereClause.agent = {
        ...whereClause.agent,
        status: { not: "A" },
      };
    }

    const metrics = await prisma.metric.findMany({
      where: whereClause,
      include: {
        agent: {
          include: {
            team: true,
          },
        },
      },
      orderBy: [{ month: "desc" }, { week: "desc" }],
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      agentId,
      year,
      month,
      week,
      closeRate,
      averagePremium,
      placeRate,
      capScore,
      leadsPerDay,
    } = body;

    // Validate required fields
    if (!agentId || year === undefined || month === undefined || week === undefined) {
      return NextResponse.json(
        { error: "Agent ID, year, month, and week are required" },
        { status: 400 }
      );
    }

    // Check if metric already exists for this agent, year, month, and week
    const existingMetric = await prisma.metric.findFirst({
      where: {
        agentId,
        year,
        month,
        week,
      },
    });

    if (existingMetric) {
      // Update existing metric
      const updatedMetric = await prisma.metric.update({
        where: { id: existingMetric.id },
        data: {
          closeRate,
          averagePremium,
          placeRate,
          capScore,
          leadsPerDay,
        },
      });

      return NextResponse.json(updatedMetric);
    }

    // Create new metric
    const metric = await prisma.metric.create({
      data: {
        agentId,
        year,
        month,
        week,
        closeRate,
        averagePremium,
        placeRate,
        capScore,
        leadsPerDay,
      },
    });

    return NextResponse.json(metric);
  } catch (error) {
    console.error("Error creating metric:", error);
    return NextResponse.json(
      { error: "Failed to create metric" },
      { status: 500 }
    );
  }
}
