import { useEffect, useRef, useState } from 'react'

export default function AudioPlayer({ state, setState }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    let mounted = true
    async function fetchState() {
      try {
        const res = await fetch('http://localhost:3001/api/state')
        const json = await res.json()
        if (json.ok && mounted) {
          setState(json.state) // props üzerinden güncelle
        }
      } catch (e) { console.error(e) }
    }
    fetchState()
    const iv = setInterval(fetchState, 5000)
    return () => { mounted = false; clearInterval(iv) }
  }, [setState])

  
  useEffect(() => {
  if (playing && state.tracks[currentIndex]?.url) {
    audioRef.current.play().catch(() => {});
  }
}, [currentIndex, state.tracks, playing]);

  useEffect(() => {
    if (state.live) {
      if (audioRef.current) {
        audioRef.current.pause()
        setPlaying(false)
      }
    } else {
      if (state.tracks.length > 0 && !playing) {
        setCurrentIndex(0)
        setTimeout(() => {
          audioRef.current?.play().catch(() => {})
          setPlaying(true)
        }, 100)
      }
    }
  }, [state.live, state.tracks, playing])

  useEffect(() => {
    if (!state.live && state.tracks.length > 0 && !playing) {
      setCurrentIndex(0)
      setTimeout(() => {
        audioRef.current?.play().catch(()=>{})
        setPlaying(true)
      }, 100)
    }
  }, [state.tracks, state.live, playing])

  function onEnded() {
    if (!state.tracks || state.tracks.length === 0) return
    setCurrentIndex((i) => (i + 1) % state.tracks.length)
  }

  function togglePlay() {
    if (state.live) return
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play().catch(() => {})
      setPlaying(true)
    }
  }

  function stopPlayer() {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setPlaying(false)
    }
  }

  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-indigo-200">Player</h2>
          <p className="text-sm text-gray-300">
            {state.live ? 'LIVE yayın (admin tarafından başlatıldı)' : 'Çalan: ' + (state.tracks[state.tracks.length > 0 ? currentIndex : 0]?.title || '—')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={togglePlay} className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500">
            {state.live ? 'Live' : (playing ? 'Pause' : 'Play')}
          </button>
          <button onClick={stopPlayer} className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600">Stop</button>
        </div>
      </div>

      <div>
        {state.live && state.casterUrl ? (
          <div className="rounded overflow-hidden">
            <iframe src={state.casterUrl} title="Caster.fm embed" width="100%" height="120" className="border-0 rounded" />
          </div>
        ) : (
          <div>
            <audio
    ref={audioRef}
    controls
    onEnded={onEnded}
    className="w-full rounded"
    src={state.tracks[currentIndex]?.url || null} // <-- buraya ekledik
  />
            <div className="flex gap-2 mt-3 flex-wrap">
              {state.tracks.map((t, idx) => (
                <button key={t.id} onClick={() => { setCurrentIndex(idx); setPlaying(true); setTimeout(()=>audioRef.current?.play().catch(()=>{}),100) }} className="px-3 py-1 bg-gray-700 rounded text-sm">
                  {t.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
