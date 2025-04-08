import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Agent } from "@/types/team";

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">{agent.name}</h3>
        <p className="text-sm text-muted-foreground">ID: {agent.id}</p>
        <div className="flex gap-2 mt-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/agents/${agent.id}`}>View Details</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/coaching/${agent.id}`}>Coaching</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
} 