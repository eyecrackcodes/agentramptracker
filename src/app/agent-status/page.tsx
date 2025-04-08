"use client";

import { Card, Title, Text } from "@tremor/react";
import { AgentStatusManager } from "@/components/AgentStatusManager";

export default function AgentStatusPage() {
  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Agent Status Manager</Title>
      <Text className="mb-4">
        Monitor agent status transitions between Training and Performance queues
      </Text>

      <AgentStatusManager />
    </main>
  );
}
