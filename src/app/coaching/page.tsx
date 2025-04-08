import { Card, Title, Text } from "@tremor/react";
import { getAgents } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export default async function CoachingDashboard() {
  const agents = await getAgents();

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title>Coaching Dashboard</Title>
          <Text>Manage coaching sessions, call scores, and development goals</Text>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {agent.firstName} {agent.lastName}
                </h3>
                <p className="text-sm text-gray-500">{agent.teamName}</p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Last Coaching Session:</span>
                <span className="text-gray-500">Not Available</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Recent Call Score:</span>
                <span className="text-gray-500">Not Available</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Active Goals:</span>
                <span className="text-gray-500">0</span>
              </div>
            </div>
            <div className="mt-4">
              <Link href={`/coaching/${agent.id}`}>
                <Button className="w-full">View Details</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
} 