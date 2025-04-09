"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Title,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
} from "@tremor/react";
import { useTeamAgent } from "../context/TeamAgentContext";
import { Button } from "@/components/ui/button";
import { Metric, Agent } from "@prisma/client";
import { EditMetricDialog } from "./EditMetricDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash } from "lucide-react";

interface MetricsTableProps {
  agentId: string;
  metrics?: Metric[];
  loading?: boolean;
  error?: string | null;
  onMetricsChanged?: () => void;
}

export function MetricsTable({
  agentId,
  metrics: externalMetrics,
  loading: externalLoading,
  error: externalError,
  onMetricsChanged,
}: MetricsTableProps) {
  const { selectedAgent } = useTeamAgent();
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [agentDetails, setAgentDetails] = useState<Agent | null>(null);

  // Use external metrics if provided, otherwise fetch them
  useEffect(() => {
    if (externalMetrics) {
      setMetrics(externalMetrics);
      setIsLoading(externalLoading || false);
      setError(externalError || null);
    } else {
      fetchMetrics();
    }
  }, [agentId, externalMetrics, externalLoading, externalError]);

  // Fetch agent details
  useEffect(() => {
    if (agentId) {
      fetchAgentDetails(agentId);
    }
  }, [agentId]);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/metrics?agentId=${agentId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch metrics");
      }
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load metrics");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgentDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/agents/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch agent details");
      }
      const data = await response.json();
      setAgentDetails(data);
    } catch (err) {
      console.error("Error fetching agent details:", err);
    }
  };

  const handleEdit = (metric: Metric) => {
    setSelectedMetric(metric);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (metric: Metric) => {
    setSelectedMetric(metric);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (updatedMetric: Partial<Metric>) => {
    if (!selectedMetric) return;

    try {
      const response = await fetch(`/api/metrics/${selectedMetric.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedMetric),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update metric");
      }

      if (onMetricsChanged) {
        onMetricsChanged();
      } else {
        fetchMetrics();
      }

      setIsEditDialogOpen(false);
      setSelectedMetric(null);
    } catch (error) {
      console.error("Error updating metric:", error);
      throw error;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMetric) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/metrics/${selectedMetric.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete metric");
      }

      if (onMetricsChanged) {
        onMetricsChanged();
      } else {
        fetchMetrics();
      }

      setSelectedMetric(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting metric:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to determine Cap Score badge color based on status and score
  const getCapScoreBadgeColor = (capScore: number) => {
    // For trainees (T), use different thresholds
    if (agentDetails?.status === "T") {
      return capScore >= 80 ? "green" : capScore >= 40 ? "yellow" : "red";
    }

    // For performing agents (P)
    return capScore >= 150 ? "green" : capScore >= 100 ? "yellow" : "red";
  };

  if (!selectedAgent && !agentId) {
    return (
      <Card className="mt-6">
        <Title>Metrics</Title>
        <p className="text-gray-500 mt-2">Please select an agent first</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="mt-6">
        <Title>Metrics</Title>
        <p className="text-gray-500 mt-2">Loading metrics...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-6">
        <Title>Metrics</Title>
        <p className="text-red-500 mt-2">{error}</p>
      </Card>
    );
  }

  if (metrics.length === 0) {
    return (
      <Card className="mt-6">
        <Title>Metrics</Title>
        <p className="text-gray-500 mt-2">No metrics found for this agent.</p>
      </Card>
    );
  }

  return (
    <>
      <Card className="mt-6">
        <Title>Metrics History</Title>
        {agentDetails && (
          <div className="mt-2 mb-4">
            <Badge color={agentDetails.status === "P" ? "blue" : "purple"}>
              {agentDetails.status === "P" ? "Performance" : "Training"} Queue
            </Badge>
            {agentDetails.tenure && (
              <Badge color="gray" className="ml-2">
                {agentDetails.tenure.toFixed(1)} months tenure
              </Badge>
            )}
          </div>
        )}
        <Table className="mt-4">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Month</TableHeaderCell>
              <TableHeaderCell>Week</TableHeaderCell>
              <TableHeaderCell>Close Rate</TableHeaderCell>
              <TableHeaderCell>Avg Premium</TableHeaderCell>
              <TableHeaderCell>Place Rate</TableHeaderCell>
              <TableHeaderCell>Cap Score</TableHeaderCell>
              <TableHeaderCell>Leads/Day</TableHeaderCell>
              <TableHeaderCell className="text-right">Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {metrics
              .sort((a, b) => {
                if (a.month !== b.month) return b.month - a.month;
                return b.week - a.week;
              })
              .map((metric) => (
                <TableRow key={metric.id}>
                  <TableCell>{metric.month}</TableCell>
                  <TableCell>{metric.week}</TableCell>
                  <TableCell>
                    <Badge color={metric.closeRate >= 0.15 ? "green" : "red"}>
                      {Math.round(metric.closeRate * 1000) / 10}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    ${Math.round(metric.averagePremium).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge color={metric.placeRate >= 0.5 ? "green" : "red"}>
                      {Math.round(metric.placeRate * 1000) / 10}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge color={getCapScoreBadgeColor(metric.capScore)}>
                      {Math.round(metric.capScore)}
                    </Badge>
                  </TableCell>
                  <TableCell>{Math.round(metric.leadsPerDay)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(metric)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(metric)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>

      <EditMetricDialog
        metric={selectedMetric}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedMetric(null);
        }}
        onSave={handleSave}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              metric for {selectedMetric?.month} Week {selectedMetric?.week}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
