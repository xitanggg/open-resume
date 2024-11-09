'use client'

import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronRight, Sparkles } from "lucide-react"
import { AutoTypingResume } from "./AutoTypingResume"
import AutoTypingHeroText from "./AutoTypingText"

interface MousePosition {
  x: number
  y: number
}

export const Hero = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl"
            >
              Create Your
              <br />
              <span className="text-secondary">Professional Resume</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 max-w-3xl text-xl text-muted-foreground"
            >
              Secure your next job with ease. Keep your data private and stand out from the crowd.
            </motion.p>
            <div className="mt-8 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Link
                href="/resume-import"
                className="group inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Create Resume
                <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/resume-parser"
                className="inline-flex items-center justify-center rounded-md border border-primary bg-background px-5 py-3 text-base font-medium text-primary transition-colors hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Test ATS Readability
                <Sparkles className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">No sign up required</p>
          </div>
          <div className="relative flex items-center justify-center lg:justify-end">
            <div
              className="absolute inset-0 rounded-full bg-gradient-radial from-primary/20 to-transparent opacity-70 blur-3xl"
              style={{
                background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(var(--primary-rgb), 0.15), transparent 80%)`,
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative w-full max-w-lg"
            >
              <AutoTypingHeroText />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}