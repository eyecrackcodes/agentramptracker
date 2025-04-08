"use client";

import { useState, useEffect } from "react";
import { Card, Title, Text } from "@tremor/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTeamAgent } from "@/context/TeamAgentContext";
import { Agent, Team } from "@prisma/client";

export function QuickMetricsEntry() {
  const { selectedTeam, selectedAgent, setSelectedTeam, setSelectedAgent } =
    useTeamAgent();
  const [teams, setTeams] = useState<Team[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [formData, setFormData] = useState({
    closeRate: "",
    averagePremium: "",
    placeRate: "",
    leadsPerDay: "",
  });
  const [capScore, setCapScore] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current month and week
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentWeek = Math.ceil(now.getDate() / 7);

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchAgents(selectedTeam);
    }
  }, [selectedTeam]);

  useEffect(() => {
    // Calculate CAP score
    const closeRateVal = parseFloat(formData.closeRate) / 100 || 0;
    const premiumVal = parseFloat(formData.averagePremium) || 0;
    const placeRateVal = parseFloat(formData.placeRate) / 100 || 0;

    const calculatedCapScore = closeRateVal * premiumVal * placeRateVal;
    setCapScore(Math.round(calculatedCapScore).toString());
  }, [formData.closeRate, formData.averagePremium, formData.placeRate]);

  const fetchTeams = async () => {
    try {
      setLoadingTeams(true);
      const response = await fetch("/api/teams");
      if (!response.ok) throw new Error("Failed to fetch teams");
      const data = await response.json();
      setTeams(data);
    } catch (err) {
      setError("Failed to load teams");
      console.error(err);
    } finally {
      setLoadingTeams(false);
    }
  };

  const fetchAgents = async (team: Team) => {
    try {
      setLoadingAgents(true);
      const response = await fetch(`/api/agents?teamId=${team.id}`);
      if (!response.ok) throw new Error("Failed to fetch agents");
      const data = await response.json();
      setAgents(data);
    } catch (err) {
      setError("Failed to load agents");
      console.error(err);
    } finally {
      setLoadingAgents(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAgent) {
      setError("Please select an agent");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/metrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          month: currentMonth,
          week: currentWeek,
          closeRate: parseFloat(formData.closeRate) / 100, // Convert to decimal
          averagePremium: parseFloat(formData.averagePremium),
          placeRate: parseFloat(formData.placeRate) / 100, // Convert to decimal
          capScore: parseInt(capScore),
          leadsPerDay: parseFloat(formData.leadsPerDay),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save metrics");
      }

      // Success - reset form
      setFormData({
        closeRate: "",
        averagePremium: "",
        placeRate: "",
        leadsPerDay: "",
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save metrics");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-4">
      <Title>Quick Metrics Entry</Title>
      <Text className="mb-4">Quickly add metrics for your agents</Text>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="team">Team</Label>
          <select
            id="team"
            className="w-full rounded-md border border-gray-300 p-2 mt-1"
            value={selectedTeam?.id || ""}
            onChange={(e) => {
              const team = teams.find(t => t.id === e.target.value);
              setSelectedTeam(team || null);
            }}
            disabled={loadingTeams}
          >
            <option value="">Select a team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="agent">Agent</Label>
          <select
            id="agent"
            className="w-full rounded-md border border-gray-300 p-2 mt-1"
            value={selectedAgent?.id || ""}
            onChange={(e) => {
              const agent = agents.find(a => a.id === e.target.value);
              setSelectedAgent(agent || null);
            }}
            disabled={!selectedTeam || loadingAgents}
          >
            <option value="">Select an agent</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.firstName} {agent.lastName}
                {agent.status && ` [${agent.status}]`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t border-gray-200 my-4 pt-4">
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <div>
            <Label htmlFor="closeRate">Close Rate (%)</Label>
            <Input
              id="closeRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.closeRate}
              onChange={(e) =>
                setFormData({ ...formData, closeRate: e.target.value })
              }
              placeholder="e.g. 15.5"
              className="mt-1"
            />
          </div>

          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <Label htmlFor="averagePremium" className="text-sm font-medium">
              Avg Premium ($)
            </Label>
            <Input
              id="averagePremium"
              type="number"
              min="0"
              step="10"
              value={formData.averagePremium}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  averagePremium: e.target.value,
                })
              }
              className="w-full"
              required
            />
          </div>

          <div>
            <Label htmlFor="placeRate">Place Rate (%)</Label>
            <Input
              id="placeRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.placeRate}
              onChange={(e) =>
                setFormData({ ...formData, placeRate: e.target.value })
              }
              placeholder="e.g. 65.5"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="leadsPerDay">Leads Per Day</Label>
            <Input
              id="leadsPerDay"
              type="number"
              min="0"
              step="0.1"
              value={formData.leadsPerDay}
              onChange={(e) =>
                setFormData({ ...formData, leadsPerDay: e.target.value })
              }
              placeholder="e.g. 8"
              className="mt-1"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-4 flex items-center justify-between border-t border-gray-200 pt-4 mt-2">
            <div className="font-medium">
              <span className="text-gray-700">CAP Score: </span>
              <span className="text-blue-600 text-lg">{capScore}</span>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !selectedAgent}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? "Saving..." : "Save Metrics"}
            </Button>
          </div>
        </form>
      </div>

      {error && (
        <Alert className="mt-4 bg-red-50 border-red-200 text-red-800">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mt-4 bg-green-50 border-green-200 text-green-800">
          <AlertDescription>Metrics saved successfully!</AlertDescription>
        </Alert>
      )}
    </Card>
  );
}
