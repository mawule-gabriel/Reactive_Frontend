import { Link, Outlet, useLocation } from 'react-router-dom'
import { Building2, LayoutDashboard, LogOut, Moon, Sun, User, Users, UsersRound } from 'lucide-react'
import { getAvatarGradient } from '@/lib/colors'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import logoMark from '@/assets/hero.png'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/departments', label: 'Departments', icon: Building2 },
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/profile', label: 'My Profile', icon: User, employeeOnly: true },
  { to: '/colleagues', label: 'My Colleagues', icon: UsersRound, employeeOnly: true },
]

function initialsFrom(email: string): string {
  return email.slice(0, 2).toUpperCase()
}

export function AppShell() {
  const { session, isAdmin, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-purple-500 to-indigo-500">
              <img src={logoMark} alt="" className="h-4 w-4 brightness-0 invert" />
            </div>
            <span className="text-body font-semibold">Reactive HR</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.filter((item) => !item.employeeOnly || !isAdmin).map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={location.pathname === item.to}>
                      <Link to={item.to}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hover:bg-sidebar-accent flex w-full items-center gap-2 rounded-md p-2 text-left">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className={cn("text-caption", getAvatarGradient(session?.email ?? ''))}>{initialsFrom(session?.email ?? '')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate text-body">{session?.email}</div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="flex flex-col gap-1">
                <span className="truncate text-body font-medium">{session?.email}</span>
                <Badge variant="secondary" className="w-fit text-caption">
                  {isAdmin ? 'Admin' : 'Employee'}
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleTheme}>
                {theme === 'dark' ? <Sun /> : <Moon />}
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => logout()}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
        </header>
        <div className="flex-1 overflow-auto animate-in fade-in duration-500 relative isolate">
          {/* Ambient glassmorphism background glow */}
          <div className="fixed inset-0 -z-10 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-500/5 blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-500/5 blur-[120px]" />
          </div>
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
