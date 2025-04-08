"use client";

import { useState, useEffect } from "react";
import { Team, Agent } from "@prisma/client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeamAgentSelectorProps {
  onAgentSelect: (agentId: string) => void;
}

export function TeamAgentSelector({ onAgentSelect }: TeamAgentSelectorProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeamId) {
      fetchAgents(selectedTeamId);
    } else {
      setAgents([]);
    }
  }, [selectedTeamId]);

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams");
      if (!response.ok) throw new Error("Failed to fetch teams");
      const data = await response.json();
      setTeams(data);
    } catch (err) {
      setError("Failed to load teams");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgents = async (teamId: string) => {
    try {
      const response = await fetch(`/api/agents?teamId=${teamId}`);
      if (!response.ok) throw new Error("Failed to fetch agents");
      const data = await response.json();
      setAgents(data);
    } catch (err) {
      setError("Failed to load agents");
      console.error(err);
    }
  };

  if (isLoading) return <div>Loading teams...</div>;
  if (error)
    return <div className="text-[hsl(var(--destructive))]">{error}</div>;

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="team">Select Team</Label>
        <Select
          value={selectedTeamId}
          onValueChange={(value) => {
            setSelectedTeamId(value);
            onAgentSelect(""); // Clear selected agent when team changes
          }}
        >
          <SelectTrigger id="team">
            <SelectValue placeholder="Select a team" />
          </SelectTrigger>
          <SelectContent>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTeamId && (
        <div className="grid gap-2">
          <Label htmlFor="agent">Select Agent</Label>
          <Select onValueChange={onAgentSelect}>
            <SelectTrigger id="agent">
              <SelectValue placeholder="Select an agent" />
            </SelectTrigger>
            <SelectContent>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.firstName} {agent.lastName}
                  {agent.status && (
                    <span className="ml-2 text-gray-500 text-xs">
                      [{agent.status}]
                    </span>
                  )}
                  {agent.tenure && (
                    <span className="ml-2 text-gray-500 text-xs">
                      ({agent.tenure} mo)
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
