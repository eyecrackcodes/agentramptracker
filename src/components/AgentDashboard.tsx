import { useState } from "react";
import { Card, Title, Text, Grid } from "@tremor/react";
import { User, AgentRampMetric } from "@/types";
import { MetricCard } from "./MetricCard";
import { MONTHLY_TARGETS } from "@/types";
import { useAgentMetrics } from "@/hooks/useAgentMetrics";

interface AgentDashboardProps {
  user: User;
}

export function AgentDashboard({ user }: AgentDashboardProps) {
  const { metrics, alerts, loading } = useAgentMetrics(user);

  return (
    <div className="p-4 space-y-6">
      <Card>
        <Title>Agent Dashboard</Title>
        <Text className="mt-2">
          Welcome,{" "}
          {user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.email}
        </Text>

        {alerts.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <Text className="text-red-600 font-semibold">Alerts:</Text>
            <ul className="mt-2 space-y-1">
              {alerts.map((alert, index) => (
                <li key={index} className="text-red-600">
                  {alert}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {loading ? (
        <Text>Loading metrics...</Text>
      ) : (
        <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
          {metrics.map((metric) => {
            const target = MONTHLY_TARGETS.find(
              (t) => t.monthNumber === metric.monthNumber
            );
            if (!target) return null;

            return (
              <MetricCard key={metric.id} metric={metric} target={target} />
            );
          })}
        </Grid>
      )}
    </div>
  );
}
