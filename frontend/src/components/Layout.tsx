import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { useAuth } from '@/contexts/AuthContext'
import {
  Sparkles,
  LogOut,
  User,
  FolderOpen,
  Home,
  ListTodo
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

export default function Layout({ children, title }: LayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path: string) => {
    if (path === '/projects' && location.pathname.startsWith('/projects')) {
      return true
    }
    return location.pathname === path
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-border bg-card brutalist-shadow sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Taskify</h1>
            </Link>
            
            {user && (
              <nav className="hidden md:flex items-center gap-2">
                <Button 
                  asChild 
                  variant={isActive('/') ? "default" : "ghost"} 
                  size="sm"
                  className="brutalist-btn"
                >
                  <Link to="/">
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={isActive('/projects') ? "default" : "ghost"}
                  size="sm"
                  className="brutalist-btn"
                >
                  <Link to="/projects">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Projects
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={isActive('/daily-todo') ? "default" : "ghost"}
                  size="sm"
                  className="brutalist-btn"
                >
                  <Link to="/#daily-todo">
                    <ListTodo className="h-4 w-4 mr-2" />
                    Daily Todo
                  </Link>
                </Button>
              </nav>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="brutalist-btn">
                    <User className="h-4 w-4 mr-2" />
                    {user.username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="font-medium">
                    <User className="h-4 w-4 mr-2" />
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="md:hidden">
                    <Link to="/projects">
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Projects
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="md:hidden">
                    <Link to="/#daily-todo">
                      <ListTodo className="h-4 w-4 mr-2" />
                      Daily Todo
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="md:hidden" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="brutalist-btn">
                <Link to="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Page Title */}
      {title && (
        <div className="bg-card/50 border-b border-border py-6">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">{title}</h1>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}