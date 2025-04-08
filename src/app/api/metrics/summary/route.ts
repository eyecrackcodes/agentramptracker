import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface MetricData {
  id: string;
  month: number;
  week: number;
  close_rate: number;
  average_premium: number;
  place_rate: number;
  cap_score: number;
  leads_per_day: number;
  agents?: {
    id: string;
    first_name: string;
    last_name: string;
    team_id: string;
    status: string;
  };
}

interface FormattedMetric {
  id: string;
  month: number;
  week: number;
  closeRate: number;
  averagePremium: number;
  placeRate: number;
  capScore: number;
  leadsPerDay: number;
  agent: {
    id?: string;
    firstName?: string;
    lastName?: string;
    teamId?: string;
    status?: string;
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");
    const includeArchived = searchParams.get("includeArchived") === "true";

    console.log("Fetching metrics summary with teamId:", teamId, "includeArchived:", includeArchived);

    // Create a simple metrics summary
    // First, fetch all metrics data
    const { data: metricsData, error } = await prisma.supabase
      .from('metrics')
      .select(`
        id, 
        month, 
        week, 
        close_rate, 
        average_premium, 
        place_rate, 
        cap_score, 
        leads_per_day,
        agents:agent_id (
          id,
          first_name,
          last_name,
          team_id,
          status
        )
      `);
    
    if (error) {
      console.error("Error fetching metrics:", error);
      throw error;
    }
    
    // Filter out archived agents if needed
    let metrics: MetricData[] = metricsData || [];
    if (!includeArchived) {
      metrics = metricsData.filter((m: MetricData) => m.agents?.status !== 'A');
    }
    
    // Filter by team if specified
    if (teamId) {
      metrics = metrics.filter((m: MetricData) => m.agents?.team_id === teamId);
    }
    
    // Format metrics to match Prisma format
    const formattedMetrics: FormattedMetric[] = metrics.map((m: MetricData) => ({
      id: m.id,
      month: m.month,
      week: m.week,
      closeRate: m.close_rate,
      averagePremium: m.average_premium,
      placeRate: m.place_rate,
      capScore: m.cap_score,
      leadsPerDay: m.leads_per_day,
      agent: {
        id: m.agents?.id,
        firstName: m.agents?.first_name,
        lastName: m.agents?.last_name,
        teamId: m.agents?.team_id,
        status: m.agents?.status
      }
    }));
    
    // If no metrics found, return an empty summary
    if (formattedMetrics.length === 0) {
      return NextResponse.json({
        averageCloseRate: 0,
        averagePremium: 0,
        totalMetrics: 0,
        highestCloseRate: 0,
        highestPremium: 0,
        avgPlaceRate: 0,
        avgCapScore: 0,
        avgLeadsPerDay: 0,
        monthlyTrends: [],
        teamPerformance: []
      });
    }
    
    // Calculate simple summary statistics
    const summary = {
      averageCloseRate: 
        formattedMetrics.reduce((acc: number, metric: FormattedMetric) => acc + metric.closeRate, 0) / 
        formattedMetrics.length || 0,
      averagePremium: Math.round(
        formattedMetrics.reduce((acc: number, metric: FormattedMetric) => acc + metric.averagePremium, 0) / 
        formattedMetrics.length || 0
      ),
      totalMetrics: formattedMetrics.length,
      highestCloseRate: Math.max(...formattedMetrics.map((m: FormattedMetric) => m.closeRate || 0)),
      highestPremium: Math.max(...formattedMetrics.map((m: FormattedMetric) => m.averagePremium || 0)),
      avgPlaceRate: 
        formattedMetrics.reduce((acc: number, metric: FormattedMetric) => acc + metric.placeRate, 0) / 
        formattedMetrics.length || 0,
      avgCapScore:
        formattedMetrics.reduce((acc: number, metric: FormattedMetric) => acc + metric.capScore, 0) / 
        formattedMetrics.length || 0,
      avgLeadsPerDay: 
        formattedMetrics.reduce((acc: number, metric: FormattedMetric) => acc + metric.leadsPerDay, 0) / 
        formattedMetrics.length || 0,
      monthlyTrends: [],
      teamPerformance: []
    };
    
    // Return the summary
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error generating metrics summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics summary" },
      { status: 500 }
    );
  }
}
