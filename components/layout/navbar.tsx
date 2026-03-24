'use client'

import { useState } from 'react'
import { Heart, Bell, User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { AuthModals } from '@/components/auth-modals'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)

  const handleUserClick = () => {
    if (!user) {
      setLoginOpen(true)
    } else {
      router.push('/profile')
    }
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
            <Heart className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg hidden sm:inline">SwasthyaAI Twin+</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Bell className="w-5 h-5" />
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.full_name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={handleUserClick}>
              <User className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      <AuthModals 
        loginOpen={loginOpen} 
        setLoginOpen={setLoginOpen}
        registerOpen={registerOpen}
        setRegisterOpen={setRegisterOpen}
      />
    </nav>
  )
}
