'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name, email, password })
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return }
    await signIn('credentials', { email, password, redirect: false })
    router.push('/dashboard')
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#030303', padding:16 }}>
      <div style={{ width:'100%', maxWidth:380 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:22, fontWeight:700, color:'white' }}>SK Freelancing</div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginTop:4 }}>Create your account</div>
        </div>
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:28 }}>
          {error && <div style={{ marginBottom:16, padding:'10px 14px', borderRadius:8, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5', fontSize:13 }}>{error}</div>}
          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {[
              { label:'Full name', value:name, setter:setName, type:'text' },
              { label:'Email', value:email, setter:setEmail, type:'email' },
              { label:'Password', value:password, setter:setPassword, type:'password' },
            ].map(f => (
              <div key={f.label}>
                <label style={{ display:'block', fontSize:12, color:'rgba(255,255,255,0.5)', marginBottom:6 }}>{f.label}</label>
                <input type={f.type} value={f.value} onChange={e => f.setter(e.target.value)} required
                  style={{ width:'100%', padding:'10px 14px', borderRadius:8, fontSize:14, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white', outline:'none', boxSizing:'border-box' }} />
              </div>
            ))}
            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:11, borderRadius:8, fontSize:14, fontWeight:600, background:'linear-gradient(135deg,#e11d48,#9f1239)', color:'white', border:'none', cursor:'pointer', marginTop:4 }}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
        <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'rgba(255,255,255,0.4)' }}>
          Already have an account? <Link href="/login" style={{ color:'#fb7185', textDecoration:'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
