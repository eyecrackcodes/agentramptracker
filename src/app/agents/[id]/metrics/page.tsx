"use client";

import { useState, useEffect } from "react";
import { Agent, Metric, Team } from "@prisma/client";
import {
  Card,
  Title,
  Text,
  TabGroup,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
} from "@tremor/react";
import { MetricsTable } from "@/components/MetricsTable";
import { MetricsVisualizations } from "@/components/MetricsVisualizations";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type AgentWithTeam = Agent & { team?: Team };

export default function AgentMetricsPage({
  params,
}: {
  params: { id: string };
}) {
  const [agent, setAgent] = useState<AgentWithTeam | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (params.id) {
      fetchAgentData();
    }
  }, [params.id]);

  const fetchAgentData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch agent details with team included
      const agentResponse = await fetch(
        `/api/agents/${params.id}?includeTeam=true`
      );
      if (!agentResponse.ok) {
        throw new Error("Failed to fetch agent details");
      }
      const agentData = await agentResponse.json();
      setAgent(agentData);

      // Fetch agent metrics
      const metricsResponse = await fetch(`/api/metrics?agentId=${params.id}`);
      if (!metricsResponse.ok) {
        throw new Error("Failed to fetch metrics");
      }
      const metricsData = await metricsResponse.json();
      setMetrics(metricsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Text>Loading agent data...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <Title className="text-red-500">Error</Title>
          <Text>{error}</Text>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
          </Button>
        </Card>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <Title>Agent Not Found</Title>
          <Text>The requested agent could not be found.</Text>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const agentName = `${agent.firstName} ${agent.lastName}`;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Agents
        </Button>
      </div>

      <div className="mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <Title>{agentName}</Title>
              <div className="mt-2 flex gap-2">
                <Text>Team: {agent.team?.name || "Unknown"}</Text>
                {agent.status && (
                  <Text>
                    Status: {agent.status === "P" ? "Performance" : "Training"}
                  </Text>
                )}
                {agent.tenure && (
                  <Text>Tenure: {agent.tenure.toFixed(1)} months</Text>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <TabGroup>
        <TabList className="border-b">
          <Tab>Performance Dashboard</Tab>
          <Tab>Metrics History</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div className="mt-6">
              <MetricsVisualizations
                agentId={params.id}
                metrics={metrics}
                agentName={agentName}
              />
            </div>
          </TabPanel>
          <TabPanel>
            <div className="mt-6">
              <MetricsTable
                agentId={params.id}
                metrics={metrics}
                loading={isLoading}
                error={error}
                onMetricsChanged={fetchAgentData}
              />
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
