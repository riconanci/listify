import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Header } from '@/components/layout/header'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Listify - Connect Local Service Talent with Shops',
  description: 'Find service industry jobs and talent in San Diego County',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground`}>
        <Providers>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(220 13% 16%)',
                color: 'hsl(220 9% 89%)',
                border: '1px solid hsl(220 13% 20%)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}