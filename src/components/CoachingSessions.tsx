import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CoachingSession {
  id: string;
  agent_id: string;
  type: 'one_on_one' | 'group' | 'training';
  date: string;
  notes: string | null;
  action_items: string | null;
  agent?: {
    firstName: string;
    lastName: string;
  };
}

interface CoachingSessionsProps {
  agentId: string;
  initialSessions?: CoachingSession[];
}

export default function CoachingSessions({ agentId, initialSessions = [] }: CoachingSessionsProps) {
  const [sessions, setSessions] = useState<CoachingSession[]>(initialSessions);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [newSession, setNewSession] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'one_on_one' as const,
    notes: '',
    action_items: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/coaching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId,
          ...newSession,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create coaching session');
      }

      const createdSession = await response.json();
      setSessions([...sessions, createdSession]);
      setIsAddingSession(false);
      setNewSession({
        date: new Date().toISOString().split('T')[0],
        type: 'one_on_one',
        notes: '',
        action_items: '',
      });
    } catch (error) {
      console.error('Error creating coaching session:', error);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Coaching Sessions</h2>
        <Button onClick={() => setIsAddingSession(!isAddingSession)}>
          {isAddingSession ? 'Cancel' : 'Add Session'}
        </Button>
      </div>

      {isAddingSession && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={newSession.date}
              onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              type="text"
              value={newSession.notes}
              onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
              placeholder="Session notes..."
            />
          </div>

          <div>
            <Label htmlFor="action_items">Action Items</Label>
            <Input
              id="action_items"
              type="text"
              value={newSession.action_items}
              onChange={(e) => setNewSession({ ...newSession, action_items: e.target.value })}
              placeholder="Action items..."
            />
          </div>

          <Button type="submit">Save Session</Button>
        </form>
      )}

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <p className="text-gray-500">No coaching sessions recorded yet.</p>
        ) : (
          sessions.map((session) => (
            <Card key={session.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    {new Date(session.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">Type: {session.type}</p>
                  {session.notes && (
                    <p className="mt-2">
                      <span className="font-medium">Notes:</span> {session.notes}
                    </p>
                  )}
                  {session.action_items && (
                    <p className="mt-2">
                      <span className="font-medium">Action Items:</span> {session.action_items}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
} 