"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Agent, Team } from "@prisma/client";
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
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, ClipboardList } from "lucide-react";

type AgentWithTeam = Agent & { team?: Team };

export default function AgentPage() {
  const router = useRouter();
  const params = useParams();
  const [agent, setAgent] = useState<AgentWithTeam | null>(null);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAgentData();
  }, [params.id]);

  const fetchAgentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch agent details
      const agentResponse = await fetch(`/api/agents/${params.id}?includeTeam=true`);
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
      console.error("Error fetching agent data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!agent) {
    return <div>Agent not found</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">
            {agent.firstName} {agent.lastName}
          </h1>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => router.push(`/agents/${params.id}/coaching`)}>
            <ClipboardList className="h-4 w-4 mr-2" />
            Coaching
          </Button>
          <Button onClick={() => router.push(`/agents/${params.id}/metrics/add`)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Metrics
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <div className="space-y-2">
            <Title>Agent Details</Title>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text className="font-medium">Email</Text>
                <Text>{agent.email}</Text>
              </div>
              <div>
                <Text className="font-medium">Team</Text>
                <Text>{agent.team?.name || "No team assigned"}</Text>
              </div>
              <div>
                <Text className="font-medium">Start Date</Text>
                <Text>
                  {new Date(agent.startDate).toLocaleDateString()}
                </Text>
              </div>
              <div>
                <Text className="font-medium">Status</Text>
                <Text>
                  {agent.status === "P"
                    ? "Performance"
                    : agent.status === "T"
                    ? "Training"
                    : "Archived"}
                </Text>
              </div>
            </div>
          </div>
        </Card>

        <TabGroup>
          <TabList>
            <Tab>Metrics Table</Tab>
            <Tab>Visualizations</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <MetricsTable metrics={metrics} agentId={params.id as string} />
            </TabPanel>
            <TabPanel>
              <MetricsVisualizations metrics={metrics} agentId={params.id as string} />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
} 