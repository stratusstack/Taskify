import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  initialRange: { from: Date; to: Date };
  onRangeChange: (range: { from: Date; to: Date }) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  initialRange,
  onRangeChange,
  open,
  onOpenChange
}) => {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(initialRange);

  const handleApply = () => {
    onRangeChange(dateRange);
  };

  const handleCancel = () => {
    setDateRange(initialRange);
    onOpenChange(false);
  };

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from) {
      setDateRange({
        from: range.from,
        to: range.to || range.from
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Date Range</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Current range: {format(dateRange.from, 'MMM dd, yyyy')} - {format(dateRange.to, 'MMM dd, yyyy')}
          </div>

          <Calendar
            mode="range"
            selected={{ from: dateRange.from, to: dateRange.to }}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            className={cn("p-3 pointer-events-auto")}
          />

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              Apply Range
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};