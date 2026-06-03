'use client'

import { useState, useRef, useEffect } from 'react'
import type { AIMessage } from '@/types'
import { getAIResponse, getInitialMessages, SUGGESTED_QUESTIONS } from '@/data/aiAssistantMock'
import { IconBot, IconX, IconChevronRight } from './icons'

interface Props {
  embedded?: boolean  // true = full page view, false = floating widget
}

function MessageBubble({ msg }: { msg: AIMessage }) {
  const isUser = msg.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
          <IconBot size={14} />
        </div>
      )}
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
        isUser
          ? 'bg-blue-600 text-white rounded-tr-sm'
          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
      }`}>
        {/* Render markdown-lite: bold, line breaks */}
        <div className="text-sm leading-relaxed whitespace-pre-line">
          {msg.content.split('\n').map((line, i) => {
            const parts = line.split(/\*\*(.*?)\*\*/g)
            return (
              <span key={i}>
                {parts.map((part, j) =>
                  j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                )}
                {i < msg.content.split('\n').length - 1 && <br />}
              </span>
            )
          })}
        </div>

        {/* Related modules */}
        {!isUser && msg.relatedModules && msg.relatedModules.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-100">
            {msg.relatedModules.map((code) => (
              <span key={code} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-mono">
                {code}
              </span>
            ))}
          </div>
        )}

        <div className={`text-xs mt-1.5 ${isUser ? 'text-blue-200' : 'text-gray-400'}`}>
          {msg.timestamp}
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start gap-2">
      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
        <IconBot size={14} />
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AIAssistant({ embedded = false }: Props) {
  const [messages, setMessages] = useState<AIMessage[]>(getInitialMessages())
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = (text: string) => {
    if (!text.trim()) return
    setShowSuggestions(false)

    const userMsg: AIMessage = {
      id: Math.random().toString(36).slice(2),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const reply = getAIResponse(text.trim())
      setMessages((prev) => [...prev, reply])
      setIsTyping(false)
    }, 900 + Math.random() * 600)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  // Mobile: natural height (page-level scroll); Desktop: h-full fixed flex
  const containerClass = 'flex flex-col md:h-full bg-white'

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-slate-900 to-slate-800 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <IconBot size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-sm">AI 法規助理</div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-slate-400 text-xs">台中市建築法規知識庫</span>
          </div>
        </div>
        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded font-mono shrink-0">Mock</span>
      </div>

      {/* Messages */}
      <div className="md:flex-1 md:overflow-y-auto px-4 py-4 space-y-4 bg-gray-50 pb-24 md:pb-4 scroll-smooth">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {showSuggestions && (
        <div className="px-4 py-3 bg-white border-t border-gray-200 shrink-0">
          <div className="text-xs font-semibold text-gray-500 mb-2">建議問題</div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-3 bg-white border-t border-gray-200 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="輸入法規問題，例如：高層建築物需要哪些審查？"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white rounded-xl transition-colors shrink-0"
          >
            <IconChevronRight size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-center">
          ⚠️ Mock 模式 — 回答僅供參考，正式法規適用請向主管機關確認
        </p>
      </div>
    </div>
  )
}
