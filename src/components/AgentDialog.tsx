"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Agent, Team } from "@prisma/client";
import {
  calculateStartDateFromTenure,
  calculateTenureFromStartDate,
  formatDate,
} from "@/utils/dates";

interface AgentDialogProps {
  agent?: Agent & { team: Team };
  teams: Team[];
  defaultTeamId?: string;
  isOpen?: boolean;
  onClose?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isQuickAdd?: boolean;
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    email: string;
    teamId: string;
    targetLeadsPerDay: number;
    startDate: Date;
    status: string;
    tenure?: number;
  }) => Promise<void>;
}

export function AgentDialog({
  agent,
  teams,
  defaultTeamId,
  isOpen,
  onClose,
  open,
  onOpenChange,
  isQuickAdd = false,
  onSubmit,
}: AgentDialogProps) {
  // Support both prop patterns
  const isDialogOpen = open ?? isOpen ?? false;
  const handleOpenChange = onOpenChange ?? onClose;

  const [formData, setFormData] = useState({
    firstName: agent?.firstName || "",
    lastName: agent?.lastName || "",
    email: agent?.email || "",
    teamId: agent?.teamId || defaultTeamId || teams[0]?.id || "",
    targetLeadsPerDay: agent?.targetLeadsPerDay || 8,
    startDate: agent?.startDate ? new Date(agent.startDate) : new Date(),
    status: agent?.status || "P",
    tenure: agent?.tenure || 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add refs to track which field was last updated
  const lastUpdatedField = useRef<string | null>(null);

  // Update form data when the agent changes
  useEffect(() => {
    if (agent) {
      setFormData({
        firstName: agent.firstName || "",
        lastName: agent.lastName || "",
        email: agent.email || "",
        teamId: agent.teamId || defaultTeamId || teams[0]?.id || "",
        targetLeadsPerDay: agent.targetLeadsPerDay || 8,
        startDate: agent.startDate ? new Date(agent.startDate) : new Date(),
        status: agent.status || "P",
        tenure: agent.tenure || 0,
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        teamId: defaultTeamId || teams[0]?.id || "",
        targetLeadsPerDay: 8,
        startDate: new Date(),
        status: "P",
        tenure: 0,
      });
    }
  }, [agent, teams, defaultTeamId]);

  // Fix the circular dependency between tenure and start date
  const handleTenureChange = (value: number) => {
    lastUpdatedField.current = "tenure";
    const calculatedStartDate = calculateStartDateFromTenure(value);
    setFormData((prev) => ({
      ...prev,
      tenure: value,
      startDate: calculatedStartDate,
    }));
  };

  const handleStartDateChange = (date: Date) => {
    lastUpdatedField.current = "startDate";
    const calculatedTenure = calculateTenureFromStartDate(date);
    setFormData((prev) => ({
      ...prev,
      startDate: date,
      tenure: calculatedTenure,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      // Support both close patterns
      if (onOpenChange) {
        onOpenChange(false);
      } else if (onClose) {
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save agent");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isQuickAdd
              ? "Quick Add Agent"
              : agent
              ? "Edit Agent"
              : "Add New Agent"}
          </DialogTitle>
          <DialogDescription>
            {isQuickAdd
              ? "Enter the essential details to quickly add a new agent"
              : agent
              ? "Update the agent's information below"
              : "Fill in the details to add a new agent"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name*
                </Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="bg-[hsl(var(--background))] border-[hsl(var(--border))]"
                  required
                  autoFocus={isQuickAdd}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name*
                </Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="bg-[hsl(var(--background))] border-[hsl(var(--border))]"
                  required
                />
              </div>
            </div>

            {!isQuickAdd && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email*
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter agent email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="bg-[hsl(var(--background))] border-[hsl(var(--border))]"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="team" className="text-sm font-medium">
                Team*
              </Label>
              <select
                id="team"
                value={formData.teamId}
                onChange={(e) =>
                  setFormData({ ...formData, teamId: e.target.value })
                }
                className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
                required
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Status
                </Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
                >
                  <option value="P">Performance</option>
                  <option value="T">Training</option>
                  <option value="A">Archived</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenure" className="text-sm font-medium">
                  Tenure (months)
                </Label>
                <Input
                  id="tenure"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.tenure}
                  onChange={(e) =>
                    handleTenureChange(parseFloat(e.target.value) || 0)
                  }
                  className="bg-[hsl(var(--background))] border-[hsl(var(--border))]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetLeads" className="text-sm font-medium">
                  Target Leads/Day
                </Label>
                <Input
                  id="targetLeads"
                  type="number"
                  min="1"
                  max="50"
                  placeholder="Enter target leads per day"
                  value={formData.targetLeadsPerDay}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetLeadsPerDay: parseInt(e.target.value) || 8,
                    })
                  }
                  className="bg-[hsl(var(--background))] border-[hsl(var(--border))]"
                  required
                />
              </div>
            </div>

            {!isQuickAdd && (
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={
                    formData.startDate instanceof Date
                      ? formData.startDate.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    handleStartDateChange(new Date(e.target.value))
                  }
                  className="bg-[hsl(var(--background))] border-[hsl(var(--border))]"
                  required
                />
              </div>
            )}
          </div>
          {error && (
            <div className="text-[hsl(var(--destructive))] text-sm text-center">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="bg-[hsl(var(--background))]"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : isQuickAdd
                ? "Add Agent"
                : agent
                ? "Save Changes"
                : "Add Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
