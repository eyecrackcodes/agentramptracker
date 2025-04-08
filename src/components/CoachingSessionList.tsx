import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Edit2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CoachingSession {
  id: string;
  agentId: string;
  managerId: string;
  sessionType: string;
  date: string;
  notes: string;
  nextSteps?: string;
  followUpDate?: string;
  agent?: {
    firstName: string;
    lastName: string;
  };
}

interface CoachingSessionListProps {
  sessions: CoachingSession[];
  onEdit: (session: CoachingSession) => void;
  onDelete: (sessionId: string) => Promise<void>;
}

export function CoachingSessionList({
  sessions,
  onEdit,
  onDelete,
}: CoachingSessionListProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (sessionId: string) => {
    setIsDeleting(true);
    try {
      await onDelete(sessionId);
    } catch (error) {
      console.error("Error deleting session:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatSessionType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Agent</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Next Steps</TableHead>
            <TableHead>Follow-up</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell>{format(new Date(session.date), "PP")}</TableCell>
              <TableCell>
                {session.agent
                  ? `${session.agent.firstName} ${session.agent.lastName}`
                  : "N/A"}
              </TableCell>
              <TableCell>{formatSessionType(session.sessionType)}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {session.notes}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {session.nextSteps || "N/A"}
              </TableCell>
              <TableCell>
                {session.followUpDate
                  ? format(new Date(session.followUpDate), "PP")
                  : "N/A"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(session)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Coaching Session</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this coaching session? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(session.id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {sessions.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No coaching sessions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 