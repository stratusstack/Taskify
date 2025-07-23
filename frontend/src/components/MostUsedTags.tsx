
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';
import { Task } from '@/types/task';

interface MostUsedTagsProps {
  tasks: Task[];
}

export const MostUsedTags: React.FC<MostUsedTagsProps> = ({ tasks }) => {
  const getAllTags = () => {
    const tagCounts = tasks.reduce((acc, task) => {
      task.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
          <Tag className="w-5 h-5" />
          Most Used Tags
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {getAllTags().length > 0 ? (
            getAllTags().map(([tag, count]) => (
              <div key={tag} className="flex items-center justify-between">
                <Badge variant="secondary">{tag}</Badge>
                <span className="text-sm text-gray-500">{count} tasks</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No tags used yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
