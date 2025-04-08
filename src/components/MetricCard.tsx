import { Card, Title, Text, ProgressBar } from "@tremor/react";
import { AgentRampMetric } from "@/types";
import {
  getMetricStatus,
  formatPercentage,
  formatCurrency,
} from "@/utils/metrics";

interface MetricCardProps {
  metric: AgentRampMetric;
  target: {
    closeRate: number;
    avgPremium: number;
    placeRate: number;
    capScore?: number;
  };
}

export function MetricCard({ metric, target }: MetricCardProps) {
  const closeRateStatus = getMetricStatus(metric.closeRate, target.closeRate);
  const avgPremiumStatus = getMetricStatus(
    metric.avgPremium,
    target.avgPremium
  );
  const placeRateStatus = getMetricStatus(metric.placeRate, target.placeRate);
  const capScoreStatus =
    target.capScore && metric.capScore
      ? getMetricStatus(metric.capScore, target.capScore)
      : null;

  const getStatusColor = (status: "below" | "meeting" | "exceeding") => {
    switch (status) {
      case "below":
        return "red";
      case "meeting":
        return "yellow";
      case "exceeding":
        return "green";
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      <Title>
        Month {metric.monthNumber}, Week {metric.weekNumber}
      </Title>

      <div className="mt-4 space-y-4">
        <div>
          <Text>Close Rate</Text>
          <ProgressBar
            value={(metric.closeRate / target.closeRate) * 100}
            color={getStatusColor(closeRateStatus)}
            className="mt-2"
          />
          <Text className="mt-1">
            {formatPercentage(metric.closeRate)} /{" "}
            {formatPercentage(target.closeRate)}
          </Text>
        </div>

        <div>
          <Text>Average Premium</Text>
          <ProgressBar
            value={(metric.avgPremium / target.avgPremium) * 100}
            color={getStatusColor(avgPremiumStatus)}
            className="mt-2"
          />
          <Text className="mt-1">
            {formatCurrency(metric.avgPremium)} /{" "}
            {formatCurrency(target.avgPremium)}
          </Text>
        </div>

        <div>
          <Text>Place Rate</Text>
          <ProgressBar
            value={(metric.placeRate / target.placeRate) * 100}
            color={getStatusColor(placeRateStatus)}
            className="mt-2"
          />
          <Text className="mt-1">
            {formatPercentage(metric.placeRate)} /{" "}
            {formatPercentage(target.placeRate)}
          </Text>
        </div>

        {target.capScore && (
          <div>
            <Text>CAP Score</Text>
            <ProgressBar
              value={((metric.capScore || 0) / target.capScore) * 100}
              color={getStatusColor(capScoreStatus!)}
              className="mt-2"
            />
            <Text className="mt-1">
              {metric.capScore || 0} / {target.capScore}
            </Text>
          </div>
        )}

        <div>
          <Text>Leads Taken Per Day</Text>
          <ProgressBar
            value={(metric.leadsTakenPerDay / 8) * 100}
            color={getStatusColor(getMetricStatus(metric.leadsTakenPerDay, 8))}
            className="mt-2"
          />
          <Text className="mt-1">{metric.leadsTakenPerDay} / 8</Text>
        </div>
      </div>
    </Card>
  );
}
