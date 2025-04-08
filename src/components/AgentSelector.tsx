import { Select, SelectItem } from "@tremor/react";

interface Agent {
  id: string;
  firstName: string;
  lastName: string;
}

interface AgentSelectorProps {
  agents: Agent[];
  selectedAgentId: string;
  onAgentChange: (agentId: string) => void;
}

export function AgentSelector({
  agents,
  selectedAgentId,
  onAgentChange,
}: AgentSelectorProps) {
  return (
    <div className="w-64">
      <Select
        value={selectedAgentId}
        onValueChange={onAgentChange}
        placeholder="Select an agent"
      >
        {agents.map((agent) => (
          <SelectItem key={agent.id} value={agent.id}>
            {`${agent.firstName} ${agent.lastName}`}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}
