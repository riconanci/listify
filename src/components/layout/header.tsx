'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { User, LogOut } from 'lucide-react'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold text-primary">
            Listify
          </Link>

          {session && (
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/profile"
                className="text-foreground/80 hover:text-foreground transition-colors"
              >
                Profile
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded">
                {session.user.role === 'TALENT' ? 'Talent' : 'Scout'}
              </span>
              <div className="flex items-center gap-3">
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {session.user.name}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">
                  Create Account
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}