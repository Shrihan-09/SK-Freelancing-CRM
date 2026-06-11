'use client'
import AppShell from '@/components/AppShell'
import { useState, useEffect, useRef } from 'react'
import { Send, Hash, Loader2, MessageSquare } from 'lucide-react'

const CHANNELS = [
  { id: 'general',   label: 'general',   desc: 'Team-wide updates' },
  { id: 'leads',     label: 'leads',     desc: 'Lead discussion' },
  { id: 'projects',  label: 'projects',  desc: 'Active client projects' },
  { id: 'ai-ideas',  label: 'ai-ideas',  desc: 'AI feature brainstorm' },
]

const TEAM = ['SK', 'You']

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getColor(name: string) {
  const colors = ['#e11d48', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7']
  let hash = 0
  for (const c of name) hash = c.charCodeAt(0) + hash * 31
  return colors[Math.abs(hash) % colors.length]
}

export default function ChatPage() {
  const [channel, setChannel] = useState('general')
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [userName] = useState('SK')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let lastTimestamp = ''
    
    const fetchMessages = async () => {
      const res = await fetch(`/api/messages?channel=${channel}`)
      const d = await res.json()
      setMessages(d.messages || [])
      setLoading(false)
      if (d.messages?.length > 0) {
        lastTimestamp = d.messages[d.messages.length - 1].createdAt
      }
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 4000)
    return () => clearInterval(interval)
  }, [channel])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || sending) return
    const content = input.trim()
    setInput('')
    setSending(true)

    // Optimistic
    const optimistic = {
      id: `tmp-${Date.now()}`,
      content,
      channel,
      createdAt: new Date().toISOString(),
      sender: { name: userName },
    }
    setMessages(prev => [...prev, optimistic])

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, channel, senderName: userName }),
    })
    const saved = await res.json()
    setMessages(prev => prev.map(m => m.id === optimistic.id ? saved : m))
    setSending(false)
  }

  const groupedMessages = messages.reduce((acc: any[], msg: any, i: number) => {
    const prev = messages[i - 1]
    const sameUser = prev?.sender?.name === msg.sender?.name
    const sameMinute = prev && Math.abs(new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime()) < 60000
    acc.push({ ...msg, grouped: sameUser && sameMinute })
    return acc
  }, [])

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-0px)] overflow-hidden">
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0 border-r p-3 space-y-1 overflow-y-auto"
          style={{ background: 'rgba(5,5,5,0.8)', borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-[10px] font-semibold px-2 py-1 tracking-widest uppercase"
            style={{ color: 'rgba(255,255,255,0.25)' }}>Channels</p>
          {CHANNELS.map(ch => (
            <button key={ch.id} onClick={() => setChannel(ch.id)}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-all text-left ${
                channel === ch.id
                  ? 'bg-crimson-500/15 text-crimson-400 border border-crimson-500/25'
                  : 'hover:bg-white/4 border border-transparent'
              }`}
              style={{ color: channel === ch.id ? undefined : 'rgba(255,255,255,0.5)' }}>
              <Hash className="w-3 h-3 flex-shrink-0" />
              <span>{ch.label}</span>
            </button>
          ))}

          <div className="pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-semibold px-2 py-1 tracking-widest uppercase"
              style={{ color: 'rgba(255,255,255,0.25)' }}>Team</p>
            {TEAM.map(name => (
              <div key={name} className="flex items-center gap-2 px-2 py-1.5 rounded-lg">
                <div className="relative">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: getColor(name) }}>
                    {getInitials(name)}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-dark-900" />
                </div>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 px-5 py-3 border-b flex-shrink-0"
            style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(8,8,8,0.9)' }}>
            <Hash className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
            <span className="text-sm font-medium text-white">{channel}</span>
            <span className="text-xs ml-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {CHANNELS.find(c => c.id === channel)?.desc}
            </span>
            <div className="ml-auto text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {messages.length} messages
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-5 h-5 text-crimson-400 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                <MessageSquare className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.1)' }} />
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  No messages in #{channel} yet. Be the first!
                </p>
              </div>
            ) : groupedMessages.map((msg: any) => (
              <div key={msg.id} className={`flex items-start gap-3 ${msg.grouped ? 'mt-0.5' : 'mt-4'}`}>
                {!msg.grouped ? (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                    style={{ background: getColor(msg.sender?.name || 'U') }}>
                    {getInitials(msg.sender?.name || 'U')}
                  </div>
                ) : <div className="w-8 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  {!msg.grouped && (
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-sm font-medium text-white">{msg.sender?.name || 'Unknown'}</span>
                      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t flex-shrink-0"
            style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(8,8,8,0.9)' }}>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder={`Message #${channel}`}
                className="flex-1 bg-transparent text-sm outline-none text-white placeholder-white/30"
              />
              <button onClick={send} disabled={!input.trim() || sending}
                className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                style={{ color: input.trim() ? '#e11d48' : 'rgba(255,255,255,0.3)' }}>
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] mt-1.5 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Enter to send · Messages saved to database
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
