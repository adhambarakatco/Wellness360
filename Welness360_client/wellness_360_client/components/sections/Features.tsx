import { Activity, Brain, BarChart3 } from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: Activity,
    title: 'Activity Tracking',
    description: 'Track your steps, distance, calories burned, and more.',
    link: '/features/activity'
  },
  {
    icon: Brain,
    title: 'Smart AI Tips',
    description: 'Get personalized recommendations based on your activity and goals.',
    link: '/features/ai-tips'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Comprehensive analytics and user management tools.',
    link: '/features/analytics'
  }
]

function FeatureCard({ icon: Icon, title, description, link }: {
  icon: any,
  title: string,
  description: string,
  link: string
}) {
  return (
    <div className="bg-black/40 backdrop-blur-sm p-8 rounded-2xl border border-white/5 hover:border-primary/30 transition-all duration-300 group">
      <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400 mb-4 text-sm">{description}</p>
      <Link 
        href={link} 
        className="text-primary hover:text-primary-light flex items-center gap-2 text-sm font-medium"
      >
        Learn more
        <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
      </Link>
    </div>
  )
}

export default function Features() {
  return (
    <section className="py-24 bg-secondary relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,166,81,0.05),transparent_50%)]" />
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Everything you need to track and improve your health and fitness journey.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
} 