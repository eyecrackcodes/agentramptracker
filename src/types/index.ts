export type UserRole = "ADMIN" | "AGENT";

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  team?: string;
  class?: string;
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentRampMetric {
  id: string;
  userId: string;
  monthNumber: number;
  weekNumber: number;
  closeRate: number;
  avgPremium: number;
  placeRate: number;
  capScore?: number;
  leadsTakenPerDay: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlyTarget {
  monthNumber: number;
  closeRate: number;
  avgPremium: number;
  placeRate: number;
  capScore?: number;
}

export const MONTHLY_TARGETS: MonthlyTarget[] = [
  {
    monthNumber: 2,
    closeRate: 10,
    avgPremium: 1150,
    placeRate: 65,
  },
  {
    monthNumber: 3,
    closeRate: 12,
    avgPremium: 1150,
    placeRate: 65,
    capScore: 90,
  },
  {
    monthNumber: 4,
    closeRate: 15,
    avgPremium: 1150,
    placeRate: 65,
    capScore: 112,
  },
  {
    monthNumber: 5,
    closeRate: 18,
    avgPremium: 1150,
    placeRate: 65,
    capScore: 134,
  },
  {
    monthNumber: 6,
    closeRate: 20,
    avgPremium: 1150,
    placeRate: 65,
    capScore: 150,
  },
];
