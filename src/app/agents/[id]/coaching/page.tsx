"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CoachingSessionForm } from "@/components/CoachingSessionForm";
import { CoachingSessionList } from "@/components/CoachingSessionList";
import { Plus } from "lucide-react";

interface Agent {
  id: string;
  firstName: string;
  lastName: string;
}

export default function CoachingPage() {
  const params = useParams();
  const agentId = params.id as string;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchAgent();
    fetchSessions();
  }, [agentId]);

  const fetchAgent = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}`);
      if (response.ok) {
        const data = await response.json();
        setAgent(data);
      }
    } catch (error) {
      console.error("Error fetching agent:", error);
    }
  };

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/coaching?agentId=${agentId}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const url = "/api/coaching";
      const method = data.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchSessions();
        setIsDialogOpen(false);
        setSelectedSession(null);
      }
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  const handleEdit = (session: any) => {
    setSelectedSession(session);
    setIsDialogOpen(true);
  };

  const handleDelete = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/coaching?id=${sessionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchSessions();
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Coaching Sessions - {agent?.firstName} {agent?.lastName}
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedSession ? "Edit Session" : "New Coaching Session"}
              </DialogTitle>
              <DialogDescription>
                {selectedSession 
                  ? "Update the details of this coaching session."
                  : "Fill in the details to create a new coaching session."}
              </DialogDescription>
            </DialogHeader>
            <CoachingSessionForm
              agentId={agentId}
              managerId="current-manager-id" // TODO: Replace with actual manager ID
              onSubmit={handleSubmit}
              initialData={selectedSession}
              isEditing={!!selectedSession}
            />
          </DialogContent>
        </Dialog>
      </div>

      <CoachingSessionList
        sessions={sessions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
} 