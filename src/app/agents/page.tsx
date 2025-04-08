"use client";

import { useState, useEffect } from "react";
import { Agent, Team } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { AgentDialog } from "@/components/AgentDialog";
import Link from "next/link";
import { BarChart, UserPlus, Users, ArrowRightLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type AgentWithTeam = Agent & { team: Team };

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentWithTeam[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentWithTeam | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");

  useEffect(() => {
    fetchAgents();
    fetchTeams();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents");
      if (!response.ok) throw new Error("Failed to fetch agents");
      const data = await response.json();
      setAgents(data);
    } catch (err) {
      setError("Failed to load agents");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams");
      if (!response.ok) throw new Error("Failed to fetch teams");
      const data = await response.json();
      setTeams(data);
    } catch (err) {
      console.error(err);
    }
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
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save agent");

      fetchAgents(); // Refresh the list
      setIsDialogOpen(false);
      setIsQuickAddOpen(false);
      setSelectedAgent(null);
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (agentId: string) => {
    if (!confirm("Are you sure you want to delete this agent?")) return;

    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete agent");

      fetchAgents(); // Refresh the list
    } catch (err) {
      console.error(err);
      setError("Failed to delete agent");
    }
  };

  const handleTeamTransfer = async () => {
    if (!selectedAgent || !selectedTeamId) return;

    try {
      const response = await fetch(`/api/agents/${selectedAgent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: selectedAgent.firstName,
          lastName: selectedAgent.lastName,
          email: selectedAgent.email,
          teamId: selectedTeamId,
          targetLeadsPerDay: selectedAgent.targetLeadsPerDay,
          startDate: selectedAgent.startDate,
        }),
      });

      if (!response.ok) throw new Error("Failed to transfer agent");

      fetchAgents(); // Refresh the list
      setIsTransferDialogOpen(false);
      setSelectedAgent(null);
      setSelectedTeamId("");
    } catch (err) {
      console.error(err);
      setError("Failed to transfer agent");
    }
  };

  const openTransferDialog = (agent: AgentWithTeam) => {
    setSelectedAgent(agent);
    setSelectedTeamId("");
    setIsTransferDialogOpen(true);
  };

  const openQuickAddDialog = (teamId?: string) => {
    setSelectedAgent(null);
    setSelectedTeamId(teamId || "");
    setIsQuickAddOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error)
    return <div className="text-[hsl(var(--destructive))]">{error}</div>;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agents</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => openQuickAddDialog()}
            className="flex items-center"
          >
            <UserPlus className="h-4 w-4 mr-2" /> Quick Add Agent
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>Add Agent</Button>
        </div>
      </div>

      {/* Team sections */}
      {teams.map((team) => {
        const teamAgents = agents.filter((agent) => agent.team.id === team.id);
        if (teamAgents.length === 0) return null;

        return (
          <div key={team.id} className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">{team.name}</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openQuickAddDialog(team.id)}
              >
                <UserPlus className="h-4 w-4 mr-2" /> Add to Team
              </Button>
            </div>

            <div className="bg-[hsl(var(--background))] rounded-lg border border-[hsl(var(--border))]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Start Date</th>
                    <th className="px-4 py-3 text-left">Target Leads/Day</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Tenure (mo)</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teamAgents.map((agent) => (
                    <tr
                      key={agent.id}
                      className="border-b border-[hsl(var(--border))] last:border-0"
                    >
                      <td className="px-4 py-3">
                        {agent.firstName} {agent.lastName}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(agent.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">{agent.targetLeadsPerDay}</td>
                      <td className="px-4 py-3">{agent.status || "P"}</td>
                      <td className="px-4 py-3">
                        {agent.tenure?.toFixed(1) || "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/agents/${agent.id}/metrics`} passHref>
                          <Button variant="outline" size="sm" className="mr-2">
                            <BarChart className="h-4 w-4 mr-1" /> Metrics
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => openTransferDialog(agent)}
                        >
                          <ArrowRightLeft className="h-4 w-4 mr-1" /> Transfer
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => {
                            setSelectedAgent(agent);
                            setIsDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(agent.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Regular Agent Dialog */}
      <AgentDialog
        agent={selectedAgent || undefined}
        teams={teams}
        defaultTeamId={selectedTeamId}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedAgent(null);
        }}
        onSubmit={handleSubmit}
      />

      {/* Quick Add Dialog - same component, different flag */}
      <AgentDialog
        teams={teams}
        defaultTeamId={selectedTeamId}
        isOpen={isQuickAddOpen}
        isQuickAdd={true}
        onClose={() => {
          setIsQuickAddOpen(false);
          setSelectedAgent(null);
        }}
        onSubmit={handleSubmit}
      />

      {/* Team Transfer Dialog */}
      <AlertDialog
        open={isTransferDialogOpen}
        onOpenChange={setIsTransferDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transfer Agent to Another Team</AlertDialogTitle>
            <AlertDialogDescription>
              Select the new team for {selectedAgent?.firstName}{" "}
              {selectedAgent?.lastName}.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <SelectTrigger>
                <SelectValue placeholder="Select new team" />
              </SelectTrigger>
              <SelectContent>
                {teams
                  .filter((team) => team.id !== selectedAgent?.team?.id)
                  .map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTeamTransfer}
              disabled={!selectedTeamId}
            >
              Transfer Agent
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
