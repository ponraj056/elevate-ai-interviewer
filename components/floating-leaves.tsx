import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export function FloatingLeaves() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const leaves = Array.from({ length: 5 }, (_, i) => i)

  if (!isMounted) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-accent/5 to-transparent rounded-full blur-3xl" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-accent/5 to-transparent rounded-full blur-3xl" />

      {/* Floating leaves */}
      {leaves.map((i) => (
        <motion.div
          key={i}
          className="absolute text-primary/10 dark:text-primary/5"
          initial={{
            x: Math.random() * 100 - 50,
            y: Math.random() * window.innerHeight,
            rotate: 0,
            opacity: 0.5,
          }}
          animate={{
            x: Math.random() * 200 - 100,
            y: Math.random() * 400 - 200,
            rotate: 360,
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: Math.random() * 10 + 15,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 2,
          }}
        >
          <LeafIcon size={80 + i * 20} />
        </motion.div>
      ))}
    </div>
  )
}

function LeafIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="opacity-40"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Zm0 0v-5" />
    </svg>
  )
}
