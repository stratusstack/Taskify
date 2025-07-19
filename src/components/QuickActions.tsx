import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, Filter, BarChart3, Calendar } from 'lucide-react';

interface QuickActionsProps {
  onCreateTask: () => void;
  onShowFilters: () => void;
  onShowReports: () => void;
  onShowCalendar: () => void;
  activeFilterCount?: number;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onCreateTask,
  onShowFilters,
  onShowReports,
  onShowCalendar,
  activeFilterCount = 0,
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
          <Plus className="w-5 h-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button 
          onClick={onCreateTask} 
          className="w-full justify-start" 
          variant="outline"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
        
        <Button 
          onClick={onShowFilters} 
          className="w-full justify-start" 
          variant="outline"
          size="sm"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter Tasks
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        
        <Button 
          onClick={onShowReports} 
          className="w-full justify-start" 
          variant="outline"
          size="sm"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          View Reports
        </Button>
        
        <Button 
          onClick={onShowCalendar} 
          className="w-full justify-start" 
          variant="outline"
          size="sm"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Calendar View
        </Button>
      </CardContent>
    </Card>
  );
};