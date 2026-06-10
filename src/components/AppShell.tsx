'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Phone, Settings,
  TrendingUp, Upload, Zap, CheckSquare, MessageSquare
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard', mobile: true },
  { href: '/leads',       icon: Users,           label: 'Leads',     mobile: true },
  { href: '/tasks',       icon: CheckSquare,     label: 'Tasks',     mobile: true },
  { href: '/chat',        icon: MessageSquare,   label: 'Chat',      mobile: true },
  { href: '/analytics',   icon: TrendingUp,      label: 'Analytics', mobile: false },
  { href: '/calls',       icon: Phone,           label: 'Calls',     mobile: false },
  { href: '/bulk-import', icon: Upload,          label: 'Import',    mobile: false },
  { href: '/settings',    icon: Settings,        label: 'Settings',  mobile: true },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [leadCount, setLeadCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/businesses?count=true')
      .then(r => r.json())
      .then(d => setLeadCount(d.count))
      .catch(() => {})
  }, [])

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href))

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="sidebar-desktop w-60 flex-shrink-0 flex flex-col border-r overflow-y-auto"
        style={{ background: 'rgba(6,6,6,0.98)', borderColor: 'rgba(255,255,255,0.06)' }}>

        {/* Logo */}
        <div className="p-5 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 animate-glow-pulse"
              style={{ background: 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">SK Freelancing</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>AI CRM Platform</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          <div className="text-[10px] font-medium px-3 py-2 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Workspace
          </div>
          {navItems.slice(0, 5).map(item => (
            <Link key={item.href} href={item.href}
              className={`nav-item ${isActive(item.href) ? 'active' : ''}`}>
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
              {item.label === 'Leads' && leadCount !== null && (
                <span className="ml-auto text-xs px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(225,29,72,0.15)', color: '#fb7185' }}>
                  {leadCount}
                </span>
              )}
            </Link>
          ))}

          <div className="text-[10px] font-medium px-3 py-2 pt-4 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Tools
          </div>
          {navItems.slice(5).map(item => (
            <Link key={item.href} href={item.href}
              className={`nav-item ${isActive(item.href) ? 'active' : ''}`}>
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Team status footer */}
        <div className="p-4 border-t flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="glass-card p-3 space-y-2">
            <div className="text-[10px] font-medium tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>TEAM ONLINE</div>
            {['SK', 'Friend'].map(name => (
              <div key={name} className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: name === 'SK' ? '#e11d48' : '#3b82f6' }}>
                    {name[0]}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-black" />
                </div>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto main-with-sidebar">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav">
        {navItems.filter(n => n.mobile).map(item => (
          <Link key={item.href} href={item.href}
            className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
              isActive(item.href) ? 'text-crimson-400' : 'text-white/35'
            }`}>
            <item.icon className="w-5 h-5" />
            <span className="text-[9px]">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
