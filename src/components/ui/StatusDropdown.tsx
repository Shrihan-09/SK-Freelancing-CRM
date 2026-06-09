'use client'
import { useState, useRef, useEffect } from 'react'

export const STATUS_CONFIG: Record<string, { emoji: string; color: string; bg: string; border: string; glow: string }> = {
  'New Lead':          { emoji: '🔥', color: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.3)',  glow: 'rgba(249,115,22,0.2)' },
  'Researched':        { emoji: '🔎', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.3)',  glow: 'rgba(96,165,250,0.2)' },
  'Contacted':         { emoji: '📞', color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.3)',  glow: 'rgba(52,211,153,0.2)' },
  'Follow Up Needed':  { emoji: '⏰', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)',  glow: 'rgba(251,191,36,0.2)' },
  'Interested':        { emoji: '⭐', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)', glow: 'rgba(167,139,250,0.2)' },
  'Demo Sent':         { emoji: '🚀', color: '#fb923c', bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.3)',  glow: 'rgba(251,146,60,0.2)' },
  'Closed':            { emoji: '✅', color: '#4ade80', bg: 'rgba(74,222,128,0.15)', border: 'rgba(74,222,128,0.4)',  glow: 'rgba(74,222,128,0.25)' },
  'Not Interested':    { emoji: '❌', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', glow: 'rgba(248,113,113,0.2)' },
}

export const ALL_STATUSES = Object.keys(STATUS_CONFIG)

interface StatusDropdownProps {
  value: string
  onChange: (status: string) => void
  disabled?: boolean
  size?: 'sm' | 'md'
}

export default function StatusDropdown({ value, onChange, disabled, size = 'md' }: StatusDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const cfg = STATUS_CONFIG[value] || STATUS_CONFIG['New Lead']

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (status: string) => {
    onChange(status)
    setOpen(false)
  }

  const isSmall = size === 'sm'

  return (
    <div ref={ref} className="relative inline-block" style={{ minWidth: isSmall ? 130 : 160 }}>
      {/* Trigger */}
      <button
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: isSmall ? '4px 10px' : '6px 12px',
          borderRadius: 8,
          border: `1px solid ${open ? '#e11d48' : cfg.border}`,
          background: open
            ? 'rgba(225,29,72,0.08)'
            : cfg.bg,
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.18s ease',
          boxShadow: open ? `0 0 12px rgba(225,29,72,0.25)` : `0 0 8px ${cfg.glow}`,
          opacity: disabled ? 0.5 : 1,
          whiteSpace: 'nowrap',
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: isSmall ? 12 : 14 }}>{cfg.emoji}</span>
          <span style={{
            fontSize: isSmall ? 11 : 12,
            fontWeight: 500,
            color: open ? '#e11d48' : cfg.color,
          }}>
            {value}
          </span>
        </span>
        <svg
          width="10" height="10" viewBox="0 0 10 10"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.18s ease',
            flexShrink: 0,
          }}
        >
          <path d="M1 3L5 7L9 3" stroke={open ? '#e11d48' : cfg.color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 9999,
            minWidth: 200,
            borderRadius: 12,
            border: '1px solid rgba(225,29,72,0.35)',
            background: 'rgba(10,10,10,0.97)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 30px rgba(225,29,72,0.15), 0 20px 40px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            animation: 'statusDropIn 0.15s ease-out',
          }}
        >
          <div style={{ padding: '6px' }}>
            {ALL_STATUSES.map(status => {
              const c = STATUS_CONFIG[status]
              const isSelected = status === value
              return (
                <button
                  key={status}
                  onClick={() => handleSelect(status)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: isSelected ? `1px solid ${c.border}` : '1px solid transparent',
                    background: isSelected ? c.bg : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                    marginBottom: 2,
                    boxShadow: isSelected ? `0 0 10px ${c.glow}` : 'none',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLButtonElement).style.background = c.bg
                      ;(e.currentTarget as HTMLButtonElement).style.border = `1px solid ${c.border}`
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                      ;(e.currentTarget as HTMLButtonElement).style.border = '1px solid transparent'
                    }
                  }}
                >
                  <span style={{ fontSize: 16, lineHeight: 1 }}>{c.emoji}</span>
                  <span style={{
                    fontSize: 13,
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? c.color : 'rgba(255,255,255,0.7)',
                  }}>
                    {status}
                  </span>
                  {isSelected && (
                    <span style={{ marginLeft: 'auto', color: c.color, fontSize: 12 }}>✓</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes statusDropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
