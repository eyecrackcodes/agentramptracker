import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Metric } from "@prisma/client";

interface EditMetricDialogProps {
  metric: Metric | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (metric: Partial<Metric>) => Promise<void>;
}

export function EditMetricDialog({
  metric,
  isOpen,
  onClose,
  onSave,
}: EditMetricDialogProps) {
  const [formData, setFormData] = useState<Partial<Metric>>(
    metric || {
      month: "",
      week: "",
      closeRate: 0,
      averagePremium: 0,
      placeRate: 0,
      capScore: 0,
      leadsPerDay: 0,
    }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update metric");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Metric</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="month" className="text-right">
                Month
              </Label>
              <Input
                id="month"
                value={formData.month}
                onChange={(e) =>
                  setFormData({ ...formData, month: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="week" className="text-right">
                Week
              </Label>
              <Input
                id="week"
                value={formData.week}
                onChange={(e) =>
                  setFormData({ ...formData, week: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="closeRate" className="text-right">
                Close Rate
              </Label>
              <Input
                id="closeRate"
                type="number"
                step="0.01"
                value={formData.closeRate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    closeRate: parseFloat(e.target.value),
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="averagePremium" className="text-right">
                Avg Premium
              </Label>
              <Input
                id="averagePremium"
                type="number"
                step="0.01"
                value={formData.averagePremium}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    averagePremium: parseFloat(e.target.value),
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="placeRate" className="text-right">
                Place Rate
              </Label>
              <Input
                id="placeRate"
                type="number"
                step="0.01"
                value={formData.placeRate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    placeRate: parseFloat(e.target.value),
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="capScore" className="text-right">
                Cap Score
              </Label>
              <Input
                id="capScore"
                type="number"
                step="0.01"
                value={formData.capScore}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capScore: parseFloat(e.target.value),
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="leadsPerDay" className="text-right">
                Leads/Day
              </Label>
              <Input
                id="leadsPerDay"
                type="number"
                step="0.01"
                value={formData.leadsPerDay}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    leadsPerDay: parseFloat(e.target.value),
                  })
                }
                className="col-span-3"
              />
            </div>
          </div>
          {error && (
            <div className="text-red-500 text-sm mb-4 text-center">{error}</div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
