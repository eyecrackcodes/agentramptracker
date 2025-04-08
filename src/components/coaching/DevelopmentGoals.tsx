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
import { Card } from "@/components/ui/card";

interface DevelopmentGoal {
  id: string;
  agent_id: string;
  goal_type: string;
  description: string;
  target_date: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  created_at: string;
  updated_at: string;
}

interface DevelopmentGoalsProps {
  agentId: string;
}

export default function DevelopmentGoals({ agentId }: DevelopmentGoalsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [goals, setGoals] = useState<DevelopmentGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch(`/api/development-goals?agentId=${agentId}`);
      if (!response.ok) throw new Error('Failed to fetch development goals');
      const data = await response.json();
      setGoals(data);
    } catch (error) {
      console.error('Error fetching development goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('/api/development-goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: agentId,
          goalType: formData.get('goal_type'),
          description: formData.get('description'),
          targetDate: formData.get('target_date'),
          status: 'not_started',
          progress: '0',
        }),
      });

      if (!response.ok) throw new Error('Failed to add development goal');
      
      await fetchGoals();
      setIsAddingGoal(false);
    } catch (error) {
      console.error('Error adding development goal:', error);
    }
  };

  const handleUpdateProgress = async (goalId: string, newStatus: DevelopmentGoal['status'], newProgress: number) => {
    try {
      const response = await fetch('/api/development-goals', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: goalId,
          status: newStatus,
          progress: newProgress,
        }),
      });

      if (!response.ok) throw new Error('Failed to update goal progress');
      await fetchGoals();
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Development Goals</h2>
        <Button onClick={() => setIsAddingGoal(true)}>Add Goal</Button>
      </div>

      {isAddingGoal && (
        <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="goal_type">Goal Type</Label>
            <Input
              id="goal_type"
              name="goal_type"
              placeholder="e.g., Technical Skills, Communication, Leadership"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the development goal in detail..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_date">Target Date</Label>
            <Input
              id="target_date"
              name="target_date"
              type="date"
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">Save Goal</Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsAddingGoal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-4">Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No development goals set yet
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <div 
              key={goal.id} 
              className="border p-4 rounded-lg space-y-2"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{goal.goal_type}</p>
                  <p className="text-sm text-gray-500">
                    Target: {new Date(goal.target_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={goal.status}
                    onChange={(e) => handleUpdateProgress(goal.id, e.target.value as DevelopmentGoal['status'], goal.progress)}
                    className="border rounded p-1"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={goal.progress.toString()}
                    onChange={(e) => handleUpdateProgress(goal.id, goal.status, Number(e.target.value))}
                    className="w-20"
                  />
                  <span>%</span>
                </div>
              </div>
              <p>{goal.description}</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 