"use client";

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
  TextInput,
  Select,
  SelectItem,
} from "@tremor/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Search, Filter, X } from "lucide-react";

// Define Agent interface based on Prisma schema
interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  teamId: string;
  teamName?: string;
  startDate: Date;
  status?: string;
  team?: {
    id: string;
    name: string;
  };
}

interface Team {
  id: string;
  name: string;
  agents: Agent[];
}

export default function CoachingDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch agents
        const agentsResponse = await fetch("/api/agents?include=team");
        if (!agentsResponse.ok) {
          throw new Error(`Failed to fetch agents: ${agentsResponse.status}`);
        }
        const agentsData = await agentsResponse.json();
        setAgents(agentsData);

        // Group agents by team for the team view
        const teamsMap: Map<string, Team> = new Map();

        agentsData.forEach((agent: Agent) => {
          const teamId = agent.teamId;
          const teamName = agent.team?.name || "Unknown Team";

          if (!teamsMap.has(teamId)) {
            teamsMap.set(teamId, {
              id: teamId,
              name: teamName,
              agents: [],
            });
          }

          teamsMap.get(teamId)?.agents.push(agent);
        });

        setTeams(Array.from(teamsMap.values()));
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter and sort agents
  const filteredAgents = agents.filter((agent) => {
    // Apply search filter
    const nameMatch = `${agent.firstName} ${agent.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Apply status filter
    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "active" && agent.status !== "A") ||
      (statusFilter === "performance" && agent.status === "P") ||
      (statusFilter === "training" && agent.status === "T") ||
      (statusFilter === "archived" && agent.status === "A");

    // Apply team filter
    const teamMatch = teamFilter === "all" || agent.teamId === teamFilter;

    return nameMatch && statusMatch && teamMatch;
  });

  // Sort agents
  const sortedAgents = [...filteredAgents].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`
        );
      case "team":
        return (a.team?.name || "").localeCompare(b.team?.name || "");
      case "status":
        return (a.status || "").localeCompare(b.status || "");
      default:
        return 0;
    }
  });

  // Group teams for the team view
  const filteredTeams = teams
    .map((team) => ({
      ...team,
      agents: team.agents
        .filter((agent) => {
          const nameMatch = `${agent.firstName} ${agent.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const statusMatch =
            statusFilter === "all" ||
            (statusFilter === "active" && agent.status !== "A") ||
            (statusFilter === "performance" && agent.status === "P") ||
            (statusFilter === "training" && agent.status === "T") ||
            (statusFilter === "archived" && agent.status === "A");
          return nameMatch && statusMatch;
        })
        .sort((a, b) =>
          `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`
          )
        ),
    }))
    .filter((team) => team.agents.length > 0);

  const renderAgentCard = (agent: Agent) => (
    <Card key={agent.id} className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">
            {agent.firstName} {agent.lastName}
          </h3>
          <p className="text-sm text-gray-500">
            {agent.team?.name || agent.teamName || "No Team"}
          </p>
          <div className="mt-1">
            <Badge status={agent.status || "P"} />
          </div>
        </div>
        <Users className="h-8 w-8 text-gray-400" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Last Coaching Session:</span>
          <span className="text-gray-500">Not Available</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Recent Call Score:</span>
          <span className="text-gray-500">Not Available</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Active Goals:</span>
          <span className="text-gray-500">0</span>
        </div>
      </div>
      <div className="mt-4">
        <Link href={`/coaching/${agent.id}`}>
          <Button className="w-full">View Details</Button>
        </Link>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <Title>Coaching Dashboard</Title>
        <Text>Loading agents...</Text>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <Title>Coaching Dashboard</Title>
        <Card className="mt-6 p-6 bg-red-50 border border-red-200">
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            Error Loading Agents
          </h2>
          <p className="text-red-600">{error}</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title>Coaching Dashboard</Title>
          <Text>
            Manage coaching sessions, call scores, and development goals
          </Text>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Status
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active (P+T)</option>
              <option value="performance">Performance</option>
              <option value="training">Training</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Team
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
            >
              <option value="all">All Teams</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Sort By
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Name</option>
              <option value="team">Team</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </Card>

      <TabGroup>
        <TabList className="mb-6">
          <Tab>All Agents ({filteredAgents.length})</Tab>
          <Tab>By Team ({filteredTeams.length})</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            {sortedAgents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedAgents.map((agent) => renderAgentCard(agent))}
              </div>
            ) : (
              <Card className="p-6 bg-blue-50 border border-blue-200">
                <h2 className="text-xl font-semibold text-blue-700 mb-2">
                  No Agents Found
                </h2>
                <p className="text-gray-700">
                  No agents match your current filters. Try adjusting your
                  search or filters.
                </p>
              </Card>
            )}
          </TabPanel>

          <TabPanel>
            {filteredTeams.length > 0 ? (
              <div className="space-y-8">
                {filteredTeams.map((team) => (
                  <div key={team.id} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold">{team.name}</h2>
                      <span className="text-sm text-gray-500">
                        ({team.agents.length} agents)
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {team.agents.map((agent) => renderAgentCard(agent))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-6 bg-blue-50 border border-blue-200">
                <h2 className="text-xl font-semibold text-blue-700 mb-2">
                  No Teams Found
                </h2>
                <p className="text-gray-700">
                  No teams match your current filters. Try adjusting your search
                  or filters.
                </p>
              </Card>
            )}
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}

// Component for displaying agent status badge
function Badge({ status }: { status: string }) {
  let color, label;

  switch (status) {
    case "P":
      color = "bg-blue-100 text-blue-800";
      label = "Performance";
      break;
    case "T":
      color = "bg-amber-100 text-amber-800";
      label = "Training";
      break;
    case "A":
      color = "bg-gray-100 text-gray-800";
      label = "Archived";
      break;
    default:
      color = "bg-green-100 text-green-800";
      label = "Active";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      {label}
    </span>
  );
}
