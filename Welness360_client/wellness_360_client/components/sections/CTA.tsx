import Link from 'next/link'

export default function CTA() {
  return (
    <section className="py-24 bg-secondary relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,166,81,0.15),transparent_50%)]" />
      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Start Your Wellness Journey?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Join thousands of users who have transformed their health with Wellness 360.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto btn btn-primary text-center px-8"
            >
              Sign Up Now
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto btn btn-secondary text-center px-8"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
} 