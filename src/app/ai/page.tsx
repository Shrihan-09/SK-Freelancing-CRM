'use client'
import AppShell from '@/components/AppShell'
import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Loader2, Copy, Check, Zap, Bot } from 'lucide-react'

const QUICK_PROMPTS = [
  { label: 'Cold call script', prompt: 'Write a cold call script for a painter in NJ with 200+ reviews and no website' },
  { label: 'Pitch email', prompt: 'Write a cold email to pitch a website redesign to a local carpet cleaning company' },
  { label: 'Website proposal', prompt: 'Create a website proposal outline for a family-owned auto body shop' },
  { label: 'Feature ideas', prompt: 'What are the best website features for a local plumber with no website in NJ?' },
  { label: 'Lead analysis', prompt: 'How should I prioritize my outreach between painters, carpet cleaners, and auto body shops?' },
  { label: 'Pricing guide', prompt: 'Help me set pricing for local business website packages as a freelancer' },
]

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: `# Welcome to SK Freelancing AI 🚀

I'm your AI-powered business assistant. I can help you with:

**Sales & Outreach**
- Cold call scripts tailored to specific businesses
- Email templates for web design pitches
- Objection handling strategies

**Business Analysis**
- Analyze specific leads from your CRM
- Suggest website features by industry
- Estimate project value and pricing

**Content & Proposals**
- Website proposals and scope documents
- Service page copy
- Client-facing materials

Ask me anything about your leads, your pitch strategy, or web design for local businesses. I'm trained on your SK Freelancing context.`,
    timestamp: new Date(),
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (content?: string) => {
    const text = content || input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          system: `You are the AI assistant for SK Freelancing, a web design cold outreach CRM for local businesses in Bridgewater/Hillsborough NJ area. 

The user (SK) is a college student and web developer reaching out to local businesses (painters, carpet cleaners, auto body shops) to offer website redesigns, AI features, and automations.

Be concise, practical, and specific. Format responses with markdown when helpful. Focus on actionable advice for cold outreach and web design sales. Keep responses focused and not overly long.`,
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()
      const reply = data.content?.[0]?.text || 'Sorry, I encountered an issue. Please try again.'

      setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: new Date() }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I\'m having trouble connecting right now. Make sure your Anthropic API key is configured correctly in your `.env` file.',
        timestamp: new Date(),
      }])
    }
    setLoading(false)
  }

  const copy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const formatMessage = (content: string) => {
    return content
      .replace(/^# (.+)$/gm, '<h2 style="font-size:16px;font-weight:600;color:white;margin:12px 0 6px">$1</h2>')
      .replace(/^## (.+)$/gm, '<h3 style="font-size:14px;font-weight:600;color:rgba(255,255,255,0.85);margin:10px 0 4px">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:white;font-weight:600">$1</strong>')
      .replace(/`(.+?)`/g, '<code style="background:rgba(225,29,72,0.15);color:#fb7185;padding:1px 5px;border-radius:4px;font-size:12px">$1</code>')
      .replace(/^- (.+)$/gm, '<div style="display:flex;gap:8px;margin:3px 0"><span style="color:#e11d48;margin-top:1px">•</span><span>$1</span></div>')
      .replace(/\n\n/g, '<div style="height:8px"></div>')
      .replace(/\n/g, '<br>')
  }

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-0px)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(8,8,8,0.9)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center animate-glow-pulse"
              style={{ background: 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)' }}>
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">SK AI Assistant</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Claude Sonnet · Ready</span>
              </div>
            </div>
          </div>
          <button onClick={() => setMessages([{
            role: 'assistant',
            content: 'Chat cleared. How can I help you with your web design outreach today?',
            timestamp: new Date(),
          }])} className="btn-ghost text-xs">Clear chat</button>
        </div>

        {/* Quick prompts */}
        <div className="flex gap-2 px-6 py-3 overflow-x-auto flex-shrink-0 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          {QUICK_PROMPTS.map(p => (
            <button key={p.label} onClick={() => send(p.prompt)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all flex-shrink-0"
              style={{ background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.2)', color: '#fb7185' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(225,29,72,0.15)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(225,29,72,0.08)' }}>
              <Zap className="w-3 h-3" /> {p.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-crimson-600 to-crimson-900'
                  : 'bg-gradient-to-br from-blue-600 to-blue-900'
              }`}>
                {msg.role === 'assistant'
                  ? <Bot className="w-4 h-4 text-white" />
                  : <span className="text-xs font-bold text-white">SK</span>}
              </div>

              {/* Bubble */}
              <div className={`flex-1 max-w-2xl ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                <div className={`relative group px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'rounded-tr-sm'
                    : 'rounded-tl-sm'
                }`}
                  style={{
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, rgba(225,29,72,0.2) 0%, rgba(159,18,57,0.2) 100%)'
                      : 'rgba(255,255,255,0.04)',
                    border: msg.role === 'user'
                      ? '1px solid rgba(225,29,72,0.3)'
                      : '1px solid rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.85)',
                  }}>
                  {msg.role === 'assistant' ? (
                    <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                  ) : msg.content}

                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => copy(msg.content, i)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all"
                      style={{ background: 'rgba(255,255,255,0.08)' }}>
                      {copiedIdx === i
                        ? <Check className="w-3 h-3 text-emerald-400" />
                        : <Copy className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.4)' }} />}
                    </button>
                  )}
                </div>
                <div className="text-[10px] mt-1 px-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-crimson-600 to-crimson-900">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-crimson-400"
                      style={{ animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t flex-shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(8,8,8,0.95)' }}>
          <div className="flex items-end gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
              }}
              placeholder="Ask anything about your leads, cold call scripts, website features..."
              rows={1}
              className="flex-1 bg-transparent text-sm outline-none text-white placeholder-white/30 resize-none leading-relaxed"
              style={{ maxHeight: 120 }}
            />
            <button onClick={() => send()} disabled={!input.trim() || loading}
              className="p-2 rounded-lg transition-all disabled:opacity-30 flex-shrink-0"
              style={{
                background: input.trim() ? 'linear-gradient(135deg, #e11d48, #9f1239)' : 'transparent',
                color: 'white',
              }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] mt-2 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Enter to send · Shift+Enter for new line · Powered by Claude Sonnet
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </AppShell>
  )
}
