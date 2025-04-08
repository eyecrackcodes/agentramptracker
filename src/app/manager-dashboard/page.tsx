import { Metadata } from "next";
import TeamOverview from "../../components/TeamOverview";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Manager Dashboard | Agent Ramp Tracker",
  description: "View and manage your teams' performance and development",
};

export default async function ManagerDashboard() {
  const headersList = headers();
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const host = headersList.get('host') || 'localhost:3000';
  const response = await fetch(`${protocol}://${host}/api/teams`, {
    cache: "no-store",
  });
  const teams = await response.json();

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Manager Dashboard</h1>
      <div className="grid gap-6">
        {teams.map((team: any) => (
          <TeamOverview key={team.id} team={team} />
        ))}
      </div>
    </main>
  );
} 