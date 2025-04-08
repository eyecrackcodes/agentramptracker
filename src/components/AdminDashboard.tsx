import { useState, useEffect } from "react";
import { Card, Title, Text, Grid, Select, SelectItem } from "@tremor/react";
import { User, AgentRampMetric } from "@/types";
import { MetricCard } from "./MetricCard";
import { MONTHLY_TARGETS } from "@/types";
import { prisma } from "@/lib/prisma";

export function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [metrics, setMetrics] = useState<AgentRampMetric[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }

    fetchUsers();
  }, []);

  useEffect(() => {
    async function fetchMetrics() {
      if (!selectedUser) return;

      try {
        const response = await fetch(`/api/metrics?userId=${selectedUser}`);
        if (!response.ok) throw new Error("Failed to fetch metrics");
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [selectedUser]);

  const filteredUsers = users.filter((user) => {
    if (selectedTeam && user.team !== selectedTeam) return false;
    if (selectedClass && user.class !== selectedClass) return false;
    return true;
  });

  const teams = Array.from(
    new Set(users.map((user) => user.team).filter(Boolean))
  );
  const classes = Array.from(
    new Set(users.map((user) => user.class).filter(Boolean))
  );

  return (
    <div className="p-4 space-y-6">
      <Card>
        <Title>Admin Dashboard</Title>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            value={selectedTeam}
            onValueChange={setSelectedTeam}
            placeholder="Filter by Team"
          >
            <SelectItem value="">All Teams</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team} value={team}>
                {team}
              </SelectItem>
            ))}
          </Select>

          <Select
            value={selectedClass}
            onValueChange={setSelectedClass}
            placeholder="Filter by Class"
          >
            <SelectItem value="">All Classes</SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls} value={cls}>
                {cls}
              </SelectItem>
            ))}
          </Select>

          <Select
            value={selectedUser}
            onValueChange={setSelectedUser}
            placeholder="Select Agent"
          >
            <SelectItem value="">Select an Agent</SelectItem>
            {filteredUsers.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.email}
              </SelectItem>
            ))}
          </Select>
        </div>
      </Card>

      {loading ? (
        <Text>Loading metrics...</Text>
      ) : selectedUser ? (
        <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
          {metrics.map((metric) => {
            const target = MONTHLY_TARGETS.find(
              (t) => t.monthNumber === metric.monthNumber
            );
            if (!target) return null;

            return (
              <MetricCard key={metric.id} metric={metric} target={target} />
            );
          })}
        </Grid>
      ) : (
        <Text>Select an agent to view their metrics</Text>
      )}
    </div>
  );
}
