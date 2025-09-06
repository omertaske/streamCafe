import { useEffect, useState } from 'react'

export default function AdminPanel({ onStateChange = () => {} }) {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null)
  const [password, setPassword] = useState('')
  const [state, setState] = useState({ live: false, casterUrl: '', tracks: [] })
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')

  useEffect(() => {
    fetchState()
    // listen server updates via polling
    const iv = setInterval(fetchState, 5000)
    return () => clearInterval(iv)
    // eslint-disable-next-line
  }, [])

  async function fetchState() {
    try {
      const r = await fetch('/api/state')
      const j = await r.json()
      if (j.ok) {
        setState(j.state)
        onStateChange(j.state)
      }
    } catch (e) { console.error(e) }
  }

 async function adminLogin(password) {
  try {
    const res = await fetch('http://localhost:3001/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
    const data = await res.json()
    console.log('Login response:', data)
    if (data.ok) {
      alert('Giriş başarılı! Token: ' + data.token)
      return data.token
    } else {
      alert('Giriş başarısız: ' + data.message)
      return null
    }
  } catch (e) {
    console.error('Login fetch error:', e)
  }
}


  async function setLive(liveVal) {
    if (!token) return alert('login required')
    const r = await fetch('/api/admin/set-live', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-admin-token': token },
      body: JSON.stringify({ live: liveVal, casterUrl: state.casterUrl || '' })
    })
    const j = await r.json()
    if (j.ok) { setState(j.state); onStateChange(j.state) } else alert('failed')
  }

  async function upload() {
    if (!token) return alert('login required')
    if (!file) return alert('choose file')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('title', title || file.name)
    const r = await fetch('/api/admin/upload', { method: 'POST', headers: { 'x-admin-token': token }, body: fd })
    const j = await r.json()
    if (j.ok) { setFile(null); setTitle(''); fetchState() } else alert('upload failed')
  }

  async function removeTrack(id) {
    if (!token) return alert('login required')
    const r = await fetch('/api/admin/remove', { method: 'POST', headers: { 'Content-Type':'application/json', 'x-admin-token': token }, body: JSON.stringify({ id }) })
    const j = await r.json()
    if (j.ok) fetchState()
  }

  async function setCasterUrlUrl() {
    if (!token) return alert('login required')
    const url = prompt('Caster.fm embed URL (ör: https://caster.fm/embed/XXX) veya iframe URL')
    if (!url) return
    const r = await fetch('/api/admin/set-live', { method: 'POST', headers: { 'Content-Type':'application/json', 'x-admin-token': token }, body: JSON.stringify({ live: state.live, casterUrl: url }) })
    const j = await r.json()
    if (j.ok) setState(j.state)
  }

  return (
    <div className="bg-gray-800 p-6 rounded-xl">
      {!token ? (
        <div className="flex gap-2 items-center">
          <input type="password" placeholder="admin password" value={password} onChange={(e)=>setPassword(e.target.value)} className="px-3 py-2 rounded w-64 text-black"/>
          <button onClick={() => adminLogin(password).then(t => { if(t){ setToken(t); localStorage.setItem('adminToken', t) }}) } className="px-4 py-2 rounded bg-indigo-600">Login</button>
        </div>
      ) : (
        <>
          <div className="flex gap-3 items-center mb-4">
            <div>
              <p className="text-sm text-gray-300">Live durum: <b className="text-indigo-300">{state.live ? 'Açık' : 'Kapalı'}</b></p>
            </div>
            <button onClick={()=>setLive(!state.live)} className="px-3 py-2 rounded bg-indigo-600">{state.live ? 'Kapat' : 'Aç'}</button>
            <button onClick={setCasterUrlUrl} className="px-3 py-2 rounded bg-gray-700">Set Caster URL</button>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Upload track</h3>
            <input type="file" onChange={(e)=>setFile(e.target.files?.[0] || null)} className="mb-2"/>
            <input type="text" placeholder="Title (optional)" value={title} onChange={(e)=>setTitle(e.target.value)} className="px-3 py-2 rounded w-full mb-2 text-black"/>
            <button onClick={upload} className="px-4 py-2 rounded bg-indigo-600">Upload</button>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Tracks</h3>
            <div className="space-y-2">
              {state.tracks.map(t => (
                <div key={t.id} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                  <div>
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-gray-300">{new Date(t.uploadedAt).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <a className="px-2 py-1 bg-gray-600 rounded" href={t.url} target="_blank" rel="noreferrer">Open</a>
                    <button onClick={()=>removeTrack(t.id)} className="px-2 py-1 bg-red-600 rounded">Remove</button>
                  </div>
                </div>
              ))}
              {state.tracks.length === 0 && <div className="text-sm text-gray-400">No tracks yet</div>}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
