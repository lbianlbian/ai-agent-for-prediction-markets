/**
 * Individual message bubble component
 * Renders user and assistant messages with appropriate styling
 */

import type { Message } from "../types"
import { formatMarkdown, truncateUrl } from "../utils/formatting"

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-100"
        }`}
      >
        <div
          dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
          className="prose prose-invert prose-sm max-w-none"
        />

        {message.apiResponse?.agentResp.links && message.apiResponse.agentResp.links.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <div className="text-sm font-semibold mb-2">Related links:</div>
            <ul className="space-y-1">
              {message.apiResponse.agentResp.links.map((link, index) => (
                <li key={index} className="break-all">
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 text-sm underline"
                  >
                    <span className="hidden md:inline">{link}</span>
                    <span className="inline md:hidden">{truncateUrl(link)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
