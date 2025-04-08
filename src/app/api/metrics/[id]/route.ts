import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      month,
      week,
      closeRate,
      averagePremium,
      placeRate,
      capScore,
      leadsPerDay,
    } = body;

    const metric = await prisma.metric.update({
      where: { id: params.id },
      data: {
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
    console.error("Error updating metric:", error);
    return NextResponse.json(
      { error: "Failed to update metric" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.metric.deleteMany({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting metric:", error);
    return NextResponse.json(
      { error: "Failed to delete metric" },
      { status: 500 }
    );
  }
}
