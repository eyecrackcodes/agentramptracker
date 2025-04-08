import { AgentRampMetric, MonthlyTarget, MONTHLY_TARGETS } from "@/types";
import { Metric } from "@prisma/client";

export function getMonthlyTarget(
  monthNumber: number
): MonthlyTarget | undefined {
  return MONTHLY_TARGETS.find((target) => target.monthNumber === monthNumber);
}

export function checkMetricAlerts(
  metric: AgentRampMetric,
  startDate: Date
): string[] {
  const alerts: string[] = [];
  const target = getMonthlyTarget(metric.monthNumber);

  if (!target) return alerts;

  const daysSinceStart = Math.floor(
    (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const shouldCheckPlaceRate = daysSinceStart > 45;

  if (metric.closeRate < target.closeRate) {
    alerts.push(
      `Close rate (${metric.closeRate}%) is below target (${target.closeRate}%)`
    );
  }

  if (metric.avgPremium < target.avgPremium) {
    alerts.push(
      `Average premium ($${metric.avgPremium}) is below target ($${target.avgPremium})`
    );
  }

  if (shouldCheckPlaceRate && metric.placeRate < target.placeRate) {
    alerts.push(
      `Place rate (${metric.placeRate}%) is below target (${target.placeRate}%)`
    );
  }

  if (target.capScore && metric.capScore && metric.capScore < target.capScore) {
    alerts.push(
      `CAP score (${metric.capScore}) is below target (${target.capScore})`
    );
  }

  if (metric.leadsTakenPerDay < 8) {
    alerts.push(
      `Leads taken per day (${metric.leadsTakenPerDay}) is below target (8)`
    );
  }

  return alerts;
}

export function getMetricStatus(
  value: number,
  target: number
): "below" | "meeting" | "exceeding" {
  if (value < target) return "below";
  if (value === target) return "meeting";
  return "exceeding";
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

/**
 * Calculate team averages for metrics
 */
export function calculateTeamAverages(metrics: Metric[]) {
  if (!metrics.length) {
    return {
      closeRate: 0,
      averagePremium: 0,
      placeRate: 0,
      capScore: 0,
      leadsPerDay: 0,
    };
  }

  const totalMetrics = metrics.length;
  const sums = metrics.reduce(
    (acc, metric) => {
      return {
        closeRate: acc.closeRate + metric.closeRate,
        averagePremium: acc.averagePremium + metric.averagePremium,
        placeRate: acc.placeRate + metric.placeRate,
        capScore: acc.capScore + metric.capScore,
        leadsPerDay: acc.leadsPerDay + metric.leadsPerDay,
      };
    },
    {
      closeRate: 0,
      averagePremium: 0,
      placeRate: 0,
      capScore: 0,
      leadsPerDay: 0,
    }
  );

  return {
    closeRate: sums.closeRate / totalMetrics,
    averagePremium: sums.averagePremium / totalMetrics,
    placeRate: sums.placeRate / totalMetrics,
    capScore: sums.capScore / totalMetrics,
    leadsPerDay: sums.leadsPerDay / totalMetrics,
  };
}

/**
 * Get averages based on tenure bracket
 * @param metrics All metrics
 * @param agentTenure Tenure of the agent in months
 */
export function getAveragesByTenureBracket(
  metrics: Metric[],
  agentTenure: number
) {
  // Define tenure brackets (in months)
  const brackets = [
    { min: 0, max: 3, label: "0-3 months" },
    { min: 3, max: 6, label: "3-6 months" },
    { min: 6, max: 12, label: "6-12 months" },
    { min: 12, max: 24, label: "1-2 years" },
    { min: 24, max: Infinity, label: "2+ years" },
  ];

  // Find the bracket for this agent
  const bracket = brackets.find(
    (b) => agentTenure >= b.min && agentTenure < b.max
  );
  if (!bracket) return null;

  // Calculate averages for this tenure bracket
  // In a real implementation, you would filter metrics by agents in this tenure bracket
  // For now, let's provide some reasonable defaults based on tenure

  switch (bracket.label) {
    case "0-3 months":
      return {
        closeRate: 0.1, // 10%
        averagePremium: 1000,
        placeRate: 0.6, // 60%
        leadsPerDay: 6,
      };
    case "3-6 months":
      return {
        closeRate: 0.15, // 15%
        averagePremium: 1100,
        placeRate: 0.65, // 65%
        leadsPerDay: 7,
      };
    case "6-12 months":
      return {
        closeRate: 0.18, // 18%
        averagePremium: 1200,
        placeRate: 0.7, // 70%
        leadsPerDay: 8,
      };
    case "1-2 years":
      return {
        closeRate: 0.22, // 22%
        averagePremium: 1300,
        placeRate: 0.72, // 72%
        leadsPerDay: 8,
      };
    case "2+ years":
      return {
        closeRate: 0.25, // 25%
        averagePremium: 1400,
        placeRate: 0.75, // 75%
        leadsPerDay: 9,
      };
    default:
      return null;
  }
}

/**
 * Calculate CAP score based on close rate, average premium, and place rate
 */
export function calculateCapScore(
  closeRate: number,
  averagePremium: number,
  placeRate: number
): number {
  return Math.round(closeRate * averagePremium * placeRate);
}
