import { Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/contexts/ThemeContext'

export function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="professional-btn">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Switch theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {themes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
            className={`cursor-pointer ${theme === themeOption.value ? 'bg-accent' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div 
                  className="w-3 h-3 border border-border"
                  style={{ backgroundColor: themeOption.colors.primary }}
                />
                <div 
                  className="w-3 h-3 border border-border"
                  style={{ backgroundColor: themeOption.colors.secondary }}
                />
                <div 
                  className="w-3 h-3 border border-border"
                  style={{ backgroundColor: themeOption.colors.accent }}
                />
              </div>
              <div>
                <div className="font-semibold">{themeOption.name}</div>
                <div className="text-xs text-muted-foreground">{themeOption.description}</div>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}