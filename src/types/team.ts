export interface Team {
  id: string;
  name: string;
  agents: Agent[];
}

export interface Agent {
  id: string;
  name: string;
  teamId: string;
  startDate?: string;
  role?: string;
  email?: string;
} 