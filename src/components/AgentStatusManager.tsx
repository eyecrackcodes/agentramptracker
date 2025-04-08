"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Title,
  Text,
  Badge,
  Grid,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@tremor/react";
import { Button } from "@/components/ui/button";
import { Agent, Metric, Team } from "@prisma/client";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRightLeft,
} from "lucide-react";
import { calculateStartDateFromTenure } from "@/utils/dates";

// Monthly benchmarks for agents in training
const MONTHLY_BENCHMARKS = [
  {
    month: 2,
    label: "Building Foundations",
    capScore: 75,
    closeRate: 0.1,
    placeRate: 0.65,
    leadsPerDay: 8,
    avgPremium: 1150,
  },
  {
    month: 3,
    label: "Gaining Momentum",
    capScore: 105,
    closeRate: 0.14,
    placeRate: 0.65,
    leadsPerDay: 8,
    avgPremium: 1150,
  },
  {
    month: 4,
    label: "Ramping Up",
    capScore: 135,
    closeRate: 0.18,
    placeRate: 0.65,
    leadsPerDay: 8,
    avgPremium: 1150,
  },
  {
    month: 5,
    label: "Building Confidence",
    capScore: 142,
    closeRate: 0.19,
    placeRate: 0.65,
    leadsPerDay: 8,
    avgPremium: 1150,
  },
  {
    month: 6,
    label: "Graduation",
    capScore: 150,
    closeRate: 0.2,
    placeRate: 0.65,
    leadsPerDay: 8,
    avgPremium: 1150,
  },
];

type AgentWithTeamAndMetrics = Agent & {
  team?: Team;
  metrics?: Metric[];
  averageMetrics?: {
    closeRate: number;
    placeRate: number;
    averagePremium: number;
    capScore: number;
    leadsPerDay: number;
  };
  benchmark?: any;
  readyForPromotion?: boolean;
  needsPIP?: boolean;
};

export function AgentStatusManager() {
  const [agents, setAgents] = useState<AgentWithTeamAndMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingAgent, setProcessingAgent] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/agents?includeMetrics=true");
      if (!response.ok) throw new Error("Failed to fetch agents");

      let data = await response.json();

      // Process agents to add average metrics and benchmarks
      data = data.map((agent: AgentWithTeamAndMetrics) => {
        // Calculate average metrics if there are any
        if (agent.metrics && agent.metrics.length > 0) {
          const metrics = agent.metrics;
          const averageMetrics = {
            closeRate:
              metrics.reduce((sum, m) => sum + m.closeRate, 0) / metrics.length,
            placeRate:
              metrics.reduce((sum, m) => sum + m.placeRate, 0) / metrics.length,
            averagePremium:
              metrics.reduce((sum, m) => sum + m.averagePremium, 0) /
              metrics.length,
            capScore:
              metrics.reduce((sum, m) => sum + m.capScore, 0) / metrics.length,
            leadsPerDay:
              metrics.reduce((sum, m) => sum + m.leadsPerDay, 0) /
              metrics.length,
          };
          agent.averageMetrics = averageMetrics;
        }

        // Find applicable benchmark based on tenure
        if (agent.tenure) {
          const tenureMonths = Math.floor(agent.tenure);
          const benchmark =
            MONTHLY_BENCHMARKS.find((b) => b.month === tenureMonths) ||
            MONTHLY_BENCHMARKS.find((b) => b.month >= tenureMonths);
          agent.benchmark = benchmark;

          // Check if ready for promotion (from T to P)
          if (agent.status === "T" && agent.averageMetrics && benchmark) {
            agent.readyForPromotion =
              agent.averageMetrics.capScore >= benchmark.capScore;
          }

          // Check if needs PIP (in T for > 4 months and not meeting benchmarks)
          if (
            agent.status === "T" &&
            agent.tenure > 4 &&
            agent.averageMetrics
          ) {
            const applicableBenchmark =
              MONTHLY_BENCHMARKS.find((b) => b.month === 4) ||
              MONTHLY_BENCHMARKS[2];
            agent.needsPIP =
              agent.averageMetrics.capScore < applicableBenchmark.capScore;
          }
        }

        return agent;
      });

      setAgents(data);
    } catch (err) {
      setError("Failed to load agents");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const changeAgentStatus = async (agentId: string, newStatus: "T" | "P") => {
    try {
      setProcessingAgent(agentId);
      const agent = agents.find((a) => a.id === agentId);
      if (!agent) return;

      const response = await fetch(`/api/agents/${agentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: agent.firstName,
          lastName: agent.lastName,
          email: agent.email,
          teamId: agent.teamId,
          status: newStatus,
          tenure: agent.tenure,
          targetLeadsPerDay: agent.targetLeadsPerDay,
          startDate: agent.startDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update agent status");
      }

      // Update local state
      setAgents((prev) =>
        prev.map((a) => (a.id === agentId ? { ...a, status: newStatus } : a))
      );

      // Show success message
      setSuccessMessage(
        `${agent.firstName} ${agent.lastName} moved to ${
          newStatus === "P" ? "Performance" : "Training"
        } queue`
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update agent status"
      );
    } finally {
      setProcessingAgent(null);
    }
  };

  if (loading) return <div>Loading agent status information...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const trainingAgents = agents.filter((a) => a.status === "T");
  const performanceAgents = agents.filter((a) => a.status === "P");
  const archivedAgents = agents.filter((a) => a.status === "A");
  const readyForPromotionAgents = agents.filter(
    (a) => a.status === "T" && a.readyForPromotion
  );
  const atRiskAgents = agents.filter((a) => a.status === "T" && a.needsPIP);

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md">
          {successMessage}
        </div>
      )}

      <TabGroup>
        <TabList>
          <Tab>Overview</Tab>
          <Tab>Training Queue ({trainingAgents.length})</Tab>
          <Tab>Performance Queue ({performanceAgents.length})</Tab>
          <Tab>Ready for Promotion ({readyForPromotionAgents.length})</Tab>
          <Tab>At Risk Agents ({atRiskAgents.length})</Tab>
          <Tab>Archived Agents ({archivedAgents.length})</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <div className="mt-4">
              <Card>
                <Title>Agent Queue Status Summary</Title>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Card decoration="top" decorationColor="blue">
                    <Title>Total Agents</Title>
                    <Text className="text-2xl font-bold">{agents.length}</Text>
                  </Card>

                  <Card decoration="top" decorationColor="green">
                    <Title>Training Queue</Title>
                    <Text className="text-2xl font-bold">
                      {trainingAgents.length}
                    </Text>
                  </Card>

                  <Card decoration="top" decorationColor="indigo">
                    <Title>Performance Queue</Title>
                    <Text className="text-2xl font-bold">
                      {performanceAgents.length}
                    </Text>
                  </Card>

                  <Card decoration="top" decorationColor="amber">
                    <Title>Agents At Risk</Title>
                    <Text className="text-2xl font-bold">
                      {atRiskAgents.length}
                    </Text>
                  </Card>

                  <Card decoration="top" decorationColor="rose">
                    <Title>Archived Agents</Title>
                    <Text className="text-2xl font-bold">
                      {archivedAgents.length}
                    </Text>
                  </Card>
                </div>

                <div className="mt-6">
                  <Title>Training Queue Benchmarks</Title>
                  <div className="mt-2 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Month
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phase
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            CAP Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Close Rate
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Place Rate
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Avg Premium
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {MONTHLY_BENCHMARKS.map((benchmark) => (
                          <tr key={benchmark.month}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Month {benchmark.month}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {benchmark.label}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {benchmark.capScore}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {(benchmark.closeRate * 100).toFixed(1)}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {(benchmark.placeRate * 100).toFixed(1)}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${benchmark.avgPremium}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </div>
          </TabPanel>

          <TabPanel>
            <div className="mt-4">
              <AgentList
                agents={trainingAgents}
                title="Training Queue Agents"
                changeStatus={changeAgentStatus}
                processingAgent={processingAgent}
              />
            </div>
          </TabPanel>

          <TabPanel>
            <div className="mt-4">
              <AgentList
                agents={performanceAgents}
                title="Performance Queue Agents"
                changeStatus={changeAgentStatus}
                processingAgent={processingAgent}
              />
            </div>
          </TabPanel>

          <TabPanel>
            <div className="mt-4">
              <AgentList
                agents={readyForPromotionAgents}
                title="Agents Ready for Promotion"
                changeStatus={changeAgentStatus}
                processingAgent={processingAgent}
                showPromoteAll={true}
              />
            </div>
          </TabPanel>

          <TabPanel>
            <div className="mt-4">
              <AgentList
                agents={atRiskAgents}
                title="At Risk Agents (4+ months in Training)"
                changeStatus={changeAgentStatus}
                processingAgent={processingAgent}
              />
            </div>
          </TabPanel>

          <TabPanel>
            <div className="mt-4">
              <AgentList
                agents={archivedAgents}
                title="Archived Agents"
                changeStatus={changeAgentStatus}
                processingAgent={processingAgent}
              />
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}

interface AgentListProps {
  agents: AgentWithTeamAndMetrics[];
  title: string;
  changeStatus: (agentId: string, newStatus: "T" | "P") => Promise<void>;
  processingAgent: string | null;
  showPromoteAll?: boolean;
}

function AgentList({
  agents,
  title,
  changeStatus,
  processingAgent,
  showPromoteAll,
}: AgentListProps) {
  const handlePromoteAll = async () => {
    for (const agent of agents) {
      await changeStatus(agent.id, "P");
    }
  };

  if (agents.length === 0) {
    return (
      <Card>
        <Title>{title}</Title>
        <Text className="mt-2">No agents found in this category.</Text>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex justify-between items-center">
        <Title>{title}</Title>
        {showPromoteAll && agents.length > 0 && (
          <Button
            onClick={handlePromoteAll}
            className="bg-green-600 hover:bg-green-700"
          >
            Promote All to Performance
          </Button>
        )}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tenure
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CAP Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {agents.map((agent) => {
              const isReadyForPromotion =
                agent.status === "T" && agent.readyForPromotion;
              const isAtRisk = agent.status === "T" && agent.needsPIP;
              const isArchived = agent.status === "A";

              return (
                <tr key={agent.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {agent.firstName} {agent.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {agent.team?.name || "Unknown"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {agent.tenure?.toFixed(1) || "Unknown"} months
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">
                        {agent.averageMetrics
                          ? Math.round(agent.averageMetrics.capScore)
                          : "N/A"}
                      </span>

                      {!isArchived &&
                        agent.benchmark &&
                        agent.averageMetrics && (
                          <span className="ml-2">
                            {agent.averageMetrics.capScore >=
                            agent.benchmark.capScore ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </span>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      color={
                        agent.status === "P"
                          ? "blue"
                          : agent.status === "A"
                          ? "rose"
                          : "amber"
                      }
                      size="xs"
                      icon={isAtRisk ? AlertTriangle : undefined}
                    >
                      {agent.status === "P"
                        ? "Performance"
                        : agent.status === "A"
                        ? "Archived"
                        : "Training"}
                      {isReadyForPromotion && " (Ready)"}
                      {isAtRisk && " (At Risk)"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (isArchived) {
                          changeStatus(agent.id, "P");
                        } else {
                          changeStatus(
                            agent.id,
                            agent.status === "T" ? "P" : "T"
                          );
                        }
                      }}
                      disabled={processingAgent === agent.id}
                      className="flex items-center mr-2"
                    >
                      <ArrowRightLeft className="h-4 w-4 mr-1" />
                      {isArchived
                        ? "Restore to Performance"
                        : agent.status === "T"
                        ? "Move to Performance"
                        : "Move to Training"}
                    </Button>

                    {!isArchived && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => changeStatus(agent.id, "A")}
                        disabled={processingAgent === agent.id}
                        className="flex items-center mt-2 text-rose-500 border-rose-200 hover:bg-rose-50"
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Archive Agent
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
