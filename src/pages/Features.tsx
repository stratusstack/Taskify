import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Target, 
  Network, 
  Activity, 
  Calendar, 
  Bell, 
  Zap, 
  CheckCircle, 
  Users,
  ArrowRight,
  Sparkles,
  Timer,
  FileText,
  GitBranch,
  BarChart3,
  Focus,
  Workflow
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Features = () => {
  const coreFeatures = [
    {
      icon: <Network className="h-8 w-8" />,
      title: "Task Dependencies",
      description: "Visual dependency mapping with intelligent circular dependency detection",
      highlight: "Unique Visual Canvas"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Time Tracking",
      description: "Automatic time logging with detailed breakdowns and productivity insights",
      highlight: "Built-in Timer"
    },
    {
      icon: <Activity className="h-8 w-8" />,
      title: "Activity Logging",
      description: "Every action is logged with timestamps for complete task history",
      highlight: "Full Audit Trail"
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Personal Focus",
      description: "Designed for individual productivity, not team collaboration",
      highlight: "Personal Productivity"
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Smart Scheduling",
      description: "Intelligent task scheduling with dependency-aware timelines",
      highlight: "Dependency-Aware"
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: "Smart Reminders",
      description: "Context-aware notifications based on task dependencies and priorities",
      highlight: "Context-Aware"
    }
  ];

  const differentiators = [
    {
      icon: <Focus className="h-6 w-6" />,
      title: "Personal Productivity Focus",
      description: "Unlike team tools like Asana or Jira, this is built specifically for individual task management with deep personal productivity insights."
    },
    {
      icon: <Network className="h-6 w-6" />,
      title: "Visual Dependencies",
      description: "More than simple task lists like Google Tasks - see how your tasks connect and impact each other with our interactive dependency canvas."
    },
    {
      icon: <Timer className="h-6 w-6" />,
      title: "Integrated Time Tracking",
      description: "Built-in time tracking that automatically logs your work patterns, unlike external time tracking tools that require manual setup."
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Complete Activity History",
      description: "Every change is logged with context and timestamps, giving you insights into your work patterns and productivity rhythms."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="outline" className="mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            Personal Productivity Redefined
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Features Built for
            <span className="text-primary"> Deep Work</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Go beyond simple task lists. Track dependencies, monitor time, and understand your productivity patterns with tools designed for serious personal productivity.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/projects">
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Core Features
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need for serious personal productivity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="text-primary">
                      {feature.icon}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.highlight}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes This Different */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              What Makes This Different
            </h2>
            <p className="text-lg text-muted-foreground">
              Not just another task manager - a complete personal productivity system
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {differentiators.map((item, index) => (
              <div key={index} className="flex gap-4 p-6 rounded-lg border bg-card">
                <div className="text-primary mt-1">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deep Dive: Dependencies Canvas */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">
                <GitBranch className="h-4 w-4 mr-2" />
                Dependencies Canvas
              </Badge>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Visualize Task Relationships
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                See how your tasks connect and impact each other. Our interactive dependency canvas helps you understand the critical path through your work.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Drag and drop to create dependencies</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Automatic circular dependency detection</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Visual critical path highlighting</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Interactive node positioning</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="bg-card rounded-lg p-8 border">
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <Workflow className="h-16 w-16 mx-auto mb-4 text-primary" />
                    <p className="text-lg font-medium">Interactive Dependencies Canvas</p>
                    <p className="text-sm">Visual task relationship mapping</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Time Tracking Deep Dive */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative lg:order-first">
              <div className="bg-card rounded-lg p-8 border">
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <Timer className="h-16 w-16 mx-auto mb-4 text-primary" />
                    <p className="text-lg font-medium">Built-in Time Tracking</p>
                    <p className="text-sm">Automatic productivity insights</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Badge variant="outline" className="mb-4">
                <Timer className="h-4 w-4 mr-2" />
                Time Tracking
              </Badge>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Understand Your Work Patterns
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Built-in time tracking that automatically starts and stops with task status changes. Get insights into your productivity patterns without manual timers.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Automatic time logging on status changes</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Detailed time breakdowns per task</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Productivity pattern analysis</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Historical time tracking data</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Productivity Focus */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">
                <Focus className="h-4 w-4 mr-2" />
                Personal Productivity
              </Badge>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Built for Individual Excellence
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Unlike team-focused tools, this is designed specifically for individual productivity. No collaboration overhead, no team features you don't need.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Personal productivity insights</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Individual work pattern analysis</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Distraction-free interface</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Personal goal tracking</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="bg-card rounded-lg p-8 border">
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <Focus className="h-16 w-16 mx-auto mb-4 text-primary" />
                    <p className="text-lg font-medium">Personal Focus</p>
                    <p className="text-sm">Individual productivity optimization</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activity & Note System */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative lg:order-first">
              <div className="bg-card rounded-lg p-8 border">
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-primary" />
                    <p className="text-lg font-medium">Activity Logging</p>
                    <p className="text-sm">Complete audit trail</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Badge variant="outline" className="mb-4">
                <Activity className="h-4 w-4 mr-2" />
                Activity System
              </Badge>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Complete Work History
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Every action is automatically logged with timestamps and context. Understand your work patterns and track your productivity journey.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Automatic activity logging</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Rich text notes and comments</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Timeline view of all changes</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Searchable activity history</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Ready to Transform Your Productivity?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of professionals who've revolutionized their personal productivity with our comprehensive task management system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                Start Your Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/projects">
              <Button size="lg" variant="outline">
                Explore Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};