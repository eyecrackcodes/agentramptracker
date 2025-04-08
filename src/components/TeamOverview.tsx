import { Team } from "@/types/team";
import { Card } from "./ui/card";
import Link from "next/link";
import { Button } from "./ui/button";

interface TeamOverviewProps {
  team: Team;
}

export default function TeamOverview({ team }: TeamOverviewProps) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">{team.name}</h2>
        <span className="text-muted-foreground">{team.agents?.length || 0} Agents</span>
      </div>
      <div className="grid gap-4">
        {team.agents?.map((agent) => (
          <div key={agent.id} className="border rounded-lg p-4">
            <div className="flex flex-col space-y-2">
              <p className="text-sm text-muted-foreground">ID: {agent.id}</p>
              <p className="font-medium">{agent.name || 'Unnamed Agent'}</p>
              <div className="flex space-x-2">
                <Button variant="outline" asChild>
                  <Link href={`/agents/${agent.id}`}>View Details</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/coaching/${agent.id}`}>Coaching</Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
} 