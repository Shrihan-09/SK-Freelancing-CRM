'use client'
import AppShell from '@/components/AppShell'
import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Bot, User } from 'lucide-react'

const QUICK_PROMPTS = [
  'Cold call script for a painter',
  'Email template for carpet cleaner',
  'Website features for auto body shop',
  'Pricing advice for web design',
]

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.text || 'No response' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Could not connect to AI.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-5 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(225,29,72,0.15)', border: '1px solid rgba(225,29,72,0.3)' }}>
              <Bot className="w-4 h-4" style={{ color: '#fb7185' }} />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">AI Assistant</h1>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Powered by Gemini · Web design sales expert</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6 py-12">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-glow-pulse"
                style={{ background: 'rgba(225,29,72,0.12)', border: '1px solid rgba(225,29,72,0.25)' }}>
                <Bot className="w-7 h-7" style={{ color: '#fb7185' }} />
              </div>
              <div className="text-center">
                <h2 className="text-base font-semibold text-white mb-1">Ask me anything</h2>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Cold call scripts, email templates, pricing advice</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {QUICK_PROMPTS.map(p => (
                  <button key={p} onClick={() => send(p)}
                    className="text-left px-4 py-3 rounded-xl text-xs transition-all"
                    style={{ background: 'rgba(225,29,72,0.07)', border: '1px solid rgba(225,29,72,0.18)', color: 'rgba(255,255,255,0.6)' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(225,29,72,0.12)'
                      ;(e.currentTarget as HTMLButtonElement).style.color = '#fb7185'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(225,29,72,0.07)'
                      ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)'
                    }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(225,29,72,0.15)', border: '1px solid rgba(225,29,72,0.3)' }}>
                  <Bot className="w-3.5 h-3.5" style={{ color: '#fb7185' }} />
                </div>
              )}
              <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed`}
                style={msg.role === 'user'
                  ? { background: 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)', color: 'white' }
                  : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)' }
                }
              >
                <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: '#e11d48' }}>
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(225,29,72,0.15)', border: '1px solid rgba(225,29,72,0.3)' }}>
                <Bot className="w-3.5 h-3.5" style={{ color: '#fb7185' }} />
              </div>
              <div className="rounded-xl px-4 py-3 flex items-center gap-2"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#fb7185' }} />
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Thinking...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick prompts strip (shown when there are messages) */}
        {messages.length > 0 && (
          <div className="px-5 pb-2 flex gap-2 overflow-x-auto flex-shrink-0">
            {QUICK_PROMPTS.map(p => (
              <button key={p} onClick={() => send(p)} disabled={loading}
                className="whitespace-nowrap text-xs px-3 py-1.5 rounded-lg flex-shrink-0 transition-all"
                style={{ background: 'rgba(225,29,72,0.07)', border: '1px solid rgba(225,29,72,0.18)', color: 'rgba(255,255,255,0.5)' }}>
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
              placeholder="Ask about cold calls, pricing, email templates..."
              className="input-dark flex-1 text-sm"
              disabled={loading}
            />
            <button onClick={() => send(input)} disabled={!input.trim() || loading}
              className="btn-crimson px-4 flex items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
