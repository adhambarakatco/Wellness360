import Image from 'next/image'

const visualizations = [
  {
    title: 'Activity Dashboard',
    description: 'Track your daily activity with intuitive visualizations.',
    image: '/images/dashboard.png'
  },
  {
    title: 'Sleep Analysis',
    description: 'Understand your sleep patterns and improve your rest.',
    image: '/images/sleep-analysis.png'
  }
]

function VisualizationCard({ title, description, image, isReversed = false }: {
  title: string
  description: string
  image: string
  isReversed?: boolean
}) {
  return (
    <div className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-12 items-center`}>
      <div className="flex-1 w-full">
        <div className="max-w-lg mx-auto md:mx-0">
          <h3 className="text-2xl font-bold mb-4">{title}</h3>
          <p className="text-gray-400 text-lg">{description}</p>
        </div>
      </div>
      <div className="flex-1 w-full">
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-primary/5">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            className="object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>
    </div>
  )
}

export default function Visualization() {
  return (
    <section className="py-16 md:py-24 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(0,166,81,0.1),transparent_50%)]" />
      <div className="container relative z-10">
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Visualize Your Progress</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Beautiful charts and graphs to help you understand your health data.
          </p>
        </div>
        
        <div className="space-y-16 md:space-y-24">
          {visualizations.map((viz, index) => (
            <VisualizationCard
              key={index}
              {...viz}
              isReversed={index % 2 === 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
} 