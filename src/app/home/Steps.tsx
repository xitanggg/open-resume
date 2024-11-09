'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Step {
  title: string
  text: string
}

interface LifecycleStage {
  stage: string
  icon: string
}

const STEPS: Step[] = [
  { title: "Optimize for ATS", text: "Ensure your resume is machine-readable" },
  { title: "Use relevant keywords", text: "Match your skills to the job description" },
  { title: "Format for clarity", text: "Use a clean, simple layout for easy parsing" },
]

const ATS_LIFECYCLE: LifecycleStage[] = [
  { stage: "Submit", icon: "📄" },
  { stage: "ATS Scan", icon: "🔍" },
  { stage: "Rank", icon: "🏆" },
  { stage: "Review", icon: "👀" },
  { stage: "Interview", icon: "🤝" },
]

export const Steps = () => {
  const [currentStage, setCurrentStage] = useState<number>(0)

  // Automatic stage cycling every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev + 1) % ATS_LIFECYCLE.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="mx-auto mt-8 rounded-2xl bg-gray-100 px-8 pb-12 pt-10 lg:mt-2 text-gray-900">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center text-3xl font-bold mb-8"
      >
        Create an ATS-Friendly Resume
      </motion.h1>
      
      <div className="mb-12">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-2xl font-semibold mb-4"
        >
          Application Lifecycle
        </motion.h2>
        <div className="flex justify-center items-center space-x-4">
          {ATS_LIFECYCLE.map((item, index) => (
            <motion.div
              key={item.stage}
              className={`flex flex-col items-center ${index === currentStage ? 'text-black' : 'text-gray-400'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: index === currentStage ? 1.1 : 1 
              }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.1 
              }}
            >
              <motion.div 
                className="text-4xl mb-2"
                animate={{ rotate: index === currentStage ? [0, -10, 10, 0] : 0 }}
                transition={{ duration: 0.5 }}
              >
                {item.icon}
              </motion.div>
              <div className="text-sm">{item.stage}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div 
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-center text-2xl font-semibold mb-4">
          Why ATS-Friendly CV Matters
        </h2>
        <p className="text-center max-w-2xl mx-auto">
          An ATS-friendly CV ensures your application passes through automated screening systems, 
          increasing your chances of reaching human recruiters. It helps you stand out in a 
          competitive job market and showcases your qualifications effectively.
        </p>
      </motion.div>

      <div className="bg-white p-4 rounded-lg mb-8">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center text-2xl font-semibold mb-4"
        >
          3 Steps to an ATS-Friendly CV
        </motion.h2>
        <div className="flex justify-center">
          <dl className="flex flex-col gap-y-10 lg:flex-row lg:justify-center lg:gap-x-20">
            {STEPS.map(({ title, text }, idx) => (
              <motion.div 
                className="relative self-start pl-14" 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.6,
                  delay: 0.8 + (idx * 0.2) 
                }}
                whileHover={{ scale: 1.05 }}
              >
                <dt className="text-lg font-bold">
                  <motion.div 
                    className="absolute left-0 top-1 flex h-10 w-10 select-none items-center justify-center rounded-full bg-black text-white"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="text-2xl">
                      {idx + 1}
                    </div>
                  </motion.div>
                  {title}
                </dt>
                <dd>{text}</dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
