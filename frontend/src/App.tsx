import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Tasks from './pages/Tasks'
import Login from './pages/Login'

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:projectId/tasks" element={<Tasks />} />
              </Routes>
              <Toaster 
                position="top-right"
                toastOptions={{
                  style: {
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--card-foreground))',
                    border: '2px solid hsl(var(--border))',
                  },
                }}
              />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App