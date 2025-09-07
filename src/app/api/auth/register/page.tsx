'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Briefcase, Users } from 'lucide-react'
import { registerSchema } from '@/lib/validations'
import { Role, Occupation } from '@prisma/client'
import { occupationLabels, formatPhone } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: (searchParams.get('role')?.toUpperCase() as Role) || Role.TALENT,
      occupations: [],
    }
  })

  const selectedRole = watch('role')
  const selectedOccupations = watch('occupations') || []
  const phoneValue = watch('phone')

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setValue('phone', formatted)
  }

  const toggleOccupation = (occupation: Occupation) => {
    const current = selectedOccupations
    const updated = current.includes(occupation)
      ? current.filter(o => o !== occupation)
      : [...current, occupation]
    setValue('occupations', updated)
  }

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed')
      }

      toast.success('Account created successfully!')
      
      // Auto sign in
      await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      router.push('/')

    } catch (error: any) {
      toast.error(error.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <UserPlus className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Join Listify</h1>
          <p className="text-muted-foreground">Create your account to get started</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">I am a...</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className={`p-4 cursor-pointer transition-colors ${
                  selectedRole === 'TALENT' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                }`}
                onClick={() => setValue('role', Role.TALENT)}
              >
                <div className="text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Talent</h3>
                  <p className="text-sm text-muted-foreground">Looking for work opportunities</p>
                </div>
              </Card>
              
              <Card 
                className={`p-4 cursor-pointer transition-colors ${
                  selectedRole === 'SCOUT' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                }`}
                onClick={() => setValue('role', Role.SCOUT)}
              >
                <div className="text-center">
                  <Briefcase className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Scout</h3>
                  <p className="text-sm text-muted-foreground">Hiring talent for my shop</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <Input
                {...register('name')}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <Input
                {...register('email')}
                type="email"
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Password *</label>
              <Input
                {...register('password')}
                type="password"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone (optional)</label>
              <Input
                value={phoneValue || ''}
                onChange={handlePhoneChange}
                placeholder="(555) 123-4567"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Talent-specific fields */}
          {selectedRole === 'TALENT' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-3">Services (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(occupationLabels).map(([key, label]) => (
                    <Badge
                      key={key}
                      variant={selectedOccupations.includes(key as Occupation) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() => toggleOccupation(key as Occupation)}
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio (optional)</label>
                <Textarea
                  {...register('bio')}
                  placeholder="Tell shops about your experience and what you're looking for..."
                  rows={3}
                />
                {errors.bio && (
                  <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
                )}
              </div>
            </>
          )}

          {/* Scout-specific fields */}
          {selectedRole === 'SCOUT' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Shop Name *</label>
                <Input
                  {...register('shopName')}
                  placeholder="Hair Studio Downtown"
                />
                {errors.shopName && (
                  <p className="text-red-500 text-sm mt-1">{errors.shopName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Shop Address (optional)</label>
                <Input
                  {...register('shopAddress')}
                  placeholder="123 Main St, San Diego, CA 92101"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  For Phase 1, any address is accepted
                </p>
                {errors.shopAddress && (
                  <p className="text-red-500 text-sm mt-1">{errors.shopAddress.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Website (optional)</label>
                <Input
                  {...register('website')}
                  placeholder="https://myshop.com"
                />
                {errors.website && (
                  <p className="text-red-500 text-sm mt-1">{errors.website.message}</p>
                )}
              </div>
            </>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-primary hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}