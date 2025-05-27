import { Heart, Shield, Zap, Users, Trophy, Sparkles } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About - Wellness 360',
  description: 'Learn about our mission to transform your wellness journey',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-3xl" />
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Transforming Lives Through Wellness
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              At Wellness 360, we believe in a holistic approach to health and wellness,
              empowering you to achieve your fitness goals and maintain a balanced lifestyle.
            </p>
            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm">10K+ Active Users</span>
              </div>
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="text-sm">95% Success Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Mission</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-secondary-dark p-6 rounded-2xl border border-white/5">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Holistic Health</h3>
              <p className="text-gray-400">
                Promoting comprehensive wellness through balanced nutrition, exercise, and mental health.
              </p>
            </div>
            <div className="bg-secondary-dark p-6 rounded-2xl border border-white/5">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Safe Progress</h3>
              <p className="text-gray-400">
                Ensuring sustainable and safe progress with expert-backed guidance and support.
              </p>
            </div>
            <div className="bg-secondary-dark p-6 rounded-2xl border border-white/5">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Empowerment</h3>
              <p className="text-gray-400">
                Empowering individuals with knowledge and tools to take control of their wellness journey.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="container mx-auto px-4 py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose Us</h2>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex-shrink-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Personalized Experience</h3>
                <p className="text-gray-400">
                  Our AI-powered platform adapts to your unique needs, creating customized wellness plans
                  that evolve with your progress. We understand that everyone's journey is different,
                  and we're here to support yours.
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex-shrink-0 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Community Support</h3>
                <p className="text-gray-400">
                  Join a thriving community of like-minded individuals on their wellness journey.
                  Share experiences, celebrate victories, and find motivation in our supportive
                  environment.
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex-shrink-0 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Proven Results</h3>
                <p className="text-gray-400">
                  Our science-backed approach has helped thousands achieve their wellness goals.
                  With a 95% success rate, we're committed to helping you reach your full potential.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 