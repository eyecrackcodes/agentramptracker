import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoachingSessionFormProps {
  agentId: string;
  managerId: string;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  isEditing?: boolean;
}

export function CoachingSessionForm({
  agentId,
  managerId,
  onSubmit,
  initialData,
  isEditing = false,
}: CoachingSessionFormProps) {
  const [date, setDate] = useState<Date | undefined>(
    initialData?.date ? new Date(initialData.date) : new Date()
  );
  const [sessionType, setSessionType] = useState(initialData?.type || "one_on_one");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [nextSteps, setNextSteps] = useState(initialData?.action_items || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        id: initialData?.id,
        agentId,
        managerId,
        sessionType,
        date,
        notes,
        nextSteps,
      });
    } catch (error) {
      console.error("Error submitting coaching session:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Session Type</label>
          <Select
            value={sessionType}
            onValueChange={setSessionType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select session type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one_on_one">One-on-One</SelectItem>
              <SelectItem value="call_scoring">Call Scoring</SelectItem>
              <SelectItem value="metrics_review">Metrics Review</SelectItem>
              <SelectItem value="development">Development</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Session Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Notes</label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter session notes..."
          className="min-h-[100px]"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Next Steps</label>
        <Textarea
          value={nextSteps}
          onChange={(e) => setNextSteps(e.target.value)}
          placeholder="Enter next steps..."
          className="min-h-[60px]"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : isEditing ? "Update Session" : "Create Session"}
      </Button>
    </form>
  );
} 