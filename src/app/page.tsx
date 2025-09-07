import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Users, Briefcase } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/20 via-background to-secondary/20 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Connect Local Service Talent with Shops
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Listify connects talented barbers, cosmetologists, and tattoo artists with shops 
            in San Diego County. Find your next opportunity or hire skilled talent.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Browse Jobs
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Currently serving San Diego County, CA</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            How Listify Works
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* For Talent */}
            <Card className="p-8">
              <div className="text-center mb-6">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">For Talent</h3>
                <Badge variant="secondary">Barbers • Cosmetologists • Tattoo Artists</Badge>
              </div>
              
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Browse local job opportunities with detailed descriptions</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Filter by service type, schedule, and location</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Apply directly with built-in inquiry system</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Connect with local shops in your area</span>
                </li>
              </ul>
            </Card>

            {/* For Shops */}
            <Card className="p-8">
              <div className="text-center mb-6">
                <Briefcase className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">For Shops</h3>
                <Badge variant="secondary">Shop Owners • Scouts</Badge>
              </div>
              
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Post job listings with photos and detailed requirements</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Receive applications from qualified local talent</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Manage inquiries with integrated dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Find the perfect fit for your team</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary/50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join the growing community of service professionals and shop owners in San Diego County.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register?role=talent">
              <Button size="lg" className="text-lg px-8">
                I'm Looking for Work
              </Button>
            </Link>
            <Link href="/auth/register?role=scout">
              <Button variant="outline" size="lg" className="text-lg px-8">
                I'm Hiring Talent
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}