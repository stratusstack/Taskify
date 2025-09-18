import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, Minus } from 'lucide-react'

interface ManualTimeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (minutes: number, date: string) => Promise<void>
  loading?: boolean
  taskName: string
}

export function ManualTimeDialog({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
  taskName
}: ManualTimeDialogProps) {
  const [minutes, setMinutes] = useState<number>(15)
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])

  const formatTimeDisplay = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60

    if (hours === 0) {
      return `${mins} minute${mins !== 1 ? 's' : ''}`
    } else if (mins === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`
    } else {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (minutes <= 0) {
      return
    }

    try {
      await onSubmit(minutes, date)
      // Reset form
      setMinutes(15)
      setDate(new Date().toISOString().split('T')[0])
      onOpenChange(false)
    } catch (error) {
      // Error handling is done in parent component
      console.error('Failed to add manual time:', error)
    }
  }

  const adjustMinutes = (increment: number) => {
    const newValue = Math.max(1, Math.min(1440, minutes + increment))
    setMinutes(newValue)
  }

  const handleMinutesChange = (value: string) => {
    const numValue = parseInt(value) || 0
    if (numValue >= 1 && numValue <= 1440) {
      setMinutes(numValue)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Time Manually</DialogTitle>
          <DialogDescription>
            Add time you've spent working on "{taskName}" that wasn't tracked automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Minutes Input with Increment/Decrement */}
            <div className="space-y-2">
              <Label htmlFor="minutes">Duration (minutes)</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 professional-btn"
                  onClick={() => adjustMinutes(-5)}
                  disabled={minutes <= 5}
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <Input
                  id="minutes"
                  type="number"
                  min="1"
                  max="1440"
                  value={minutes}
                  onChange={(e) => handleMinutesChange(e.target.value)}
                  className="text-center text-lg font-bold"
                  required
                />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 professional-btn"
                  onClick={() => adjustMinutes(5)}
                  disabled={minutes >= 1440}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Time Display Helper */}
              <div className="text-sm text-muted-foreground text-center">
                = {formatTimeDisplay(minutes)}
              </div>
            </div>

            {/* Quick Time Buttons */}
            <div className="space-y-2">
              <Label>Quick Select</Label>
              <div className="flex flex-wrap gap-2">
                {[15, 30, 45, 60, 90, 120].map((quickMinutes) => (
                  <Button
                    key={quickMinutes}
                    type="button"
                    variant={minutes === quickMinutes ? "default" : "outline"}
                    size="sm"
                    className="professional-btn"
                    onClick={() => setMinutes(quickMinutes)}
                  >
                    {quickMinutes < 60 ? `${quickMinutes}m` : `${Math.floor(quickMinutes / 60)}h`}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date Input */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="professional-btn"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || minutes <= 0}
              className="professional-btn"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add {formatTimeDisplay(minutes)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}