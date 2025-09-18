import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  itemName: string
  onConfirm: () => Promise<void>
  loading?: boolean
}

export function DeleteDialog({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  itemName,
  onConfirm, 
  loading = false 
}: DeleteDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] professional-card">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-xl text-left">{title}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-left">
            {description}
          </DialogDescription>
          
          <div className="bg-destructive/5 border border-destructive/20 p-3 mt-4">
            <p className="text-sm font-medium text-destructive">
              "{itemName}"
            </p>
          </div>
        </DialogHeader>
        
        <DialogFooter className="gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="professional-btn"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
            className="professional-btn"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}