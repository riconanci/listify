'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Save } from 'lucide-react'
import { Occupation } from '@prisma/client'
import { occupationLabels, formatPhone } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm()

  const phoneValue = watch('phone')
  const selectedOccupations = watch('occupations') || []

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Load user profile data
  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      const data = await response.json()
      
      if (response.ok) {
        setUserData(data.user)
        
        // Populate form
        setValue('name', data.user.name)
        setValue('phone', data.user.phone || '')
        
        if (data.user.talentProfile) {
          setValue('occupations', data.user.talentProfile.occupations)
          setValue('bio', data.user.talentProfile.bio || '')
        }
        
        if (data.user.scoutProfile) {
          setValue('shopName', data.user.scoutProfile.shopName)
          setValue('defaultAddress', data.user.scoutProfile.defaultAddress || '')
          setValue('website', data.user.scoutProfile.website || '')
        }
      }
    } catch (error) {
      toast.error('Failed to load profile')
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setValue('phone', formatted)
  }

  const toggleOccupation = (occupation: Occupation) => {
    const current = selectedOccupations
    const updated = current.includes(occupation)
      ? current.filter((o: Occupation) => o !== occupation)
      : [...current, occupation]
    setValue('occupations', updated)
  }

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const payload: any = {
        name: data.name,
        phone: data.phone,
      }

      if (session?.user.role === 'TALENT') {
        payload.talentProfile = {
          occupations: data.occupations,
          bio: data.bio,
        }
      } else if (session?.user.role === 'SCOUT') {
        payload.scoutProfile = {
          shopName: data.shopName,
          defaultAddress: data.defaultAddress,
          website: data.website,
        }
      }

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update profile')
      }

      toast.success('Profile updated successfully!')
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="h-64 animate-pulse bg-muted" />
      </div>
    )
  }

  if (!session || !userData) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        <Card className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{userData.name}</h2>
              <p className="text-muted-foreground">{userData.email}</p>
              <Badge variant="secondary" className="mt-1">
                {session.user.role === 'TALENT' ? 'Talent' : 'Scout'}
              </Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <Input
                  {...register('name', { required: 'Name is required' })}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name?.message as string}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone (optional)</label>
                <Input
                  value={phoneValue || ''}
                  onChange={handlePhoneChange}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            {/* Talent-specific fields */}
            {session.user.role === 'TALENT' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-3">Services</label>
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
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <Textarea
                    {...register('bio')}
                    placeholder="Tell shops about your experience and what you're looking for..."
                    rows={4}
                  />
                </div>
              </>
            )}

            {/* Scout-specific fields */}
            {session.user.role === 'SCOUT' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Shop Name</label>
                  <Input
                    {...register('shopName', { required: 'Shop name is required' })}
                    placeholder="Hair Studio Downtown"
                  />
                  {errors.shopName && (
                    <p className="text-red-500 text-sm mt-1">{errors.shopName?.message as string}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Shop Address (optional)</label>
                  <Input
                    {...register('defaultAddress')}
                    placeholder="123 Main St, San Diego, CA 92101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Website (optional)</label>
                  <Input
                    {...register('website')}
                    placeholder="https://myshop.com"
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}