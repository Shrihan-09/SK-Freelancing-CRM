'use client'
import AppShell from '@/components/AppShell'
import { useState, useEffect, useRef } from 'react'
import { Plus, Loader2, Trash2, Calendar, Flag, Building2, X, CheckCircle2, Clock, Circle, RotateCcw } from 'lucide-react'

const COLUMNS = [
  { id: 'Backlog',     label: 'Backlog',     icon: Circle,       color: '#888' },
  { id: 'In Progress', label: 'In Progress', icon: RotateCcw,    color: '#60a5fa' },
  { id: 'Review',      label: 'Review',      icon: Clock,        color: '#fbbf24' },
  { id: 'Completed',   label: 'Completed',   icon: CheckCircle2, color: '#4ade80' },
]

const PRIORITY_CONFIG: Record<string, { color: string; label: string }> = {
  Low:      { color: '#60a5fa', label: 'Low' },
  Medium:   { color: '#fbbf24', label: 'Medium' },
  High:     { color: '#f97316', label: 'High' },
  Critical: { color: '#ef4444', label: 'Critical' },
}

interface Task {
  id: string; title: string; description?: string; status: string
  priority: string; dueDate?: string; businessId?: string
  business?: { id: string; companyName: string; industry: string }
  _count?: { comments: number }; createdAt: string
}

function TaskCard({ task, onMove, onDelete }: { task: Task; onMove: (id: string, status: string) => void; onDelete: (id: string) => void }) {
  const [showMenu, setShowMenu] = useState(false)
  const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed'

  return (
    <div className="glass-card p-3 cursor-default hover:border-crimson-500/25 transition-colors group"
      style={{ marginBottom: 8 }}>
      {/* Priority bar */}
      <div className="absolute top-0 left-0 w-full h-0.5 rounded-t-lg opacity-60"
        style={{ background: pc.color }} />

      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-sm font-medium text-white leading-tight flex-1">{task.title}</span>
        <div className="relative flex-shrink-0">
          <button onClick={() => setShowMenu(m => !m)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all">
            <span className="text-white/40 text-xs">···</span>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-6 z-50 glass-card py-1 min-w-32"
              style={{ border: '1px solid rgba(225,29,72,0.3)' }}>
              {COLUMNS.filter(c => c.id !== task.status).map(col => (
                <button key={col.id} onClick={() => { onMove(task.id, col.id); setShowMenu(false) }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-white/5 transition-colors"
                  style={{ color: col.color }}>
                  → {col.label}
                </button>
              ))}
              <div className="border-t my-1" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
              <button onClick={() => { onDelete(task.id); setShowMenu(false) }}
                className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-xs mb-2 line-clamp-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {task.description}
        </p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] px-1.5 py-0.5 rounded border font-medium"
          style={{ color: pc.color, borderColor: `${pc.color}40`, background: `${pc.color}10` }}>
          {pc.label}
        </span>
        {task.business && (
          <span className="flex items-center gap-1 text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <Building2 className="w-2.5 h-2.5" /> {task.business.companyName}
          </span>
        )}
        {task.dueDate && (
          <span className={`flex items-center gap-1 text-[10px] ml-auto ${isOverdue ? 'text-red-400' : ''}`}
            style={{ color: isOverdue ? undefined : 'rgba(255,255,255,0.35)' }}>
            <Calendar className="w-2.5 h-2.5" />
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  )
}

function AddTaskModal({ onAdd, onClose, businesses }: { onAdd: (t: any) => void; onClose: () => void; businesses: any[] }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [dueDate, setDueDate] = useState('')
  const [businessId, setBusinessId] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!title.trim()) return
    setLoading(true)
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, priority, dueDate: dueDate || null, businessId: businessId || null }),
    })
    const task = await res.json()
    onAdd(task)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass-card p-6 w-full max-w-md animate-slide-up"
        style={{ borderColor: 'rgba(225,29,72,0.3)', boxShadow: '0 0 40px rgba(225,29,72,0.1)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-white">New task</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Task title *</label>
            <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              className="input-dark w-full text-sm" placeholder="e.g. Build homepage for Brush House Painting" />
          </div>
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={3} className="input-dark w-full text-sm resize-none"
              placeholder="Add details..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="input-dark w-full text-sm">
                {Object.keys(PRIORITY_CONFIG).map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Due date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="input-dark w-full text-sm" />
            </div>
          </div>
          {businesses.length > 0 && (
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Linked client</label>
              <select value={businessId} onChange={e => setBusinessId(e.target.value)} className="input-dark w-full text-sm">
                <option value="">No client</option>
                {businesses.map(b => <option key={b.id} value={b.id}>{b.companyName}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1 text-sm">Cancel</button>
          <button onClick={submit} disabled={!title.trim() || loading} className="btn-crimson flex-1 text-sm flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Create task
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/tasks').then(r => r.json()),
      fetch('/api/businesses?sort=name').then(r => r.json()),
    ]).then(([td, bd]) => {
      setTasks(td.tasks || [])
      setBusinesses(bd.businesses || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const moveTask = async (id: string, status: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
  }

  const addTask = (task: Task) => setTasks(prev => [task, ...prev])

  const tasksByCol = (colId: string) => tasks.filter(t => t.status === colId)
  const total = tasks.length
  const completed = tasks.filter(t => t.status === 'Completed').length

  return (
    <AppShell>
      <div className="p-6 space-y-5 animate-fade-in h-full">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white">Tasks</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {total} tasks · {completed} completed
            </p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-crimson flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> New task
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 text-crimson-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pb-6">
            {COLUMNS.map(col => {
              const colTasks = tasksByCol(col.id)
              return (
                <div key={col.id} className="flex flex-col min-h-64">
                  {/* Column header */}
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <col.icon className="w-3.5 h-3.5" style={{ color: col.color }} />
                    <span className="text-xs font-semibold" style={{ color: col.color }}>{col.label}</span>
                    <span className="text-xs ml-auto px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Column body */}
                  <div className="flex-1 rounded-xl p-2 min-h-32"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {colTasks.length === 0 ? (
                      <div className="flex items-center justify-center h-24 text-xs"
                        style={{ color: 'rgba(255,255,255,0.2)' }}>
                        No tasks
                      </div>
                    ) : colTasks.map(task => (
                      <div key={task.id} className="relative">
                        <TaskCard task={task} onMove={moveTask} onDelete={deleteTask} />
                      </div>
                    ))}

                    {/* Quick add */}
                    <button onClick={() => setShowModal(true)}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-colors mt-1"
                      style={{ color: 'rgba(255,255,255,0.25)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.25)' }}>
                      <Plus className="w-3.5 h-3.5" /> Add task
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {tasks.length === 0 && !loading && (
          <div className="text-center py-16">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.15)' }} />
            <p className="text-sm font-medium text-white mb-1">No tasks yet</p>
            <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Create tasks to track your work on client websites
            </p>
            <button onClick={() => setShowModal(true)} className="btn-crimson text-sm">
              Create your first task
            </button>
          </div>
        )}
      </div>

      {showModal && <AddTaskModal onAdd={addTask} onClose={() => setShowModal(false)} businesses={businesses} />}
    </AppShell>
  )
}
