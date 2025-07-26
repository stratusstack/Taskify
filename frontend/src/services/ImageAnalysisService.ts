export interface TaskData {
  title: string;
  description?: string;
  tags: string[];
  status: 'To Do' | 'In Progress' | 'On Hold' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  endDate?: Date;
}

export interface ParsedTaskData {
  type: 'task_list' | 'single_message';
  confidence: number;
  tasks: TaskData[];
  originalText?: string;
}

export class ImageAnalysisService {
  private static mockResponses: ParsedTaskData[] = [
    {
      type: 'task_list',
      confidence: 0.95,
      tasks: [
        {
          title: 'Review project proposal',
          description: 'Go through the client requirements and prepare feedback',
          tags: ['review', 'client'],
          status: 'To Do',
          priority: 'High',
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
        },
        {
          title: 'Update database schema',
          description: 'Add new fields for user preferences',
          tags: ['database', 'backend'],
          status: 'To Do',
          priority: 'Medium'
        },
        {
          title: 'Design new login page',
          description: 'Create mockups for the updated authentication flow',
          tags: ['design', 'ui', 'auth'],
          status: 'To Do',
          priority: 'Medium'
        }
      ]
    },
    {
      type: 'task_list',
      confidence: 0.88,
      tasks: [
        {
          title: 'Meeting with team lead',
          description: 'Discuss sprint planning and resource allocation',
          tags: ['meeting', 'planning'],
          status: 'To Do',
          priority: 'High',
          endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 1 day from now
        },
        {
          title: 'Code review for feature branch',
          description: 'Review pull request #142 for the new reporting feature',
          tags: ['review', 'code'],
          status: 'To Do',
          priority: 'Medium'
        }
      ]
    },
    {
      type: 'single_message',
      confidence: 0.92,
      tasks: [
        {
          title: 'Implement user feedback system',
          description: 'Based on the note: Need to add a way for users to submit feedback and suggestions through the app',
          tags: ['feedback', 'feature'],
          status: 'To Do',
          priority: 'Medium',
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
        }
      ]
    },
    {
      type: 'task_list',
      confidence: 0.91,
      tasks: [
        {
          title: 'Fix login bug',
          description: 'Users cannot log in with special characters in password',
          tags: ['bug', 'auth', 'urgent'],
          status: 'To Do',
          priority: 'Critical'
        },
        {
          title: 'Optimize image loading',
          description: 'Images are loading too slowly on mobile devices',
          tags: ['performance', 'mobile'],
          status: 'To Do',
          priority: 'High'
        },
        {
          title: 'Add dark mode toggle',
          description: 'Implement theme switching functionality',
          tags: ['ui', 'theme'],
          status: 'To Do',
          priority: 'Low'
        },
        {
          title: 'Write unit tests',
          description: 'Add test coverage for the new API endpoints',
          tags: ['testing', 'api'],
          status: 'To Do',
          priority: 'Medium'
        }
      ]
    }
  ];

  static async analyzeImage(imageFile: File): Promise<ParsedTaskData> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    // Mock AI analysis - in real implementation, this would:
    // 1. Convert image to base64 or upload to AI service
    // 2. Use OCR to extract text from image
    // 3. Use NLP to detect if it's a task list or single message
    // 4. Parse individual tasks with metadata
    // 5. Return structured data

    // For now, return random mock response
    const randomResponse = this.mockResponses[Math.floor(Math.random() * this.mockResponses.length)];
    
    // Add some randomization to make it feel more realistic
    const modifiedResponse = {
      ...randomResponse,
      confidence: 0.85 + Math.random() * 0.1, // Random confidence between 0.85-0.95
      tasks: randomResponse.tasks.map(task => ({
        ...task,
        // Occasionally modify some fields to add variety
        priority: Math.random() > 0.8 ? this.getRandomPriority() : task.priority,
      }))
    };

    return modifiedResponse;
  }

  private static getRandomPriority(): 'Low' | 'Medium' | 'High' | 'Critical' {
    const priorities = ['Low', 'Medium', 'High', 'Critical'] as const;
    return priorities[Math.floor(Math.random() * priorities.length)];
  }

  // In a real implementation, these methods would handle actual AI integration:
  
  // static async extractTextFromImage(imageFile: File): Promise<string> {
  //   // Use OCR service like Google Vision API, Tesseract.js, or Azure Computer Vision
  //   // return extractedText;
  // }
  
  // static async classifyContent(text: string): Promise<'task_list' | 'single_message'> {
  //   // Use NLP service to classify if the text contains a list of tasks or a single message
  //   // return classification;
  // }
  
  // static async parseTasksFromText(text: string): Promise<TaskData[]> {
  //   // Use AI to parse individual tasks, priorities, dates, etc.
  //   // return parsedTasks;
  // }
}