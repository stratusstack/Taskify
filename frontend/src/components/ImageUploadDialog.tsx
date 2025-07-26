import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileImage, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ImageAnalysisService, type ParsedTaskData } from '@/services/ImageAnalysisService';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/types/task';

interface ImageUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onTasksCreated: (tasks: Omit<Task, 'id' | 'timeEntries' | 'projectId'>[]) => void;
}

export const ImageUploadDialog: React.FC<ImageUploadDialogProps> = ({
  open,
  onClose,
  onTasksCreated
}) => {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ParsedTaskData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
      setAnalysisResult(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!uploadedImage) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Simulate analysis progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + 20, 90));
      }, 200);

      const result = await ImageAnalysisService.analyzeImage(uploadedImage);
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      setTimeout(() => {
        setAnalysisResult(result);
        setIsAnalyzing(false);
        
        toast({
          title: "Analysis Complete",
          description: `Detected ${result.type} with ${result.tasks.length} task(s)`,
        });
      }, 300);
      
    } catch (error) {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateTasks = () => {
    if (!analysisResult) return;

    const tasks = analysisResult.tasks.map(task => ({
      title: task.title,
      description: task.description,
      tags: task.tags,
      status: task.status as Task['status'],
      priority: task.priority as Task['priority'],
      startDate: new Date(),
      endDate: task.endDate,
      reminders: [],
      activities: [{
        id: crypto.randomUUID(),
        type: 'note' as const,
        description: 'Task created from image analysis',
        timestamp: new Date(),
      }],
      dependencies: []
    }));

    onTasksCreated(tasks);
    
    toast({
      title: "Tasks Created",
      description: `Successfully created ${tasks.length} task(s)`,
    });

    handleClose();
  };

  const handleClose = () => {
    setUploadedImage(null);
    setAnalysisResult(null);
    setImagePreview(null);
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileImage className="w-5 h-5" />
            Upload Image to Create Tasks
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Upload Area */}
          {!uploadedImage && (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {isDragActive ? 'Drop the image here' : 'Upload an image'}
              </p>
              <p className="text-sm text-muted-foreground">
                Drag & drop an image or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Supports PNG, JPG, JPEG, GIF, BMP, WebP
              </p>
            </div>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={imagePreview}
                    alt="Uploaded preview"
                    className="w-32 h-32 object-cover rounded border"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">Uploaded Image</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {uploadedImage?.name} ({Math.round((uploadedImage?.size || 0) / 1024)} KB)
                    </p>
                    {!analysisResult && !isAnalyzing && (
                      <Button onClick={handleAnalyze} className="gap-2">
                        <FileImage className="w-4 h-4" />
                        Analyze Image
                      </Button>
                    )}
                    {uploadedImage && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setUploadedImage(null);
                          setImagePreview(null);
                          setAnalysisResult(null);
                        }}
                        className="gap-2 ml-2"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Progress */}
          {isAnalyzing && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-medium">Analyzing image...</span>
                </div>
                <Progress value={analysisProgress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2">
                  AI is analyzing the image to detect tasks and metadata
                </p>
              </CardContent>
            </Card>
          )}

          {/* Analysis Results */}
          {analysisResult && !isAnalyzing && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <h3 className="font-medium">Analysis Complete</h3>
                  </div>
                  <Badge variant={analysisResult.type === 'task_list' ? 'default' : 'secondary'}>
                    {analysisResult.type === 'task_list' ? 'Task List' : 'Single Message'}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Detected Tasks ({analysisResult.tasks.length})</h4>
                    <div className="space-y-3">
                      {analysisResult.tasks.map((task, index) => (
                        <div key={index} className="border rounded-lg p-3 bg-muted/50">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h5 className="font-medium">{task.title}</h5>
                              {task.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {task.description}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Badge variant="outline" className="text-xs">
                                {task.priority}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {task.status}
                              </Badge>
                            </div>
                          </div>
                          {task.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {task.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button onClick={handleCreateTasks} className="flex-1">
                      Create {analysisResult.tasks.length} Task{analysisResult.tasks.length !== 1 ? 's' : ''}
                    </Button>
                    <Button variant="outline" onClick={handleClose}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warning for no results */}
          {analysisResult && analysisResult.tasks.length === 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">No tasks detected</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  The AI couldn't detect any tasks in this image. Try uploading a clearer image with visible task lists or notes.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};