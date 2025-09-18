import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { useAuth } from '@/contexts/AuthContext'
import TodoList from '@/components/TodoList'
import {
  CheckSquare2,
  Clock,
  Zap,
  Target,
  Users,
  BarChart3,
  ArrowRight,
  Sparkles
} from 'lucide-react'

export default function Home() {
  const { user } = useAuth()

  const features = [
    {
      icon: CheckSquare2,
      title: 'Task Management',
      description: 'Create, organize, and track your tasks with an intuitive interface'
    },
    {
      icon: Clock,
      title: 'Time Tracking',
      description: 'Built-in time tracking to monitor how you spend your work hours'
    },
    {
      icon: Target,
      title: 'Project Organization',
      description: 'Group your tasks into projects for better organization'
    },
    {
      icon: BarChart3,
      title: 'Progress Analytics',
      description: 'Visual insights into your productivity and task completion'
    },
    {
      icon: Users,
      title: 'Personal Workspace',
      description: 'Your own private workspace to manage all your tasks'
    },
    {
      icon: Zap,
      title: 'Fast & Responsive',
      description: 'Lightning-fast interface built for modern productivity'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Taskify</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            {user ? (
              <Button asChild className="professional-btn">
                <Link to="/projects">Dashboard</Link>
              </Button>
            ) : (
              <Button asChild className="professional-btn">
                <Link to="/login">Get Started</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-block p-2 mb-6 bg-primary/10 ">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
          
          <h2 className="text-5xl font-black mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Task Management
            <br />
            That Actually Works
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Built for deep work and focused productivity. Taskify combines powerful task management 
            with time tracking in a brutally simple, beautiful interface.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <Button asChild size="lg" className="professional-btn text-lg px-8">
                <Link to="/projects">
                  Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="professional-btn text-lg px-8">
                  <Link to="/login">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="professional-btn text-lg px-8">
                  <Link to="/projects?demo=true">View Demo</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Daily Todo Section - Only for logged-in users */}
      {user && (
        <section id="daily-todo" className="py-12 px-4">
          <div className="container mx-auto max-w-2xl">
            <TodoList />
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">Everything You Need</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you stay organized and productive
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="professional-card">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10  flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Card className="professional-card max-w-2xl mx-auto">
            <CardContent className="p-12">
              <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-muted-foreground mb-8">
                Join thousands of people who are already using Taskify to manage their tasks and boost their productivity.
              </p>
              
              {user ? (
                <Button asChild size="lg" className="professional-btn text-lg px-8">
                  <Link to="/projects">
                    Open Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="professional-btn text-lg px-8">
                    <Link to="/login">
                      Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="professional-btn text-lg px-8">
                    <Link to="/projects?demo=true">Try Demo</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 bg-card/50">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Taskify</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with ❤️ for productivity enthusiasts
          </p>
        </div>
      </footer>
    </div>
  )
}