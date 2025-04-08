import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError, formatApiError } from "@/utils/error-handler";
import { cache } from "@/utils/cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");
    const includeArchived = searchParams.get("includeArchived") === "true";

    // Generate a cache key based on the request parameters
    const cacheKey = `metrics_summary_${teamId || "all"}_${
      includeArchived ? "with_archived" : "active_only"
    }`;

    // Try to get from cache or fetch fresh data
    return NextResponse.json(
      await cache.getOrSet(
        cacheKey,
        async () => {
          // Get all metrics for active agents (exclude archived by default)
          const metrics = await prisma.metric.findMany({
            where: {
              agent: {
                teamId: teamId || undefined,
                // Exclude archived agents (status 'A') unless specifically requested
                status: includeArchived ? undefined : { not: "A" },
              },
            },
            include: {
              agent: {
                select: {
                  teamId: true,
                  status: true,
                  team: {
                    select: {
                      name: true,
                      description: true,
                    },
                  },
                },
              },
            },
          });

          // Get month-by-month trends
          const monthlyMetrics = new Map();

          metrics.forEach((metric) => {
            const month = metric.month;
            if (!monthlyMetrics.has(month)) {
              monthlyMetrics.set(month, []);
            }
            monthlyMetrics.get(month).push(metric);
          });

          const monthlyTrends = Array.from(monthlyMetrics.entries())
            .map(([month, monthMetrics]) => {
              return {
                month,
                closeRate:
                  monthMetrics.reduce((sum, m) => sum + m.closeRate, 0) /
                  monthMetrics.length,
                averagePremium: Math.round(
                  monthMetrics.reduce((sum, m) => sum + m.averagePremium, 0) /
                    monthMetrics.length
                ),
                placeRate:
                  monthMetrics.reduce((sum, m) => sum + m.placeRate, 0) /
                  monthMetrics.length,
                capScore:
                  monthMetrics.reduce((sum, m) => sum + m.capScore, 0) /
                  monthMetrics.length,
                leadsPerDay:
                  monthMetrics.reduce((sum, m) => sum + m.leadsPerDay, 0) /
                  monthMetrics.length,
                count: monthMetrics.length,
              };
            })
            .sort((a, b) => a.month - b.month);

          // Get team performance metrics
          const teamMetrics = new Map();

          metrics.forEach((metric) => {
            const teamId = metric.agent.teamId;
            if (!teamMetrics.has(teamId)) {
              teamMetrics.set(teamId, {
                id: teamId,
                name: metric.agent.team.name,
                description: metric.agent.team.description,
                metrics: [],
              });
            }

            teamMetrics.get(teamId).metrics.push(metric);
          });

          const teamPerformance = Array.from(teamMetrics.values()).map(
            (team) => {
              const teamData = team.metrics;
              return {
                id: team.id,
                name: team.name,
                description: team.description,
                metricsCount: teamData.length,
                averageCloseRate:
                  teamData.reduce((sum, m) => sum + m.closeRate, 0) /
                  teamData.length,
                averagePremium: Math.round(
                  teamData.reduce((sum, m) => sum + m.averagePremium, 0) /
                    teamData.length
                ),
                averagePlaceRate:
                  teamData.reduce((sum, m) => sum + m.placeRate, 0) /
                  teamData.length,
                averageCapScore:
                  teamData.reduce((sum, m) => sum + m.capScore, 0) /
                  teamData.length,
                averageLeadsPerDay:
                  teamData.reduce((sum, m) => sum + m.leadsPerDay, 0) /
                  teamData.length,
              };
            }
          );

          // Overall summary statistics
          const summary = {
            averageCloseRate:
              metrics.reduce((acc, metric) => acc + metric.closeRate, 0) /
                metrics.length || 0,
            averagePremium: Math.round(
              metrics.reduce((acc, metric) => acc + metric.averagePremium, 0) /
                metrics.length || 0
            ),
            totalMetrics: metrics.length,
            highestCloseRate: Math.max(...metrics.map((m) => m.closeRate)),
            highestPremium: Math.round(
              Math.max(...metrics.map((m) => m.averagePremium))
            ),
            avgPlaceRate:
              metrics.reduce((acc, metric) => acc + metric.placeRate, 0) /
                metrics.length || 0,
            avgCapScore:
              metrics.reduce((acc, metric) => acc + metric.capScore, 0) /
                metrics.length || 0,
            avgLeadsPerDay:
              metrics.reduce((acc, metric) => acc + metric.leadsPerDay, 0) /
                metrics.length || 0,
            monthlyTrends,
            teamPerformance,
          };

          return summary;
        },
        // Cache for 5 minutes
        5 * 60 * 1000
      )
    );
  } catch (error) {
    logError(error, "metrics_summary");
    return NextResponse.json(
      formatApiError(error, "Failed to fetch metrics summary"),
      { status: 500 }
    );
  }
}
