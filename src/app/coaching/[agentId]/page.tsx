import { notFound } from "next/navigation";
import { getAgentById } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CoachingSessions from "@/components/coaching/CoachingSessions";
import CallScores from "@/components/coaching/CallScores";
import DevelopmentGoals from "@/components/coaching/DevelopmentGoals";

export default async function CoachingPage({
  params,
}: {
  params: { agentId: string };
}) {
  const agent = await getAgentById(params.agentId);

  if (!agent) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">
        Coaching Dashboard - {agent.firstName} {agent.lastName}
      </h1>

      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions">Coaching Sessions</TabsTrigger>
          <TabsTrigger value="calls">Call Scores</TabsTrigger>
          <TabsTrigger value="goals">Development Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Coaching Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <CoachingSessions agentId={params.agentId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calls">
          <Card>
            <CardHeader>
              <CardTitle>Call Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <CallScores agentId={params.agentId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle>Development Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <DevelopmentGoals agentId={params.agentId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 