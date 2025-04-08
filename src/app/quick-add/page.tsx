"use client";

import { QuickMetricsEntry } from "@/components/QuickMetricsEntry";
import { TeamAgentProvider } from "@/context/TeamAgentContext";

export default function QuickAddPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Quick Add Metrics</h1>

      <TeamAgentProvider>
        <QuickMetricsEntry />
      </TeamAgentProvider>
    </div>
  );
}
