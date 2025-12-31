"use client"

/**
 * Loading status indicator with cycling messages
 * Shows different status messages every 4 seconds while loading
 */

import { useState, useEffect } from "react"

const LOADING_MESSAGES = [
  "understanding your query",
  "reading the news",
  "analyzing the match",
  "checking team injuries",
  "reviewing head-to-head stats",
  "fetching info on stakes and profits",
  "calculating value potential",
  "composing analysis",
  "generating risk assessment",
  "finalizing recommendation",
  "putting it all together",
]

export default function LoadingStatus() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex justify-start">
      <div className="bg-slate-800 text-slate-300 rounded-2xl px-4 py-3 max-w-[80%]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-sm">{LOADING_MESSAGES[messageIndex]}</span>
        </div>
      </div>
    </div>
  )
}
