"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CoachingSession {
  id: string;
  agent_id: string;
  session_type: string;
  date: string;
  notes: string;
  action_items: string | null;
  created_at: string;
  updated_at: string;
  next_steps: string | null;
}

interface CoachingSessionsProps {
  agentId: string;
}

export default function CoachingSessions({ agentId }: CoachingSessionsProps) {
  const [sessions, setSessions] = useState<CoachingSession[]>([]);
  const [isAddingSession, setIsAddingSession] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`/api/coaching?agentId=${agentId}`);
      if (!response.ok) throw new Error('Failed to fetch coaching sessions');
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching coaching sessions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const sessionDate = formData.get('session_date');
      const notes = formData.get('notes');
      const actionItems = formData.get('action_items');

      if (!sessionDate || !notes) {
        throw new Error('Please fill in all required fields');
      }

      const requestData = {
        agent_id: agentId,
        manager_id: "667d5ee0-245e-4ba6-a159-3d9c6653bb96", // TODO: Replace with actual manager ID from auth
        date: new Date(sessionDate.toString()).toISOString(),
        session_type: 'one_on_one',
        type: 'one_on_one',
        notes: notes.toString().trim(),
        action_items: actionItems ? actionItems.toString().trim() : null,
        next_steps: actionItems ? actionItems.toString().trim() : null,
      };

      console.log('Sending request with data:', JSON.stringify(requestData, null, 2));

      const response = await fetch('/api/coaching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server response:', errorData);
        throw new Error(errorData.error || 'Failed to add coaching session');
      }
      
      await fetchSessions();
      setIsAddingSession(false);
    } catch (error) {
      console.error('Error adding coaching session:', error);
      alert(error instanceof Error ? error.message : 'Failed to add coaching session');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Coaching Sessions</h2>
        <Button onClick={() => setIsAddingSession(true)}>Add Session</Button>
      </div>

      {isAddingSession && (
        <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="session_date">Session Date</Label>
              <Input
                id="session_date"
                name="session_date"
                type="date"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Enter session notes..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="action_items">Action Items</Label>
            <Textarea
              id="action_items"
              name="action_items"
              placeholder="List the action items and next steps..."
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">Save Session</Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsAddingSession(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {sessions.map((session) => (
          <div 
            key={session.id} 
            className="border p-4 rounded-lg space-y-2"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">
                  Date: {new Date(session.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">Type: {session.session_type}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <h4 className="font-medium">Notes</h4>
                <p className="text-sm">{session.notes}</p>
              </div>
              <div>
                <h4 className="font-medium">Action Items</h4>
                <p className="text-sm">
                  {session.action_items || session.next_steps || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 