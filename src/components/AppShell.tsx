'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard, Users, Phone, Settings,
  TrendingUp, Upload, Zap, CheckSquare, MessageSquare, Bot, LogOut, Loader2, MapPin
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard', mobile: true },
  { href: '/leads',       icon: Users,           label: 'Leads',     mobile: true },
  { href: '/tasks',       icon: CheckSquare,     label: 'Tasks',     mobile: true },
  { href: '/chat',        icon: MessageSquare,   label: 'Chat',      mobile: true },
  { href: '/ai',          icon: Bot,             label: 'AI',        mobile: true },
  { href: '/analytics',   icon: TrendingUp,      label: 'Analytics', mobile: false },
  { href: '/calls',       icon: Phone,           label: 'Calls',     mobile: false },
  { href: '/locations',   icon: MapPin,          label: 'Locations', mobile: false },
  { href: '/bulk-import', icon: Upload,          label: 'Import',    mobile: false },
  { href: '/settings',    icon: Settings,        label: 'Settings',  mobile: true },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [leadCount, setLeadCount] = useState<number | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/businesses?count=true')
        .then(r => r.json())
        .then(d => setLeadCount(d.count))
        .catch(() => {})
    }
  }, [status])

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#030303' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center animate-glow-pulse"
            style={{ background: 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)' }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'rgba(255,255,255,0.4)' }} />
        </div>
      </div>
    )
  }

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

        {/* User footer */}
        <div className="p-4 border-t flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="glass-card p-3 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                style={{ background: '#e11d48' }}>
                {session?.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white truncate">{session?.user?.name || 'User'}</div>
                <div className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{session?.user?.email || ''}</div>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all"
              style={{ color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(225,29,72,0.08)'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#fb7185'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(225,29,72,0.25)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'
              }}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
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
