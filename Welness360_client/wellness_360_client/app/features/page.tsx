import { 
  ActivitySquare, 
  Brain, 
  Utensils, 
  LineChart, 
  Clock, 
  Share2,
  MessageCircle,
  Target,
  Bell,
  Smartphone
} from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Features - Wellness 360',
  description: 'Discover the powerful features that make Wellness 360 your ultimate wellness companion',
}

const features = [
  {
    icon: ActivitySquare,
    title: 'Workout Tracking',
    description: 'Log and track your workouts with detailed analytics and progress monitoring.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: Utensils,
    title: 'Nutrition Planning',
    description: 'Create personalized meal plans and track your daily nutrition intake.',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: Brain,
    title: 'Mental Wellness',
    description: 'Access meditation guides and stress management tools for mental health.',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: LineChart,
    title: 'Progress Analytics',
    description: 'Visualize your progress with detailed charts and insights.',
    color: 'from-primary to-primary-light'
  },
  {
    icon: Clock,
    title: 'Habit Building',
    description: 'Develop healthy habits with our smart reminder system.',
    color: 'from-orange-500 to-orange-600'
  },
  {
    icon: Share2,
    title: 'Social Integration',
    description: 'Connect with friends and share your wellness journey.',
    color: 'from-pink-500 to-pink-600'
  }
]

const highlights = [
  {
    icon: Target,
    title: 'Goal Setting',
    description: 'Set personalized goals and track your progress with our intuitive dashboard.'
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'Never miss a workout or meal with customizable notifications.'
  },
  {
    icon: MessageCircle,
    title: 'Expert Support',
    description: 'Get guidance from certified wellness experts and nutritionists.'
  },
  {
    icon: Smartphone,
    title: 'Mobile Access',
    description: 'Access your wellness data anytime, anywhere with our mobile app.'
  }
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Powerful Features for Your{' '}
              <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                Wellness Journey
              </span>
            </h1>
            <p className="text-xl text-gray-300">
              Everything you need to achieve your wellness goals, all in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Core Features Grid */}
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Core Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-secondary-dark p-6 rounded-2xl border border-white/5 hover:border-primary/20 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-r ${feature.color}`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Highlights Section */}
      <div className="container mx-auto px-4 py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Additional Highlights</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {highlights.map((highlight, index) => (
              <div 
                key={index}
                className="flex gap-6 items-start group p-6 rounded-2xl border border-transparent hover:bg-secondary-dark hover:border-white/5 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex-shrink-0 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <highlight.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {highlight.title}
                  </h3>
                  <p className="text-gray-400">
                    {highlight.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of users who have transformed their lives with Wellness 360.
          </p>
          <a 
            href="/signup" 
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  )
} 