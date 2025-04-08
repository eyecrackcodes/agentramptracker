"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MetricsFormProps {
  agentId: string;
  onSuccess?: () => void;
}

interface FormData {
  month: number;
  week: number;
  closeRate: number;
  averagePremium: number;
  placeRate: number;
  capScore: number;
  leadsPerDay: number;
}

function getWeekNumber(date: Date): number {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.

  // Calculate the day of the month offset by the day of the week
  const dayOfMonth = date.getDate();

  // Calculate the week of the month (1-indexed)
  return Math.ceil((dayOfMonth + dayOfWeek) / 7);
}

function getCurrentWeekAndMonth(): {
  week: number;
  month: number;
  canSubmit: boolean;
  weekEnding: string;
} {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)

  // Allow submission any day (always true)
  const isAfterFriday = true;

  // Get the current week and month
  const currentWeek = getWeekNumber(now);
  const currentMonth = now.getMonth() + 1; // 1-12

  // Calculate the date the week ends (Friday)
  const daysUntilFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 5 + 7 - dayOfWeek;
  const weekEnding = new Date(now);
  weekEnding.setDate(now.getDate() + daysUntilFriday);

  return {
    week: currentWeek,
    month: currentMonth,
    canSubmit: isAfterFriday,
    weekEnding: weekEnding.toLocaleDateString(),
  };
}

const { week, month, canSubmit, weekEnding } = getCurrentWeekAndMonth();

const initialFormData: FormData = {
  month,
  week,
  closeRate: 0,
  averagePremium: 0,
  placeRate: 0,
  capScore: 0,
  leadsPerDay: 0,
};

const PresetButton = ({
  label,
  value,
  onClick,
}: {
  label: string;
  value: number;
  onClick: () => void;
}) => (
  <Button
    type="button"
    variant="outline"
    size="sm"
    onClick={onClick}
    className="px-2 py-1 h-auto text-xs"
  >
    {label}
  </Button>
);

export function MetricsForm({ agentId, onSuccess }: MetricsFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentWeekInfo, setCurrentWeekInfo] = useState({
    week,
    month,
    canSubmit,
    weekEnding,
  });

  const applyPreset = (field: keyof FormData, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    // Update week info when component mounts or date changes
    const interval = setInterval(() => {
      setCurrentWeekInfo(getCurrentWeekAndMonth());
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Calculate CAP score whenever close rate, premium, or place rate changes
  useEffect(() => {
    // Formula: CAP Score = Close Rate × Average Premium × Place Rate
    const closeRateDecimal = formData.closeRate / 100;
    const placeRateDecimal = formData.placeRate / 100;
    const calculatedCapScore =
      closeRateDecimal * formData.averagePremium * placeRateDecimal;

    // Round to nearest whole number
    const roundedCapScore = Math.round(calculatedCapScore);

    setFormData((prev) => ({
      ...prev,
      capScore: roundedCapScore,
    }));
  }, [formData.closeRate, formData.averagePremium, formData.placeRate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Round values before submission
    const roundedData = {
      ...formData,
      closeRate: Math.round(formData.closeRate * 10) / 10,
      averagePremium: Math.round(formData.averagePremium),
      placeRate: Math.round(formData.placeRate * 10) / 10,
      capScore: Math.round(formData.capScore),
      leadsPerDay: Math.round(formData.leadsPerDay),
    };

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/metrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...roundedData,
          agentId,
          closeRate: roundedData.closeRate / 100, // Convert percentage to decimal
          placeRate: roundedData.placeRate / 100, // Convert percentage to decimal
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save metrics");
      }

      setSuccess(true);
      setFormData(initialFormData); // Reset form

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save metrics");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <div className="flex items-center bg-[hsl(var(--muted))] px-3 py-1 rounded-md">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>Week ending: {currentWeekInfo.weekEnding}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="month"
                  className="text-sm font-medium flex items-center"
                >
                  Month (1-12)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="h-4 w-4 ml-1 text-[hsl(var(--muted-foreground))]" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Enter the calendar month (1 = January, 12 = December)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  Current: {currentWeekInfo.month}
                </span>
              </div>
              <Input
                id="month"
                type="number"
                min="1"
                max="12"
                value={formData.month}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    month: parseInt(e.target.value) || currentWeekInfo.month,
                  })
                }
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="week"
                  className="text-sm font-medium flex items-center"
                >
                  Week (1-5)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="h-4 w-4 ml-1 text-[hsl(var(--muted-foreground))]" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Week of the month (1 = first week, 5 = fifth week if
                          applicable)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  Current: {currentWeekInfo.week}
                </span>
              </div>
              <Input
                id="week"
                type="number"
                min="1"
                max="5"
                value={formData.week}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    week: parseInt(e.target.value) || currentWeekInfo.week,
                  })
                }
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="closeRate"
                className="text-sm font-medium flex items-center"
              >
                Close Rate (%)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-4 w-4 ml-1 text-[hsl(var(--muted-foreground))]" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Percentage of calls resulting in a closed sale</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="space-y-2">
                <Input
                  id="closeRate"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.closeRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      closeRate: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full"
                  required
                />
                <div className="flex gap-2 flex-wrap">
                  <PresetButton
                    label="10%"
                    value={10}
                    onClick={() => applyPreset("closeRate", 10)}
                  />
                  <PresetButton
                    label="15%"
                    value={15}
                    onClick={() => applyPreset("closeRate", 15)}
                  />
                  <PresetButton
                    label="20%"
                    value={20}
                    onClick={() => applyPreset("closeRate", 20)}
                  />
                  <PresetButton
                    label="25%"
                    value={25}
                    onClick={() => applyPreset("closeRate", 25)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="placeRate"
                className="text-sm font-medium flex items-center"
              >
                Place Rate (%)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-4 w-4 ml-1 text-[hsl(var(--muted-foreground))]" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Percentage of sold policies that are successfully placed
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="space-y-2">
                <Input
                  id="placeRate"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.placeRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      placeRate: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full"
                  required
                />
                <div className="flex gap-2 flex-wrap">
                  <PresetButton
                    label="50%"
                    value={50}
                    onClick={() => applyPreset("placeRate", 50)}
                  />
                  <PresetButton
                    label="60%"
                    value={60}
                    onClick={() => applyPreset("placeRate", 60)}
                  />
                  <PresetButton
                    label="70%"
                    value={70}
                    onClick={() => applyPreset("placeRate", 70)}
                  />
                  <PresetButton
                    label="80%"
                    value={80}
                    onClick={() => applyPreset("placeRate", 80)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="averagePremium" className="text-gray-700">
                Average Premium ($)
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <Input
                  type="number"
                  step="1"
                  min="500"
                  max="5000"
                  id="averagePremium"
                  value={formData.averagePremium}
                  onChange={(e) => {
                    const newValue = Math.round(parseFloat(e.target.value));
                    setFormData({
                      ...formData,
                      averagePremium: isNaN(newValue) ? 0 : newValue,
                    });
                  }}
                  className="pl-8 w-full"
                  placeholder="0"
                />
              </div>
              <div className="flex gap-2 flex-wrap mt-2">
                <PresetButton
                  label="$800"
                  value={800}
                  onClick={() => applyPreset("averagePremium", 800)}
                />
                <PresetButton
                  label="$1000"
                  value={1000}
                  onClick={() => applyPreset("averagePremium", 1000)}
                />
                <PresetButton
                  label="$1200"
                  value={1200}
                  onClick={() => applyPreset("averagePremium", 1200)}
                />
                <PresetButton
                  label="$1500"
                  value={1500}
                  onClick={() => applyPreset("averagePremium", 1500)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="capScore"
                className="text-sm font-medium flex items-center"
              >
                Cap Score
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-4 w-4 ml-1 text-[hsl(var(--muted-foreground))]" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Automatically calculated as: Close Rate × Average
                        Premium × Place Rate
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="space-y-2">
                <Input
                  id="capScore"
                  type="number"
                  min="0"
                  value={formData.capScore}
                  className="w-full bg-gray-50"
                  readOnly
                />
                <div className="text-sm text-gray-500">
                  Calculated value based on Close Rate, Average Premium, and
                  Place Rate
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="leadsPerDay"
                className="text-sm font-medium flex items-center"
              >
                Leads Per Day
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-4 w-4 ml-1 text-[hsl(var(--muted-foreground))]" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Average number of leads handled per day</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="space-y-2">
                <Input
                  id="leadsPerDay"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.leadsPerDay}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      leadsPerDay: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full"
                  required
                />
                <div className="flex gap-2 flex-wrap">
                  <PresetButton
                    label="5"
                    value={5}
                    onClick={() => applyPreset("leadsPerDay", 5)}
                  />
                  <PresetButton
                    label="8"
                    value={8}
                    onClick={() => applyPreset("leadsPerDay", 8)}
                  />
                  <PresetButton
                    label="10"
                    value={10}
                    onClick={() => applyPreset("leadsPerDay", 10)}
                  />
                  <PresetButton
                    label="12"
                    value={12}
                    onClick={() => applyPreset("leadsPerDay", 12)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <AlertDescription>Metrics saved successfully!</AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? "Saving..." : "Save Metrics"}
        </Button>
      </form>
    </div>
  );
}
