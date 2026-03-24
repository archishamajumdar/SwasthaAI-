'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { apiRequest } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface AuthModalsProps {
  loginOpen: boolean
  setLoginOpen: (open: boolean) => void
  registerOpen: boolean
  setRegisterOpen: (open: boolean) => void
}

export function AuthModals({ loginOpen, setLoginOpen, registerOpen, setRegisterOpen }: AuthModalsProps) {
  const { login } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    age: '',
    gender: '',
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const formDataBody = new URLSearchParams();
      formDataBody.append('username', formData.email);
      formDataBody.append('password', formData.password);

      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formDataBody,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Login failed' }));
        throw new Error(errorData.detail || 'Invalid email or password');
      }

      const data = await response.json();
      await login(data.access_token)
      setLoginOpen(false)
      // Reset form
      setFormData({ email: '', password: '', full_name: '', age: '', gender: '' })
      toast.success('Logged in successfully!')
      router.push('/profile')
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      // 1. Create account
      await apiRequest('/auth/register', 'POST', {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender || undefined,
      })

      // 2. Auto-login
      const loginForm = new URLSearchParams()
      loginForm.append('username', formData.email)
      loginForm.append('password', formData.password)

      const loginResponse = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: loginForm,
      })

      if (!loginResponse.ok) {
        throw new Error('Registration succeeded but auto-login failed. Please login manually.')
      }

      const loginData = await loginResponse.json()
      await login(loginData.access_token)
      
      toast.success('Account created! Welcome to SwasthyaAI Twin+.')
      setRegisterOpen(false)
      // Reset form
      setFormData({ email: '', password: '', full_name: '', age: '', gender: '' })
      router.push('/profile')
    } catch (error: any) {
      console.error('Registration Error:', error)
      toast.error(error.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
            <DialogDescription>
              Enter your credentials to access your profile.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="ghost" onClick={() => { setLoginOpen(false); setRegisterOpen(true); }} className="order-2 sm:order-1">
                Don't have an account?
              </Button>
              <Button type="submit" disabled={loading} className="order-1 sm:order-2">
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Create Account</DialogTitle>
            <DialogDescription>
              Join SwasthyaAI Twin+ for personalized healthcare.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegister} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reg_age">Age (Optional)</Label>
                <Input
                  id="reg_age"
                  type="number"
                  placeholder="25"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg_gender">Gender (Optional)</Label>
                <Input
                  id="reg_gender"
                  placeholder="Male/Female"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg_email">Email</Label>
              <Input
                id="reg_email"
                type="email"
                placeholder="m@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg_password">Password</Label>
              <Input
                id="reg_password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="ghost" onClick={() => { setRegisterOpen(false); setLoginOpen(true); }} className="order-2 sm:order-1">
                Already have an account?
              </Button>
              <Button type="submit" disabled={loading} className="order-1 sm:order-2">
                {loading ? 'Creating Account...' : 'Register & Start'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
