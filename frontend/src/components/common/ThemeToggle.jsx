import { Moon, Sun, Laptop } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle({ className }) {
  const { theme, setTheme, isDark } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={className}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Moon className="h-4 w-4 text-cyan-400 transition-all" />
          ) : (
            <Sun className="h-4 w-4 text-amber-500 transition-all" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className="flex items-center gap-2"
        >
          <Sun className="h-4 w-4 text-amber-500" />
          <span>Light</span>
          {theme === 'light' && <span className="ml-auto text-xs text-primary font-bold">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className="flex items-center gap-2"
        >
          <Moon className="h-4 w-4 text-cyan-400" />
          <span>Dark</span>
          {theme === 'dark' && <span className="ml-auto text-xs text-primary font-bold">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className="flex items-center gap-2"
        >
          <Laptop className="h-4 w-4 text-muted-foreground" />
          <span>System</span>
          {theme === 'system' && <span className="ml-auto text-xs text-primary font-bold">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
