"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Title,
  Text,
  Grid,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Select,
  SelectItem,
  BarChart,
  DonutChart,
  LineChart,
  AreaChart,
  Metric,
  Flex,
  Badge,
  Bold,
  Button,
} from "@tremor/react";
import { useTeamAgent } from "../context/TeamAgentContext";
import {
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";

interface MetricSummary {
  totalAgents: number;
  averageCloseRate: number;
  averagePremium: number;
  totalTeams: number;
  // Additional metrics
  totalLeadsPerDay: number;
  totalMetrics: number;
  teamPerformance?: any[];
}

interface AgentPerformance {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  teamId: string;
  teamName?: string;
  averageCloseRate: number;
  averagePremium: number;
  averagePlaceRate: number;
  averageCapScore: number;
  averageLeadsPerDay: number;
}

interface TeamPerformance {
  id: string;
  name: string;
  description: string;
  agentCount: number;
  averageCloseRate: number;
  averagePremium: number;
  averagePlaceRate: number;
  averageCapScore: number;
  averageLeadsPerDay: number;
}

export default function Home() {
  const { selectedAgent } = useTeamAgent();
  const [summary, setSummary] = useState<MetricSummary>({
    totalAgents: 0,
    averageCloseRate: 0,
    averagePremium: 0,
    totalTeams: 0,
    totalLeadsPerDay: 0,
    totalMetrics: 0,
  });
  const [teams, setTeams] = useState<any[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([]);
  const [topAgents, setTopAgents] = useState<AgentPerformance[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [teamsResponse, metricsResponse, agentsResponse] =
          await Promise.all([
            fetch("/api/teams"),
            fetch("/api/metrics/summary"),
            fetch("/api/agents?status=active"),
          ]);

        if (!teamsResponse.ok || !metricsResponse.ok || !agentsResponse.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const teams = await teamsResponse.json();
        const metrics = await metricsResponse.json();
        const agents = await agentsResponse.json();

        // Build team lookup for agent processing
        const teamLookup = teams.reduce((acc: any, team: any) => {
          acc[team.id] = team.name;
          return acc;
        }, {});

        // Calculate team performance
        const teamMetricsMap = new Map<string, any>();

        // Get all metrics for processing (excluding archived agents)
        const allMetricsResponse = await fetch(
          "/api/metrics?agentId=all&excludeArchived=true",
          {
            headers: { "x-fetch-all": "true" },
          }
        );
        let allMetrics = [];

        if (allMetricsResponse.ok) {
          allMetrics = await allMetricsResponse.json();

          // Process metrics by team
          allMetrics.forEach((metric: any) => {
            const agent = agents.find((a: any) => a.id === metric.agentId);
            if (agent) {
              const teamId = agent.teamId;
              if (!teamMetricsMap.has(teamId)) {
                teamMetricsMap.set(teamId, {
                  metrics: [],
                  agents: new Set(),
                });
              }

              const teamData = teamMetricsMap.get(teamId);
              teamData.metrics.push(metric);
              teamData.agents.add(agent.id);
            }
          });

          // Calculate team performance metrics
          const processedTeamPerformance = teams.map((team: any) => {
            const teamData = teamMetricsMap.get(team.id) || {
              metrics: [],
              agents: new Set(),
            };
            const teamMetrics = teamData.metrics;

            const calcAverage = (key: string) =>
              teamMetrics.length > 0
                ? teamMetrics.reduce((sum: number, m: any) => sum + m[key], 0) /
                  teamMetrics.length
                : 0;

            return {
              id: team.id,
              name: team.name,
              description:
                team.description ||
                (team.name.includes("ATX") ? "Austin" : "Charlotte"),
              agentCount: teamData.agents.size,
              averageCloseRate: calcAverage("closeRate"),
              averagePremium: calcAverage("averagePremium"),
              averagePlaceRate: calcAverage("placeRate"),
              averageCapScore: calcAverage("capScore"),
              averageLeadsPerDay: calcAverage("leadsPerDay"),
            };
          });

          setTeamPerformance(processedTeamPerformance);

          // Calculate top performing agents
          const agentMetricsMap = new Map<string, any[]>();

          allMetrics.forEach((metric: any) => {
            if (!agentMetricsMap.has(metric.agentId)) {
              agentMetricsMap.set(metric.agentId, []);
            }

            agentMetricsMap.get(metric.agentId)?.push(metric);
          });

          const agentPerformance = agents.map((agent: any) => {
            const agentMetrics = agentMetricsMap.get(agent.id) || [];

            const calcAverage = (key: string) =>
              agentMetrics.length > 0
                ? agentMetrics.reduce(
                    (sum: number, m: any) => sum + m[key],
                    0
                  ) / agentMetrics.length
                : 0;

            return {
              id: agent.id,
              firstName: agent.firstName,
              lastName: agent.lastName,
              email: agent.email,
              teamId: agent.teamId,
              teamName: teamLookup[agent.teamId] || "",
              averageCloseRate: calcAverage("closeRate"),
              averagePremium: calcAverage("averagePremium"),
              averagePlaceRate: calcAverage("placeRate"),
              averageCapScore: calcAverage("capScore"),
              averageLeadsPerDay: calcAverage("leadsPerDay"),
            };
          });

          // Get top performing agents by close rate
          const topPerformers = [...agentPerformance]
            .sort((a, b) => b.averageCloseRate - a.averageCloseRate)
            .slice(0, 10);

          setTopAgents(topPerformers);

          // Calculate monthly trends
          const monthlyData = new Map<number, any>();

          allMetrics.forEach((metric: any) => {
            if (!monthlyData.has(metric.month)) {
              monthlyData.set(metric.month, {
                month: metric.month,
                metrics: [],
              });
            }

            monthlyData.get(metric.month).metrics.push(metric);
          });

          const monthlyTrendsData = Array.from(monthlyData.values())
            .map((monthData) => {
              const calcAverage = (key: string) =>
                monthData.metrics.length > 0
                  ? monthData.metrics.reduce(
                      (sum: number, m: any) => sum + m[key],
                      0
                    ) / monthData.metrics.length
                  : 0;

              return {
                month: monthData.month,
                closeRate: calcAverage("closeRate") * 100,
                averagePremium: calcAverage("averagePremium"),
                placeRate: calcAverage("placeRate") * 100,
                capScore: calcAverage("capScore"),
                leadsPerDay: calcAverage("leadsPerDay"),
                count: monthData.metrics.length,
              };
            })
            .sort((a, b) => a.month - b.month);

          setMonthlyTrends(monthlyTrendsData);
        }

        // Set summary data
        const totalLeadsPerDay = agents.reduce(
          (sum: number, agent: any) => sum + agent.targetLeadsPerDay,
          0
        );

        setSummary({
          totalAgents: agents.length,
          averageCloseRate: metrics.averageCloseRate,
          averagePremium: metrics.averagePremium,
          totalTeams: teams.length,
          totalLeadsPerDay: totalLeadsPerDay,
          totalMetrics: metrics.totalMetrics,
        });

        setTeams(teams);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const getLocationTeams = (location: string) => {
    if (location === "all") return teamPerformance;
    return teamPerformance.filter((team) =>
      location === "ATX"
        ? team.description.includes("ATX") ||
          team.description.includes("Austin")
        : team.description.includes("CLT") ||
          team.description.includes("Charlotte")
    );
  };

  const displayedTeams = getLocationTeams(selectedLocation);

  const calculatePeriodChange = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  const formatChangeIndicator = (value: number) => {
    const isPositive = value >= 0;
    const Icon = isPositive ? ChevronUp : ChevronDown;
    const color = isPositive ? "emerald" : "red";

    return (
      <Badge color={color} icon={Icon}>
        {Math.abs(value).toFixed(1)}%
      </Badge>
    );
  };

  if (loading) {
    return (
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <Card>
          <Title>Dashboard</Title>
          <Text className="mt-2">Loading dashboard data...</Text>
        </Card>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <Card>
          <Title>Dashboard</Title>
          <Text className="mt-2 text-red-500">{error}</Text>
        </Card>
      </main>
    );
  }

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Agent Ramp Tracker Dashboard</Title>
      <div className="flex items-center justify-between">
        <Text className="mt-2">
          Overview of agent performance metrics across teams
        </Text>
        <div className="flex flex-wrap gap-4 mt-6">
          <Link href="/quick-add">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
              <PlusCircle className="h-5 w-5 mr-2" />
              Quick Add Metrics
            </Button>
          </Link>

          <Link href="/agent-status">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Agent Status Manager
            </Button>
          </Link>
        </div>
      </div>

      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6 mt-6">
        <Card decoration="top" decorationColor="blue">
          <Flex justifyContent="start" className="space-x-4">
            <Users size={24} className="text-blue-500" />
            <div>
              <Text>Total Agents</Text>
              <Metric>{summary.totalAgents}</Metric>
            </div>
          </Flex>
        </Card>
        <Card decoration="top" decorationColor="green">
          <Flex justifyContent="start" className="space-x-4">
            <TrendingUp size={24} className="text-green-500" />
            <div>
              <Text>Average Close Rate</Text>
              <Metric>{(summary.averageCloseRate * 100).toFixed(1)}%</Metric>
            </div>
          </Flex>
        </Card>
        <Card decoration="top" decorationColor="amber">
          <Flex justifyContent="start" className="space-x-4">
            <Eye size={24} className="text-amber-500" />
            <div>
              <Text>Average Premium</Text>
              <Metric>
                ${Math.round(summary.averagePremium).toLocaleString()}
              </Metric>
            </div>
          </Flex>
        </Card>
        <Card decoration="top" decorationColor="indigo">
          <Flex justifyContent="start" className="space-x-4">
            <AlertTriangle size={24} className="text-indigo-500" />
            <div>
              <Text>Total Leads/Day</Text>
              <Metric>{summary.totalLeadsPerDay}</Metric>
            </div>
          </Flex>
        </Card>
      </Grid>

      <TabGroup className="mt-6">
        <TabList>
          <Tab>Performance Trends</Tab>
          <Tab>Team Performance</Tab>
          <Tab>Top Agents</Tab>
        </TabList>

        <TabPanels>
          <TabPanel className="w-full">
            <div className="w-full">
              <Grid numItems={1} numItemsSm={2} className="gap-6 mt-6">
                <Card>
                  <Title>Monthly Close Rate Trend</Title>
                  <LineChart
                    className="mt-6 h-80"
                    data={monthlyTrends}
                    index="month"
                    categories={["closeRate"]}
                    colors={["blue"]}
                    valueFormatter={(value) => `${value.toFixed(1)}%`}
                    showLegend={false}
                    yAxisWidth={40}
                    showAnimation={true}
                  />
                </Card>

                <Card>
                  <Title>Monthly Premium Trend</Title>
                  <AreaChart
                    className="mt-6 h-80"
                    data={monthlyTrends}
                    index="month"
                    categories={["avgPremium"]}
                    colors={["green"]}
                    valueFormatter={(value) => `$${value.toFixed(0)}`}
                    showLegend={false}
                    yAxisWidth={40}
                    showAnimation={true}
                  />
                </Card>

                <Card>
                  <Title>Monthly Place Rate Trend</Title>
                  <LineChart
                    className="mt-6 h-80"
                    data={monthlyTrends}
                    index="month"
                    categories={["placeRate"]}
                    colors={["purple"]}
                    valueFormatter={(value) => `${value.toFixed(1)}%`}
                    showLegend={false}
                    yAxisWidth={40}
                    showAnimation={true}
                  />
                </Card>

                <Card>
                  <Title>Monthly Leads Per Day Trend</Title>
                  <BarChart
                    className="mt-6 h-80"
                    data={monthlyTrends}
                    index="month"
                    categories={["leadsPerDay"]}
                    colors={["indigo"]}
                    valueFormatter={(value) => `${value.toFixed(1)}`}
                    showLegend={false}
                    yAxisWidth={40}
                    showAnimation={true}
                  />
                </Card>
              </Grid>
            </div>
          </TabPanel>

          <TabPanel className="w-full">
            <div className="w-full mt-6">
              <Card>
                <div className="flex justify-end mb-4">
                  <Select
                    value={selectedLocation}
                    onValueChange={setSelectedLocation}
                    className="max-w-xs"
                  >
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="ATX">Austin (ATX)</SelectItem>
                    <SelectItem value="CLT">Charlotte (CLT)</SelectItem>
                  </Select>
                </div>

                <Title>Team Performance Comparison</Title>

                <Grid numItems={1} numItemsSm={2} className="gap-6 mt-6">
                  <Card>
                    <Title>Close Rate by Team</Title>
                    <BarChart
                      className="mt-6 h-80"
                      data={displayedTeams}
                      index="name"
                      categories={["averageCloseRate"]}
                      colors={["blue"]}
                      valueFormatter={(value) => `${(value * 100).toFixed(1)}%`}
                      layout="vertical"
                      showLegend={false}
                      yAxisWidth={40}
                      showAnimation={true}
                    />
                  </Card>

                  <Card>
                    <Title>Premium by Team</Title>
                    <BarChart
                      className="mt-6 h-80"
                      data={displayedTeams}
                      index="name"
                      categories={["averagePremium"]}
                      colors={["green"]}
                      valueFormatter={(value) => `$${value.toFixed(0)}`}
                      layout="vertical"
                      showLegend={false}
                      yAxisWidth={40}
                      showAnimation={true}
                    />
                  </Card>

                  <Card>
                    <Title>Place Rate by Team</Title>
                    <BarChart
                      className="mt-6 h-80"
                      data={displayedTeams}
                      index="name"
                      categories={["averagePlaceRate"]}
                      colors={["purple"]}
                      valueFormatter={(value) => `${(value * 100).toFixed(1)}%`}
                      layout="vertical"
                      showLegend={false}
                      yAxisWidth={40}
                      showAnimation={true}
                    />
                  </Card>

                  <Card>
                    <Title>Cap Score by Team</Title>
                    <BarChart
                      className="mt-6 h-80"
                      data={displayedTeams}
                      index="name"
                      categories={["averageCapScore"]}
                      colors={["orange"]}
                      valueFormatter={(value) => value.toFixed(0)}
                      layout="vertical"
                      showLegend={false}
                      yAxisWidth={40}
                      showAnimation={true}
                    />
                  </Card>
                </Grid>
              </Card>
            </div>
          </TabPanel>

          <TabPanel className="w-full">
            <div className="w-full mt-6">
              <Card>
                <Title>Top Performing Agents</Title>
                <Text>Top 10 agents by close rate</Text>

                <Grid numItems={1} numItemsSm={2} className="gap-6 mt-6">
                  <Card>
                    <Title>Agent Close Rate</Title>
                    <BarChart
                      className="mt-6 h-80"
                      data={topAgents.map((agent) => ({
                        agent: `${agent.firstName} ${agent.lastName}`,
                        value: agent.averageCloseRate * 100,
                        team: agent.teamName,
                      }))}
                      index="agent"
                      categories={["value"]}
                      colors={["blue"]}
                      valueFormatter={(value) => `${value.toFixed(1)}%`}
                      layout="vertical"
                      showLegend={false}
                      yAxisWidth={40}
                      showAnimation={true}
                    />
                  </Card>

                  <Card>
                    <Title>Agent Premium</Title>
                    <BarChart
                      className="mt-6 h-80"
                      data={topAgents.map((agent) => ({
                        agent: `${agent.firstName} ${agent.lastName}`,
                        value: Math.round(agent.averagePremium),
                        team: agent.teamName,
                      }))}
                      index="agent"
                      categories={["value"]}
                      colors={["green"]}
                      valueFormatter={(value) => `$${value.toFixed(0)}`}
                      layout="vertical"
                      showLegend={false}
                      yAxisWidth={40}
                      showAnimation={true}
                    />
                  </Card>

                  <Card>
                    <Title>Agent Place Rate</Title>
                    <BarChart
                      className="mt-6 h-80"
                      data={topAgents.map((agent) => ({
                        agent: `${agent.firstName} ${agent.lastName}`,
                        value: agent.averagePlaceRate * 100,
                        team: agent.teamName,
                      }))}
                      index="agent"
                      categories={["value"]}
                      colors={["purple"]}
                      valueFormatter={(value) => `${value.toFixed(1)}%`}
                      layout="vertical"
                      showLegend={false}
                      yAxisWidth={40}
                      showAnimation={true}
                    />
                  </Card>

                  <Card>
                    <Title>Performance Distribution</Title>
                    <DonutChart
                      className="mt-6 h-80"
                      data={[
                        {
                          name: "High Performers (>20%)",
                          value: topAgents.filter(
                            (a) => a.averageCloseRate > 0.2
                          ).length,
                        },
                        {
                          name: "Medium Performers (10-20%)",
                          value: topAgents.filter(
                            (a) =>
                              a.averageCloseRate >= 0.1 &&
                              a.averageCloseRate <= 0.2
                          ).length,
                        },
                        {
                          name: "Low Performers (<10%)",
                          value: topAgents.filter(
                            (a) => a.averageCloseRate < 0.1
                          ).length,
                        },
                      ]}
                      category="value"
                      index="name"
                      valueFormatter={(value) => `${value} agents`}
                      colors={["emerald", "amber", "red"]}
                      showAnimation={true}
                    />
                  </Card>
                </Grid>
              </Card>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}
