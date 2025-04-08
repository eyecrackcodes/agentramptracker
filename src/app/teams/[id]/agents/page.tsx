"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Team, Agent } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { AgentDialog } from "@/components/AgentDialog";
import Link from "next/link";

type AgentWithTeam = Agent & { team: Team };

export default function TeamAgentsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [agents, setAgents] = useState<AgentWithTeam[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentWithTeam | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchTeamAndAgents();
    fetchTeams();
  }, [params.id]);

  const fetchTeamAndAgents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch team details
      const teamResponse = await fetch(`/api/teams/${params.id}`);

      if (!teamResponse.ok) {
        const teamError = await teamResponse.json();
        throw new Error(teamError.error || "Failed to fetch team");
      }

      const teamData = await teamResponse.json();
      setTeam(teamData);

      // Fetch team's agents
      const agentsResponse = await fetch(`/api/agents?teamId=${params.id}`);

      if (!agentsResponse.ok) {
        const agentsError = await agentsResponse.json();
        throw new Error(agentsError.error || "Failed to fetch agents");
      }

      const agentsData = await agentsResponse.json();
      setAgents(agentsData);
    } catch (err) {
      console.error("Error in fetchTeamAndAgents:", err);
      setError(err instanceof Error ? err.message : "Failed to load team data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch teams");
      }
      const data = await response.json();
      setTeams(data);
    } catch (err) {
      console.error("Error fetching teams:", err);
      // We don't set the main error state here as it's not critical
    }
  };

  const handleAddAgent = () => {
    setSelectedAgent(null);
    setIsDialogOpen(true);
  };

  const handleEditAgent = (agent: AgentWithTeam) => {
    setSelectedAgent(agent);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    teamId: string;
    targetLeadsPerDay: number;
    startDate: Date;
  }) => {
    try {
      const url = selectedAgent
        ? `/api/agents/${selectedAgent.id}`
        : "/api/agents";
      const method = selectedAgent ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, teamId: params.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save agent");
      }

      fetchTeamAndAgents(); // Refresh the list
      setIsDialogOpen(false);
      setSelectedAgent(null);
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError(err instanceof Error ? err.message : "Failed to save agent");
    }
  };

  const handleDelete = async (agentId: string) => {
    if (!confirm("Are you sure you want to delete this agent?")) return;

    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete agent");
      }

      fetchTeamAndAgents(); // Refresh the list
    } catch (err) {
      console.error("Error in handleDelete:", err);
      setError(err instanceof Error ? err.message : "Failed to delete agent");
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-10 mx-auto max-w-7xl">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/teams")}
            className="mr-4"
          >
            Back to Teams
          </Button>
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-10 mx-auto max-w-7xl">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/teams")}
            className="mr-4"
          >
            Back to Teams
          </Button>
          <h1 className="text-2xl font-bold">Error</h1>
        </div>
        <div className="bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] p-4 rounded-md">
          {error}
        </div>
        <Button onClick={fetchTeamAndAgents} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-4 md:p-10 mx-auto max-w-7xl">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/teams")}
            className="mr-4"
          >
            Back to Teams
          </Button>
          <h1 className="text-2xl font-bold">Team Not Found</h1>
        </div>
        <p>The team you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={() => router.push("/teams")} className="mt-4">
          View All Teams
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 mx-auto max-w-7xl">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Button
            variant="outline"
            onClick={() => router.push("/teams")}
            className="mr-4"
          >
            Back to Teams
          </Button>
          <h1 className="text-2xl font-bold">{team.name} - Agents</h1>
        </div>
        <Button onClick={handleAddAgent}>Add Agent</Button>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <p className="text-[hsl(var(--muted-foreground))]">
            No agents in this team yet.
          </p>
          <Button onClick={handleAddAgent} className="mt-4">
            Add Your First Agent
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="border rounded-lg p-4 flex flex-col h-full"
            >
              <div className="flex justify-between mb-2">
                <h2 className="text-xl font-semibold">
                  {agent.firstName} {agent.lastName}
                </h2>
              </div>
              <div className="flex-grow">
                <p className="text-[hsl(var(--muted-foreground))]">
                  {agent.email}
                </p>
                <p className="mt-2">
                  <span className="font-medium">Started:</span>{" "}
                  {new Date(agent.startDate).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Target Leads/Day:</span>{" "}
                  {agent.targetLeadsPerDay}
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditAgent(agent)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(agent.id)}
                >
                  Delete
                </Button>
                <Link href={`/agents/${agent.id}/metrics`} passHref>
                  <Button size="sm" className="ml-auto">
                    View Metrics
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <AgentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        agent={selectedAgent}
        teams={teams}
        defaultTeamId={params.id}
      />
    </div>
  );
}
