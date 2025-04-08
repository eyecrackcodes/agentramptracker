"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UpdateCallScore({ callScoreId, initialValue = 0, onSuccess }: { 
  callScoreId: string;
  initialValue?: number;
  onSuccess?: () => void;
}) {
  const [scoreValue, setScoreValue] = useState(initialValue);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      setMessage("");
      
      console.log(`Sending update for call score ${callScoreId} with value ${scoreValue}`);
      
      const response = await fetch('/api/direct-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: callScoreId,
          script_adherence: scoreValue
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update call score');
      }
      
      console.log('Update result:', data);
      setMessage(`Successfully updated to ${scoreValue}%`);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating call score:', error);
      setMessage(error instanceof Error ? error.message : 'Failed to update call score');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-2 border border-gray-200 rounded-md p-3 bg-gray-50">
      <div className="flex flex-col space-y-1">
        <Label htmlFor="score-value">Update Score</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="score-value"
            type="number"
            min="0"
            max="100"
            value={scoreValue}
            onChange={(e) => setScoreValue(Number(e.target.value))}
            className="w-20"
          />
          <Button 
            onClick={handleUpdate}
            disabled={isUpdating}
            size="sm"
          >
            {isUpdating ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </div>
      {message && (
        <div className={`text-sm ${message.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </div>
      )}
    </div>
  );
} 