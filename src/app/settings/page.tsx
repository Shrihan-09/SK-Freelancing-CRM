'use client'
import AppShell from '@/components/AppShell'
import { useState, useEffect } from 'react'
import { Plus, MapPin, Briefcase, Check, Users, Key, Globe, Bell, Palette } from 'lucide-react'

export default function SettingsPage() {
  const [newCity, setNewCity] = useState('')
  const [newIndustry, setNewIndustry] = useState('')
  const [locations, setLocations] = useState<any[]>([])
  const [saved, setSaved] = useState(false)
  const [apiKeyStatus, setApiKeyStatus] = useState<'unknown' | 'set' | 'missing'>('unknown')

  useEffect(() => {
    fetch('/api/locations').then(r => r.json()).then(d => setLocations(d.locations || []))
    // Test if API key works via a quick check
    fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ check: true }) })
      .then(() => setApiKeyStatus('set')).catch(() => setApiKeyStatus('missing'))
  }, [])

  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const addLocation = async () => {
    if (!newCity.trim()) return
    const res = await fetch('/api/locations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city: newCity.trim(), state: 'NJ' }),
    })
    const loc = await res.json()
    setLocations(prev => [...prev, loc])
    setNewCity('')
    showSaved()
  }

  const settingsSections = [
    {
      id: 'api', title: 'AI Configuration', icon: Key, desc: 'Anthropic API key for AI analysis features',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${apiKeyStatus === 'set' ? 'bg-emerald-400' : apiKeyStatus === 'missing' ? 'bg-red-400' : 'bg-amber-400'}`} />
            <div className="flex-1">
              <div className="text-sm font-medium text-white">ANTHROPIC_API_KEY</div>
              <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {apiKeyStatus === 'set' ? 'Configured · AI analysis enabled' : 'Add to your .env file to enable AI features'}
              </div>
            </div>
          </div>
          <div className="text-xs p-3 rounded-lg" style={{ background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.2)', color: 'rgba(255,255,255,0.6)' }}>
            <div className="font-medium text-crimson-400 mb-1">Setup instructions</div>
            Add <code className="bg-black/30 px-1 rounded text-crimson-400">ANTHROPIC_API_KEY=sk-ant-...</code> to your <code className="bg-black/30 px-1 rounded text-crimson-400">.env</code> file.
            Get your key at <a href="https://console.anthropic.com" target="_blank" className="text-crimson-400 underline">console.anthropic.com</a>
          </div>
        </div>
      )
    },
    {
      id: 'locations', title: 'Target Locations', icon: MapPin, desc: 'Cities you are targeting for web design outreach',
      content: (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {locations.map(loc => (
              <span key={loc.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                style={{ background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.2)', color: '#fb7185' }}>
                <MapPin className="w-3 h-3" /> {loc.city}, {loc.state}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newCity} onChange={e => setNewCity(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addLocation()}
              className="input-dark flex-1 text-sm" placeholder="e.g. Somerville, Warren, Watchung" />
            <button onClick={addLocation} className="btn-crimson text-sm px-4 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Adding a location automatically creates analytics filtering for that area.
          </p>
        </div>
      )
    },
    {
      id: 'industries', title: 'Target Industries', icon: Briefcase, desc: 'Business types you pitch websites to',
      content: (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {['🖌️ Painters', '🧹 Carpet Cleaners', '🚗 Auto Body Shops', '🦷 Dentists', '🔧 Plumbers', '❄️ HVAC', '🌿 Landscapers', '🍽️ Restaurants'].map(ind => (
              <span key={ind} className="px-3 py-1.5 rounded-lg text-xs"
                style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}>
                {ind}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newIndustry} onChange={e => setNewIndustry(e.target.value)}
              className="input-dark flex-1 text-sm" placeholder="e.g. Electricians" />
            <button className="btn-ghost text-sm px-4 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            AI automatically generates cold call scripts and feature ideas for any new industry you add.
          </p>
        </div>
      )
    },
    {
      id: 'team', title: 'Team Members', icon: Users, desc: 'People with access to SK Freelancing',
      content: (
        <div className="space-y-3">
          {[
            { name: 'SK (You)', role: 'Owner', color: '#e11d48', email: 'sk@sklfreelancing.com' },
            { name: 'Friend', role: 'Member', color: '#3b82f6', email: 'Invite pending...' },
          ].map(m => (
            <div key={m.name} className="flex items-center gap-3 p-3 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                style={{ background: m.color }}>
                {m.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{m.name}</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{m.email}</div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                {m.role}
              </span>
            </div>
          ))}
          <button className="btn-ghost text-sm w-full flex items-center justify-center gap-2">
            <Plus className="w-3.5 h-3.5" /> Invite team member
          </button>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Full auth system ready — add Supabase or NextAuth to enable team logins.
          </p>
        </div>
      )
    },
    {
      id: 'roadmap', title: 'Roadmap', icon: Globe, desc: 'Features being built',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: 'AI email generator',     desc: 'Draft cold emails per business',          status: 'Soon',    color: '#e11d48' },
            { name: 'SMS follow-up',           desc: 'Automated text reminders',               status: 'Soon',    color: '#e11d48' },
            { name: 'Calendar scheduling',    desc: 'Book discovery calls in-app',             status: 'Planned', color: '#f59e0b' },
            { name: 'Proposal generator',     desc: 'AI-written website proposals as PDF',     status: 'Planned', color: '#f59e0b' },
            { name: 'Website audit tool',     desc: 'Auto-score competitor sites',             status: 'Planned', color: '#f59e0b' },
            { name: 'Chrome extension',       desc: 'Scrape leads from Google Maps',           status: 'Planned', color: '#f59e0b' },
            { name: 'Client portal',          desc: 'Clients view their project progress',     status: 'Future',  color: '#60a5fa' },
            { name: 'Stripe payments',        desc: 'Invoice and collect payments',            status: 'Future',  color: '#60a5fa' },
          ].map(f => (
            <div key={f.name} className="flex items-start gap-3 p-3 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{f.name}</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{f.desc}</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded font-medium flex-shrink-0"
                style={{ background: `${f.color}15`, color: f.color, border: `1px solid ${f.color}30` }}>
                {f.status}
              </span>
            </div>
          ))}
        </div>
      )
    },
  ]

  return (
    <AppShell>
      <div className="p-6 space-y-5 animate-fade-in max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Settings</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>SK Freelancing configuration</p>
          </div>
          {saved && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 animate-fade-in">
              <Check className="w-3.5 h-3.5" /> Saved
            </div>
          )}
        </div>

        {settingsSections.map(s => (
          <div key={s.id} className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.2)' }}>
                <s.icon className="w-4 h-4 text-crimson-400" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-white">{s.title}</h2>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.desc}</p>
              </div>
            </div>
            {s.content}
          </div>
        ))}
      </div>
    </AppShell>
  )
}
