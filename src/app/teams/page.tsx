"use client";

import { useState, useEffect } from "react";
import { Team, Agent } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { TeamDialog } from "@/components/TeamDialog";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TeamWithAgents = Team & {
  agents: Agent[];
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamWithAgents[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamWithAgents | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/teams");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch teams");
      }
      const data = await response.json();
      setTeams(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleAddTeam = () => {
    setSelectedTeam(null);
    setIsDialogOpen(true);
  };

  const handleEditTeam = (team: TeamWithAgents) => {
    setSelectedTeam(team);
    setIsDialogOpen(true);
  };

  const handleViewAgents = async (teamId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch team");
      }
      router.push(`/teams/${teamId}/agents`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch team");
    }
  };

  const handleSubmit = async (data: { name: string; description: string }) => {
    try {
      const response = await fetch(
        selectedTeam ? `/api/teams/${selectedTeam.id}` : "/api/teams",
        {
          method: selectedTeam ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save team");
      }

      await fetchTeams();
      setIsDialogOpen(false);
      setSelectedTeam(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save team");
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-10 mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Teams</h1>
          <Button onClick={handleAddTeam}>Add Team</Button>
        </div>
        <div className="text-center">Loading teams...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 mx-auto max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teams</h1>
        <Button onClick={handleAddTeam}>Add Team</Button>
      </div>

      {error && (
        <div className="bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className="border border-[hsl(var(--border))] rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-xl font-semibold">{team.name}</h2>
                {team.description && (
                  <p className="text-[hsl(var(--muted-foreground))] mt-1">
                    {team.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleEditTeam(team)}>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleViewAgents(team.id)}
                >
                  View Agents
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-medium mb-2">
                Agents ({team.agents.length})
              </h3>
              {team.agents.length > 0 ? (
                <ul className="space-y-2">
                  {team.agents.map((agent) => (
                    <li
                      key={agent.id}
                      className="flex items-center justify-between p-2 bg-[hsl(var(--accent))] rounded-md"
                    >
                      <span>
                        {agent.firstName} {agent.lastName}
                      </span>
                      <span className="text-[hsl(var(--muted-foreground))]">
                        {agent.email}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[hsl(var(--muted-foreground))]">
                  No agents in this team
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <TeamDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        team={selectedTeam}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
