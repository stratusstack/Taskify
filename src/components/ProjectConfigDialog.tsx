
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings } from 'lucide-react';

export interface ProjectColumnConfig {
  title: boolean;
  progress: boolean;
  status: boolean;
  priority: boolean;
  tags: boolean;
  startDate: boolean;
  endDate: boolean;
  totalHours: boolean;
  timeSpent: boolean;
}

interface ProjectConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnConfig: ProjectColumnConfig;
  onConfigChange: (config: ProjectColumnConfig) => void;
}

const defaultColumnConfig: ProjectColumnConfig = {
  title: true,
  progress: true,
  status: true,
  priority: true,
  tags: true,
  startDate: false,
  endDate: false,
  totalHours: false,
  timeSpent: true,
};

export const ProjectConfigDialog: React.FC<ProjectConfigDialogProps> = ({
  open,
  onOpenChange,
  columnConfig,
  onConfigChange
}) => {
  const [tempConfig, setTempConfig] = useState(columnConfig);

  const handleSave = () => {
    onConfigChange(tempConfig);
    onOpenChange(false);
  };

  const handleReset = () => {
    setTempConfig(defaultColumnConfig);
  };

  const updateConfig = (field: keyof ProjectColumnConfig, value: boolean) => {
    setTempConfig(prev => ({ ...prev, [field]: value }));
  };

  const configOptions = [
    { key: 'title' as keyof ProjectColumnConfig, label: 'Title' },
    { key: 'progress' as keyof ProjectColumnConfig, label: 'Progress' },
    { key: 'status' as keyof ProjectColumnConfig, label: 'Status' },
    { key: 'priority' as keyof ProjectColumnConfig, label: 'Priority' },
    { key: 'tags' as keyof ProjectColumnConfig, label: 'Tags' },
    { key: 'startDate' as keyof ProjectColumnConfig, label: 'Start Date' },
    { key: 'endDate' as keyof ProjectColumnConfig, label: 'End Date' },
    { key: 'totalHours' as keyof ProjectColumnConfig, label: 'Total Hours' },
    { key: 'timeSpent' as keyof ProjectColumnConfig, label: 'Time Spent' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configure Dashboard Columns
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Select which task attributes should be displayed as columns in the dashboard:
          </div>
          
          <div className="space-y-3">
            {configOptions.map(option => (
              <div key={option.key} className="flex items-center space-x-2">
                <Checkbox
                  id={option.key}
                  checked={tempConfig[option.key]}
                  onCheckedChange={(checked) => updateConfig(option.key, !!checked)}
                />
                <Label htmlFor={option.key} className="text-sm font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset to Default
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
