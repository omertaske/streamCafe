import { useEffect, useState } from 'react'

export default function AdminPanel({ onStateChange = () => {} }) {
  const [token, setToken] = useState(null) // artık localStorage yok, her zaman giriş ister
  const [password, setPassword] = useState('')
  const [state, setState] = useState({ live: false, casterUrl: '', tracks: [] })
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')

  useEffect(() => {
    fetchState()
    const iv = setInterval(fetchState, 5000)
    return () => clearInterval(iv)
    // eslint-disable-next-line
  }, [])

  async function fetchState() {
    try {
      const r = await fetch('https://streamcafe.onrender.com/api/state')
      const j = await r.json()
      if (j.ok) {
        setState(j.state)
        onStateChange(j.state)
      }
    } catch (e) { console.error(e) }
  }

  async function adminLogin(password) {
    try {
      const res = await fetch('https://streamcafe.onrender.com/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await res.json()
      if (data.ok) {
        alert('Giriş başarılı!')
        return data.token
      } else {
        alert('Giriş başarısız: ' + data.message)
        return null
      }
    } catch (e) { console.error(e) }
  }

  async function setLive(liveVal) {
    if (!token) return alert('Login required')
    const r = await fetch('https://streamcafe.onrender.com/api/admin/set-live', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-admin-token': token },
      body: JSON.stringify({ live: liveVal, casterUrl: state.casterUrl || '' })
    })
    const j = await r.json()
    if (j.ok) { setState(j.state); onStateChange(j.state) } else alert('Failed')
  }

  async function upload() {
    if (!token) return alert('Login required')
    if (!file) return alert('Choose file')

    const fd = new FormData()
    fd.append('file', file)
    fd.append('title', title || file.name)

    try {
      const r = await fetch('https://streamcafe.onrender.com/api/admin/upload', {
        method: 'POST',
        headers: { 'x-admin-token': token },
        body: fd
      })
      const j = await r.json()
      if (j.ok) {
        setFile(null)
        setTitle('')
        fetchState()
        alert('Upload successful!')
      } else alert('Upload failed: ' + j.message)
    } catch (e) { console.error(e); alert('Upload error') }
  }

  async function removeTrack(id) {
    if (!token) return alert('Login required')
    const r = await fetch('/api/admin/remove', { method: 'POST', headers: { 'Content-Type':'application/json', 'x-admin-token': token }, body: JSON.stringify({ id }) })
    const j = await r.json()
    if (j.ok) fetchState()
  }

  async function setCasterUrlUrl() {
    if (!token) return alert('Login required')
    const url = prompt('Caster.fm embed URL veya iframe URL')
    if (!url) return
    const r = await fetch('https://streamcafe.onrender.com/api/admin/set-live', { method: 'POST', headers: { 'Content-Type':'application/json', 'x-admin-token': token }, body: JSON.stringify({ live: state.live, casterUrl: url }) })
    const j = await r.json()
    if (j.ok) setState(j.state)
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 rounded-3xl shadow-2xl border border-indigo-500">
      {!token ? (
        <div className="flex flex-col items-center gap-5">
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="px-5 py-3 rounded-2xl w-72 text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md"
          />
          <button
            onClick={() => adminLogin(password).then(t => { if(t){ setToken(t) }}) }
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-400 hover:from-indigo-500 hover:to-indigo-300 text-white font-semibold shadow-lg transition-all"
          >
            Login
          </button>
        </div>
      ) : (
        <>
          {/* Live Control */}
          <div className="flex flex-col md:flex-row gap-4 items-center mb-6 justify-between">
            <p className="text-gray-300 font-medium text-lg">Live durum: <span className="text-indigo-300">{state.live ? 'Açık' : 'Kapalı'}</span></p>
            <div className="flex gap-3">
              <button onClick={()=>setLive(!state.live)} className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all">{state.live ? 'Kapat' : 'Aç'}</button>
              <button onClick={setCasterUrlUrl} className="px-4 py-2 rounded-2xl bg-gray-700 hover:bg-gray-600 text-white font-medium transition-all">Set Caster URL</button>
            </div>
          </div>

          {/* Upload Track */}
          <div className="mb-6">
            <h3 className="text-indigo-300 font-semibold mb-3 text-lg">Upload Track</h3>
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <input type="file" onChange={(e)=>setFile(e.target.files?.[0] || null)} className="rounded-2xl px-4 py-2 shadow-md text-black"/>
              <input type="text" placeholder="Title (optional)" value={title} onChange={(e)=>setTitle(e.target.value)} className="px-4 py-2 rounded-2xl text-black shadow-md flex-1"/>
              <button onClick={upload} className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-400 hover:from-indigo-500 hover:to-indigo-300 text-white font-semibold shadow-lg transition-all">Upload</button>
            </div>
          </div>

          {/* Tracks List */}
          <div>
            <h3 className="text-indigo-300 font-semibold mb-3 text-lg">Tracks</h3>
            <div className="space-y-3">
              {state.tracks.map(t => (
                <div key={t.id} className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gray-700 p-4 rounded-2xl shadow-md hover:bg-gray-600 transition-all">
                  <div>
                    <div className="font-medium text-white">{t.title}</div>
                    <div className="text-sm text-gray-300">{new Date(t.uploadedAt).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-3 mt-3 md:mt-0">
                    <a className="px-3 py-1 bg-gray-600 rounded-2xl hover:bg-indigo-600 text-white transition-all" href={t.url} target="_blank" rel="noreferrer">Open</a>
                    <button onClick={()=>removeTrack(t.id)} className="px-3 py-1 bg-red-600 rounded-2xl hover:bg-red-500 text-white transition-all">Remove</button>
                  </div>
                </div>
              ))}
              {state.tracks.length === 0 && <div className="text-gray-400 text-sm">No tracks yet</div>}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
