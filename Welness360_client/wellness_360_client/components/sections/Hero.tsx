'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
// Import static assets
import posterImage from '../../public/images/fitness-poster.jpg'

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)

  // Check if device is mobile and set up resize listener
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Check on mount
    checkMobile()
    
    // Add resize listener
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // Auto-play the video once component mounts
  useEffect(() => {
    // On mobile, don't even try to load the video
    if (isMobile) {
      setVideoFailed(true)
      return
    }
    
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error('Video autoplay failed:', error)
        // Some browsers block autoplay with sound
        if (videoRef.current) {
          videoRef.current.muted = true
          videoRef.current.play().catch(e => {
            console.error('Muted autoplay failed:', e)
            setVideoFailed(true)
          })
        }
      })
    }
  }, [isMobile])

  return (
    <section className="relative h-[calc(100vh-var(--header-height))] flex items-center justify-center overflow-hidden">
      {/* Video Background with Image Fallback */}
      <div className="absolute inset-0 z-0">
        {!isMobile && !videoFailed ? (
          <video 
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="object-cover object-center w-full h-full"
            poster={posterImage.src}
            onError={() => setVideoFailed(true)}
          >
            <source src="/videos/fitness-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <Image
            src={posterImage}
            alt="Fitness Training"
            fill
            priority
            className="object-cover object-center"
            quality={90}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/60" />
      </div>
      
      {/* Content overlay */}
      <div className="container relative z-10 px-4 md:px-6 h-full flex items-center">
        <motion.div 
          className="max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="inline-block mb-4">
            <div className="flex items-center px-2 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium border border-primary/30 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
              Wellness 360 - AI-Powered Health Platform
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 text-white">
            Elevate Your <span className="text-primary animate-gradient">Wellness Journey</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
            Monitor your physical health through activity tracking, sleep analysis,
            calorie intake, and AI-powered fitness recommendations tailored specifically for you.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto btn btn-primary text-center group"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/demo" 
              className="w-full sm:w-auto btn btn-secondary text-center"
            >
              View Demo
            </Link>
          </div>
          
          <div className="mt-10 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-primary font-bold text-xl md:text-2xl">93%</div>
              <div className="text-gray-400 text-sm">User Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-primary font-bold text-xl md:text-2xl">10k+</div>
              <div className="text-gray-400 text-sm">Active Users</div>
            </div>
            <div className="text-center hidden md:block">
              <div className="text-primary font-bold text-xl md:text-2xl">24/7</div>
              <div className="text-gray-400 text-sm">AI Support</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}