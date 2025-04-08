import { Card, Title, BarChart, DonutChart } from "@tremor/react";
import { useTeamAgent } from "../context/TeamAgentContext";
import { useEffect, useState } from "react";
import { Metric } from "@prisma/client";

export function MetricsCharts() {
  const { selectedAgent } = useTeamAgent();
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!selectedAgent) {
        setMetrics([]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/metrics?agentId=${selectedAgent.id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch metrics");
        }
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch metrics"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [selectedAgent]);

  if (!selectedAgent) {
    return null;
  }

  if (loading) {
    return <Card className="mt-6">Loading charts...</Card>;
  }

  if (error) {
    return <Card className="mt-6 text-red-500">{error}</Card>;
  }

  const closeRateData = metrics.map((metric) => ({
    month: `${metric.month} Week ${metric.week}`,
    "Close Rate": metric.closeRate * 100,
  }));

  const premiumData = metrics.map((metric) => ({
    month: `${metric.month} Week ${metric.week}`,
    "Average Premium": metric.averagePremium,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <Card>
        <Title>Close Rate Trend</Title>
        <BarChart
          className="mt-6"
          data={closeRateData}
          index="month"
          categories={["Close Rate"]}
          colors={["blue"]}
          yAxisWidth={48}
          showLegend={false}
        />
      </Card>

      <Card>
        <Title>Average Premium Trend</Title>
        <BarChart
          className="mt-6"
          data={premiumData}
          index="month"
          categories={["Average Premium"]}
          colors={["green"]}
          yAxisWidth={48}
          showLegend={false}
        />
      </Card>

      <Card>
        <Title>Place Rate vs Close Rate</Title>
        <DonutChart
          className="mt-6"
          data={[
            {
              name: "Place Rate",
              value:
                metrics.reduce((acc, metric) => acc + metric.placeRate, 0) /
                metrics.length,
            },
            {
              name: "Close Rate",
              value:
                metrics.reduce((acc, metric) => acc + metric.closeRate, 0) /
                metrics.length,
            },
          ]}
          category="value"
          index="name"
          colors={["emerald", "blue"]}
          valueFormatter={(value) => `${(value * 100).toFixed(1)}%`}
        />
      </Card>

      <Card>
        <Title>Leads per Day Trend</Title>
        <BarChart
          className="mt-6"
          data={metrics.map((metric) => ({
            month: `${metric.month} Week ${metric.week}`,
            "Leads per Day": metric.leadsPerDay,
          }))}
          index="month"
          categories={["Leads per Day"]}
          colors={["purple"]}
          yAxisWidth={48}
          showLegend={false}
        />
      </Card>
    </div>
  );
}
