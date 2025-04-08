"use client";

import { useState, useEffect } from "react";
import { MetricsForm } from "@/components/MetricsForm";
import { MetricsTable } from "@/components/MetricsTable";
import { MetricsVisualizations } from "@/components/MetricsVisualizations";
import { TeamAgentSelector } from "@/components/TeamAgentSelector";
import { TabGroup, Tab, TabList, TabPanel, TabPanels } from "@tremor/react";
import { Metric } from "@prisma/client";

export default function MetricsPage() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(false);
  const [agentName, setAgentName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Fetch metrics when agent is selected
  useEffect(() => {
    if (selectedAgentId) {
      fetchAgentMetrics(selectedAgentId);
    } else {
      setMetrics([]);
    }
  }, [selectedAgentId]);

  const fetchAgentMetrics = async (agentId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch agent details to get name
      const agentResponse = await fetch(`/api/agents/${agentId}`);
      if (agentResponse.ok) {
        const agentData = await agentResponse.json();
        setAgentName(`${agentData.firstName} ${agentData.lastName}`);
      }

      // Fetch metrics
      const response = await fetch(`/api/metrics?agentId=${agentId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch metrics");
      }

      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch metrics");
      console.error("Error fetching metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  // Callback when metrics are saved
  const handleMetricsSaved = () => {
    if (selectedAgentId) {
      fetchAgentMetrics(selectedAgentId);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Agent Metrics</h1>

      <div className="grid gap-6">
        <div className="bg-[hsl(var(--background))] p-6 rounded-lg border border-[hsl(var(--border))]">
          <h2 className="text-xl font-semibold mb-4">Select Agent</h2>
          <TeamAgentSelector
            onAgentSelect={(agentId) => setSelectedAgentId(agentId)}
          />
        </div>

        {selectedAgentId && (
          <>
            <TabGroup>
              <TabList className="border-b">
                <Tab>Dashboard</Tab>
                <Tab>Add New Metrics</Tab>
                <Tab>Metrics History</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <div className="pt-6">
                    <MetricsVisualizations
                      agentId={selectedAgentId}
                      metrics={metrics}
                      agentName={agentName}
                    />
                  </div>
                </TabPanel>

                <TabPanel>
                  <div className="bg-[hsl(var(--background))] p-6 rounded-lg border border-[hsl(var(--border))] mt-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Add New Metrics
                    </h2>
                    <MetricsForm
                      agentId={selectedAgentId}
                      onSuccess={handleMetricsSaved}
                    />
                  </div>
                </TabPanel>

                <TabPanel>
                  <div className="bg-[hsl(var(--background))] p-6 rounded-lg border border-[hsl(var(--border))] mt-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Metrics History
                    </h2>
                    <MetricsTable
                      agentId={selectedAgentId}
                      metrics={metrics}
                      loading={loading}
                      error={error}
                      onMetricsChanged={handleMetricsSaved}
                    />
                  </div>
                </TabPanel>
              </TabPanels>
            </TabGroup>
          </>
        )}
      </div>
    </div>
  );
}
