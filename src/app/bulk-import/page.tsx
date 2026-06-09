'use client'
import AppShell from '@/components/AppShell'
import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader2, Download } from 'lucide-react'

interface ImportResult {
  imported: number
  skipped: number
  errors: number
  businesses: Array<{ companyName: string; leadScore: number; priority: string }>
}

function parseCSV(text: string): any[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase().replace(/ /g, '_'))
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/"/g, ''))
    const obj: any = {}
    headers.forEach((h, i) => { obj[h] = vals[i] || '' })
    return obj
  })
}

const SAMPLE_CSV = `Company Name,Phone,Website,Industry,Location,Google Reviews,Family Owned,Google Rating,Years in Business,Notes
Somerville Auto Repair,(908) 555-0100,none,Auto Repair,Somerville NJ,87,Yes,4.8,15+,No online booking
Green Thumb Landscaping,(908) 555-0201,greenthumb.com,Landscaping,Hillsborough NJ,134,Yes,4.9,22+,Family owned
Maria's Italian Kitchen,(908) 555-0302,none,Restaurant,Raritan NJ,312,Yes,4.7,8+,No website at all
North Star Plumbing,(908) 555-0403,none,Plumbing,Bridgewater NJ,56,No,4.6,12+,Only on Google Maps`

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [records, setRecords] = useState<any[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [rawText, setRawText] = useState('')
  const [mode, setMode] = useState<'upload' | 'paste'>('upload')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (f: File) => {
    setFile(f)
    setResult(null)
    const text = await f.text()
    const parsed = parseCSV(text)
    setRecords(parsed)
  }

  const handlePaste = (text: string) => {
    setRawText(text)
    const parsed = parseCSV(text)
    setRecords(parsed)
  }

  const runImport = async () => {
    const data = mode === 'paste' ? parseCSV(rawText) : records
    if (!data.length) return
    setImporting(true)
    const res = await fetch('/api/bulk-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: data }),
    })
    const r = await res.json()
    setResult(r)
    setImporting(false)
  }

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'sk-freelancing-sample.csv'; a.click()
  }

  return (
    <AppShell>
      <div className="p-6 space-y-6 animate-fade-in max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Bulk Import</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Upload CSV, paste data, or import from Google Sheets export
            </p>
          </div>
          <button onClick={downloadSample} className="btn-ghost flex items-center gap-2 text-xs">
            <Download className="w-3.5 h-3.5" /> Sample CSV
          </button>
        </div>

        {/* Mode toggle */}
        <div className="glass-card p-1 flex gap-1 w-fit">
          {(['upload', 'paste'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                mode === m ? 'bg-crimson-600 text-white' : 'text-white/40 hover:text-white/70'
              }`}>
              {m === 'upload' ? '↑ Upload file' : '⌘ Paste CSV'}
            </button>
          ))}
        </div>

        {mode === 'upload' && (
          <div
            className={`glass-card p-8 text-center cursor-pointer transition-colors ${
              file ? 'border-crimson-500/30' : 'hover:border-white/15'
            }`}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
            {file ? (
              <div className="space-y-2">
                <FileText className="w-8 h-8 text-crimson-400 mx-auto" />
                <div className="text-sm font-medium text-white">{file.name}</div>
                <div className="text-xs text-white/40">{records.length} rows detected</div>
                <button onClick={e => { e.stopPropagation(); setFile(null); setRecords([]) }}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mx-auto">
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-8 h-8 mx-auto" style={{ color: 'rgba(255,255,255,0.2)' }} />
                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Drop CSV or Excel file here, or click to browse
                </div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  .csv · .xlsx · .xls · Google Sheets export
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'paste' && (
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Paste CSV data below. First row must be column headers.
            </p>
            <textarea
              value={rawText}
              onChange={e => handlePaste(e.target.value)}
              rows={8}
              className="input-dark w-full text-xs font-mono resize-y"
              placeholder={`Company Name,Phone,Website,Industry,Location,Google Reviews\nBrush House Painting,,none,Painters,Bridgewater NJ,706`}
            />
            {rawText && <p className="text-xs text-white/40">{records.length} rows parsed</p>}
          </div>
        )}

        {/* Column mapping preview */}
        {records.length > 0 && (
          <div className="glass-card p-4 space-y-3">
            <h3 className="text-sm font-medium text-white">Preview ({records.length} records)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    {Object.keys(records[0]).slice(0, 8).map(k => (
                      <th key={k} className="text-left px-3 py-2 text-white/40 font-medium capitalize whitespace-nowrap">
                        {k.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 5).map((r, i) => (
                    <tr key={i} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      {Object.values(r).slice(0, 8).map((v: any, j) => (
                        <td key={j} className="px-3 py-2 text-white/60 max-w-24 truncate">{v || '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {records.length > 5 && (
                <p className="text-xs text-white/30 px-3 py-2">+{records.length - 5} more rows</p>
              )}
            </div>
          </div>
        )}

        {/* Import button */}
        {(records.length > 0 || (mode === 'paste' && rawText)) && !result && (
          <button onClick={runImport} disabled={importing} className="btn-crimson flex items-center gap-2 w-full justify-center py-3">
            {importing
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing & scoring...</>
              : <><Upload className="w-4 h-4" /> Import {records.length} leads</>}
          </button>
        )}

        {/* Results */}
        {result && (
          <div className="glass-card p-5 space-y-4 animate-slide-up" style={{ borderColor: 'rgba(34,197,94,0.2)' }}>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-medium text-white">Import complete</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Imported', val: result.imported, color: 'text-emerald-400' },
                { label: 'Skipped (dupes)', val: result.skipped, color: 'text-amber-400' },
                { label: 'Errors', val: result.errors, color: 'text-red-400' },
              ].map(s => (
                <div key={s.label} className="glass-card p-3 text-center">
                  <div className={`text-xl font-semibold ${s.color}`}>{s.val}</div>
                  <div className="text-xs text-white/40 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            {result.businesses.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-white/40">Top scored leads from this import:</p>
                {result.businesses.sort((a, b) => b.leadScore - a.leadScore).slice(0, 5).map(b => (
                  <div key={b.companyName} className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="text-xs text-white/70">{b.companyName}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded border ${
                        b.priority === 'High' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        b.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>{b.priority}</span>
                      <span className="text-xs font-semibold text-white">{b.leadScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => { setResult(null); setFile(null); setRecords([]); setRawText('') }}
              className="btn-ghost w-full text-sm">Import more leads</button>
          </div>
        )}

        {/* Format guide */}
        <div className="glass-card p-5 space-y-3">
          <h3 className="text-sm font-medium text-white">Supported column names</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              ['company_name', 'Company Name', 'name'],
              ['phone', 'Phone'],
              ['website', 'Website'],
              ['industry', 'category', 'Category'],
              ['location', 'Location'],
              ['reviews', 'Google Reviews', 'review_count'],
              ['family_owned', 'Family Owned'],
              ['rating', 'Google Rating'],
              ['years', 'Years in Business'],
              ['notes', 'Notes'],
            ].map((group, i) => (
              <div key={i} className="text-xs rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                {group.map((name, j) => (
                  <span key={name}>
                    <code className="text-crimson-400">{name}</code>
                    {j < group.length - 1 && <span className="text-white/20"> · </span>}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <p className="text-xs text-white/30">Columns are auto-detected. Unknown columns are ignored. Duplicates are skipped automatically.</p>
        </div>
      </div>
    </AppShell>
  )
}
