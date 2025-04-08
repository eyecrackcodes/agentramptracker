"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  teamId: string;
  status: string;
  startDate: string;
}

interface Team {
  id: string;
  name: string;
  agents: Agent[];
}

export default function ManagerDashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams");
      if (!response.ok) throw new Error("Failed to fetch teams");
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "T":
        return "bg-blue-100 text-blue-800";
      case "P":
        return "bg-green-100 text-green-800";
      case "A":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "T":
        return "Training";
      case "P":
        return "Performance";
      case "A":
        return "Archived";
      default:
        return "Unknown";
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manager Dashboard</h1>
      </div>

      <div className="grid gap-6">
        {teams.map((team) => (
          <Card key={team.id} className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">{team.name}</h2>
              <span className="text-sm text-gray-500">
                {team.agents.length} Agents
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {team.agents.map((agent) => (
                <Card
                  key={agent.id}
                  className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/coaching/${agent.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {agent.firstName} {agent.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{agent.email}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(
                        agent.status
                      )}`}
                    >
                      {getStatusText(agent.status)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Started:{" "}
                      {new Date(agent.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/coaching/${agent.id}`);
                      }}
                    >
                      View Coaching
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 