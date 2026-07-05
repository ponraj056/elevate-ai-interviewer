'use client'

import { motion } from 'framer-motion'

interface ChatMessageProps {
  message: string
  isUser: boolean
  index: number
}

export function ChatMessage({ message, isUser, index }: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl backdrop-blur-sm ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-card text-card-foreground border border-border/50 rounded-bl-none'
        }`}
      >
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
    </motion.div>
  )
}
