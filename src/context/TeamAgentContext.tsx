"use client";

import React, { createContext, useContext, useState } from "react";
import { Agent, Team } from "@prisma/client";

interface TeamAgentContextType {
  selectedTeam: Team | null;
  setSelectedTeam: (team: Team | null) => void;
  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent | null) => void;
}

const TeamAgentContext = createContext<TeamAgentContextType | undefined>(
  undefined
);

export function TeamAgentProvider({ children }: { children: React.ReactNode }) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  return (
    <TeamAgentContext.Provider
      value={{
        selectedTeam,
        setSelectedTeam,
        selectedAgent,
        setSelectedAgent,
      }}
    >
      {children}
    </TeamAgentContext.Provider>
  );
}

export function useTeamAgent() {
  const context = useContext(TeamAgentContext);
  if (context === undefined) {
    throw new Error("useTeamAgent must be used within a TeamAgentProvider");
  }
  return context;
}
