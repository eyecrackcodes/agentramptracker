import { useState, useEffect } from "react";
import { AgentRampMetric, User } from "@/types";
import { prisma } from "@/lib/prisma";
import { checkMetricAlerts } from "@/utils/metrics";

export function useAgentMetrics(user: User) {
  const [metrics, setMetrics] = useState<AgentRampMetric[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch(`/api/metrics?userId=${user.id}`);
        if (!response.ok) throw new Error("Failed to fetch metrics");

        const data = await response.json();
        setMetrics(data);

        // Check for alerts
        const allAlerts = data.flatMap((metric: AgentRampMetric) =>
          checkMetricAlerts(metric, user.startDate)
        );
        setAlerts(allAlerts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [user.id, user.startDate]);

  const addMetric = async (
    metric: Omit<AgentRampMetric, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const response = await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metric),
      });

      if (!response.ok) throw new Error("Failed to add metric");

      const newMetric = await response.json();
      setMetrics((prev) => [...prev, newMetric]);

      // Update alerts
      const newAlerts = checkMetricAlerts(newMetric, user.startDate);
      setAlerts((prev) => [...prev, ...newAlerts]);

      return newMetric;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const updateMetric = async (
    id: string,
    updates: Partial<AgentRampMetric>
  ) => {
    try {
      const response = await fetch(`/api/metrics/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error("Failed to update metric");

      const updatedMetric = await response.json();
      setMetrics((prev) => prev.map((m) => (m.id === id ? updatedMetric : m)));

      // Update alerts
      const newAlerts = checkMetricAlerts(updatedMetric, user.startDate);
      setAlerts((prev) => {
        const filtered = prev.filter((alert) => !alert.includes(id));
        return [...filtered, ...newAlerts];
      });

      return updatedMetric;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  return {
    metrics,
    alerts,
    loading,
    error,
    addMetric,
    updateMetric,
  };
}
