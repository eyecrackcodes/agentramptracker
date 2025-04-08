"use client";

import { Select, SelectItem } from "@tremor/react";

interface Team {
  id: string;
  name: string;
}

interface TeamSelectorProps {
  teams: Team[];
  selectedTeamId: string;
  onTeamChange: (teamId: string) => void;
}

export function TeamSelector({
  teams,
  selectedTeamId,
  onTeamChange,
}: TeamSelectorProps) {
  return (
    <div className="w-64">
      <Select
        value={selectedTeamId}
        onValueChange={onTeamChange}
        placeholder="Select a team"
      >
        {teams.map((team) => (
          <SelectItem key={team.id} value={team.id}>
            {team.name}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}
