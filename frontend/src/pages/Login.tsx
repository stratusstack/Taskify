import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { Loader2 } from 'lucide-react'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, login, register } = useAuth()

  if (user) {
    return <Navigate to="/projects" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        await login(username, password)
      } else {
        await register(username, email, password)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Taskify
          </h1>
          <p className="mt-2 text-muted-foreground">
            Task management for the modern age
          </p>
        </div>

        <Card className="brutalist-card">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin 
                ? 'Sign in to your account to continue' 
                : 'Create your account to start managing tasks'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="brutalist-shadow-sm"
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="brutalist-shadow-sm"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="brutalist-shadow-sm"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full brutalist-btn" 
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary hover:underline"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : 'Already have an account? Sign in'
                }
              </button>
            </div>

            {isLogin && (
              <div className="mt-4 text-center">
                <Link 
                  to="/projects?demo=true" 
                  className="text-sm text-accent hover:underline font-medium"
                >
                  View Demo →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}