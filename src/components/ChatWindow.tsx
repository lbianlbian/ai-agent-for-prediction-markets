"use client"

import type React from "react"

/**
 * Main chat window component
 * Manages message display, input, and API communication
 */

import { useState, useRef, useEffect } from "react"
import MessageBubble from "./MessageBubble"
import BetPanel from "./BetPanel"
import LoadingStatus from "./LoadingStatus"
import { analyzeQuery } from "../utils/api"
import type { Message, ApiResponse } from "../types"

interface ChatWindowProps {
  messages: Message[]
  setMessages: (messages: Message[]) => void
  convId: string | undefined
  setConvId: (id: string) => void
  defaultMatches: any
  setDefaultMatches: (matches: any) => void
  onPlaceBet: (apiResponse: ApiResponse, outcomeIndex: number, stake: number) => void
}

export default function ChatWindow({
  messages,
  setMessages,
  convId,
  setConvId,
  defaultMatches,
  setDefaultMatches,
  onPlaceBet,
}: ChatWindowProps) {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  /**
   * Handles form submission and API communication
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: "user",
      content: input,
    }

    setMessages([...messages, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await analyzeQuery(input, convId, defaultMatches)

      // Update conversation state
      setConvId(response.payload.conv_id)
      setDefaultMatches(response.payload.default_matches)

      const assistantMessage: Message = {
        role: "assistant",
        content: response.agentResp.response,
        apiResponse: response,
      }

      setMessages([...messages, userMessage, assistantMessage])
    } catch (error) {
      console.error("Error calling analyze API:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, there was an error processing your request. Please try again.",
      }
      setMessages([...messages, userMessage, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const isInitialState = messages.length === 0

  return (
    <div className="flex-1 flex flex-col">
      {isInitialState ? (
        // Hero state - centered content
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
              Enough with the rugpulls.
              <br />
              Try soccer betting with <span className="text-purple-500">SolGol</span>
            </h1>
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What will you bet on today?"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-6 py-4 text-lg focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      ) : (
        // Chat state - messages + fixed input
        <>
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <div key={index}>
                  <MessageBubble message={message} />
                  {message.role === "assistant" && message.apiResponse && index === messages.length - 1 && (
                    <BetPanel apiResponse={message.apiResponse} onPlaceBet={onPlaceBet} />
                  )}
                </div>
              ))}
              {isLoading && <LoadingStatus />}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-slate-700 bg-slate-800 px-4 py-4">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask another question..."
                  disabled={isLoading}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 pr-20 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-4 py-1.5 rounded-md transition-colors text-sm"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
