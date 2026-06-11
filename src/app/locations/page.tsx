'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Plus, Search, Edit2, Trash2, X, Check, Star } from 'lucide-react'

interface Location {
  id: string
  name: string
  description: string | null
  address: string | null
  city: string
  state: string
  country: string
  isDefault: boolean
  _count: { businesses: number; tasks: number }
}

const EMPTY_FORM = { name: '', city: '', state: 'NJ', description: '', address: '', isDefault: false }

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Location | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [error, setError] = useState('')

  const fetchLocations = async () => {
    const res = await fetch('/api/locations')
    const data = await res.json()
    setLocations(data.locations || [])
    setLoading(false)
  }

  useEffect(() => { fetchLocations() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowModal(true)
  }

  const openEdit = (loc: Location) => {
    setEditing(loc)
    setForm({ name: loc.name, city: loc.city, state: loc.state, description: loc.description || '', address: loc.address || '', isDefault: loc.isDefault })
    setError('')
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditing(null); setError('') }

  const handleSave = async () => {
    if (!form.name.trim() || !form.city.trim()) { setError('Name and city are required'); return }
    setSaving(true)
    setError('')
    try {
      const url = editing ? `/api/locations/${editing.id}` : '/api/locations'
      const method = editing ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to save'); setSaving(false); return }
      await fetchLocations()
      closeModal()
    } catch {
      setError('Network error')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await fetch(`/api/locations/${id}`, { method: 'DELETE' })
    setLocations(prev => prev.filter(l => l.id !== id))
    setConfirmDelete(null)
    setDeleting(null)
  }

  const filtered = locations.filter(l =>
    !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.city.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">Locations</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {locations.length} location{locations.length !== 1 ? 's' : ''} · categorize leads by area
          </p>
        </div>
        <button onClick={openAdd} className="btn-crimson text-sm flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add location
        </button>
      </div>

      {/* Search */}
      <div className="glass-card p-3 flex items-center gap-2">
        <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
        <input
          className="flex-1 bg-transparent text-sm outline-none text-white placeholder-white/30"
          placeholder="Search locations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ color: 'rgba(255,255,255,0.3)' }}>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-5 space-y-3">
              <div className="loading-skeleton h-4 rounded w-2/3" />
              <div className="loading-skeleton h-3 rounded w-1/2" />
              <div className="loading-skeleton h-3 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.2)' }}>
            <MapPin className="w-6 h-6" style={{ color: '#fb7185' }} />
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-white mb-1">
              {search ? 'No locations match your search' : 'No locations yet'}
            </div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {search ? 'Try a different search term' : 'Add your first target location to start categorizing leads'}
            </div>
          </div>
          {!search && (
            <button onClick={openAdd} className="btn-crimson text-sm flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add first location
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(loc => (
            <div key={loc.id} className="glass-card p-5 space-y-3 relative group hover:border-crimson-500/20 transition-all"
              style={{ borderColor: loc.isDefault ? 'rgba(225,29,72,0.3)' : undefined }}>
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <Link href={`/leads?locationId=${loc.id}`} className="flex items-center gap-2 min-w-0 flex-1 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.2)' }}>
                    <MapPin className="w-4 h-4" style={{ color: '#fb7185' }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate">{loc.name}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{loc.city}, {loc.state}</div>
                  </div>
                </Link>
                {loc.isDefault && (
                  <span className="flex-shrink-0 flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(225,29,72,0.12)', color: '#fb7185', border: '1px solid rgba(225,29,72,0.25)' }}>
                    <Star className="w-2.5 h-2.5" /> Default
                  </span>
                )}
              </div>

              {/* Description */}
              {loc.description && (
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{loc.description}</p>
              )}

              {/* Counts */}
              <div className="flex items-center gap-3">
                <Link href={`/leads?locationId=${loc.id}`}
                  className="flex items-center gap-1.5 text-xs transition-colors hover:text-white"
                  style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <div className="w-5 h-5 rounded flex items-center justify-center"
                    style={{ background: 'rgba(59,130,246,0.1)' }}>
                    <span className="text-[9px]" style={{ color: '#60a5fa' }}>L</span>
                  </div>
                  {loc._count.businesses} lead{loc._count.businesses !== 1 ? 's' : ''}
                </Link>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <div className="w-5 h-5 rounded flex items-center justify-center"
                    style={{ background: 'rgba(251,191,36,0.1)' }}>
                    <span className="text-[9px]" style={{ color: '#fbbf24' }}>T</span>
                  </div>
                  {loc._count.tasks} task{loc._count.tasks !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <button onClick={() => openEdit(loc)}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-all"
                  style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'white'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}>
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                {confirmDelete === loc.id ? (
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Delete?</span>
                    <button onClick={() => handleDelete(loc.id)} disabled={deleting === loc.id}
                      className="text-xs px-2 py-1 rounded flex items-center gap-0.5"
                      style={{ background: 'rgba(225,29,72,0.15)', color: '#fb7185', border: '1px solid rgba(225,29,72,0.25)' }}>
                      <Check className="w-3 h-3" /> Yes
                    </button>
                    <button onClick={() => setConfirmDelete(null)}
                      className="text-xs px-2 py-1 rounded"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                      No
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(loc.id)}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-all ml-auto"
                    style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.03)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.background = 'rgba(225,29,72,0.08)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)' }}>
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4"
            style={{ background: 'rgba(12,12,12,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">{editing ? 'Edit location' : 'Add location'}</h2>
              <button onClick={closeModal} style={{ color: 'rgba(255,255,255,0.4)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Name *</label>
                <input
                  className="input-dark w-full text-sm"
                  placeholder="e.g. Bridgewater Area"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>City *</label>
                  <input
                    className="input-dark w-full text-sm"
                    placeholder="e.g. Bridgewater"
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>State</label>
                  <input
                    className="input-dark w-full text-sm"
                    placeholder="NJ"
                    value={form.state}
                    onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Description</label>
                <input
                  className="input-dark w-full text-sm"
                  placeholder="Optional description"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Address</label>
                <input
                  className="input-dark w-full text-sm"
                  placeholder="Optional address"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
                  className="w-3.5 h-3.5 rounded"
                />
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Set as default location</span>
              </label>
            </div>

            {error && (
              <div className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(225,29,72,0.1)', color: '#fb7185', border: '1px solid rgba(225,29,72,0.25)' }}>
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button onClick={closeModal} className="btn-ghost text-sm flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-crimson text-sm flex-1">
                {saving ? 'Saving...' : editing ? 'Save changes' : 'Add location'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
