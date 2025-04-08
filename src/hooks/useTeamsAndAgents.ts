"use client";

import { useState, useEffect } from "react";

interface Team {
  id: string;
  name: string;
  description?: string;
  agents: Agent[];
}

interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  teamId: string;
  startDate: string;
}

export function useTeamsAndAgents() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeams() {
      try {
        const response = await fetch("/api/teams");
        if (!response.ok) {
          throw new Error("Failed to fetch teams");
        }
        const data = await response.json();
        setTeams(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchTeams();
  }, []);

  async function getAgentsByTeam(teamId: string) {
    try {
      const response = await fetch(`/api/agents?teamId=${teamId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch agents");
      }
      const data = await response.json();
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "An error occurred");
    }
  }

  return {
    teams,
    loading,
    error,
    getAgentsByTeam,
  };
}
