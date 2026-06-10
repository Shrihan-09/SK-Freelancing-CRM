'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.error) setError('Invalid email or password')
    else router.push('/dashboard')
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#030303', padding:16 }}>
      <div style={{ width:'100%', maxWidth:380 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:22, fontWeight:700, color:'white' }}>SK Freelancing</div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginTop:4 }}>Sign in to your account</div>
        </div>
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:28 }}>
          {error && <div style={{ marginBottom:16, padding:'10px 14px', borderRadius:8, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5', fontSize:13 }}>{error}</div>}
          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ display:'block', fontSize:12, color:'rgba(255,255,255,0.5)', marginBottom:6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ width:'100%', padding:'10px 14px', borderRadius:8, fontSize:14, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white', outline:'none', boxSizing:'border-box' }} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, color:'rgba(255,255,255,0.5)', marginBottom:6 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                style={{ width:'100%', padding:'10px 14px', borderRadius:8, fontSize:14, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white', outline:'none', boxSizing:'border-box' }} />
            </div>
            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:11, borderRadius:8, fontSize:14, fontWeight:600, background:'linear-gradient(135deg,#e11d48,#9f1239)', color:'white', border:'none', cursor:'pointer', marginTop:4 }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
        <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'rgba(255,255,255,0.4)' }}>
          No account? <Link href="/signup" style={{ color:'#fb7185', textDecoration:'none' }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}
