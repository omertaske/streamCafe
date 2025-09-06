import { useEffect, useRef, useState } from 'react'

export default function AudioPlayer({ state, setState }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)
  const [manualPause, setManualPause] = useState(false)

  useEffect(() => {
    let mounted = true
    async function fetchState() {
      try {
        const res = await fetch('http://localhost:3001/api/state')
        const json = await res.json()
        if (json.ok && mounted) setState(json.state)
      } catch (e) { console.error(e) }
    }
    fetchState()
    const iv = setInterval(fetchState, 5000)
    return () => { mounted = false; clearInterval(iv) }
  }, [setState])

  useEffect(() => {
    if (!state.live && state.tracks.length > 0) {
      const url = `http://localhost:3001${state.tracks[currentIndex]?.url}`
      if (audioRef.current && audioRef.current.src !== url) {
        audioRef.current.src = url
        if (!manualPause) {
          audioRef.current.play().then(() => setPlaying(true)).catch(() => {})
        }
      }
    }
  }, [currentIndex, state.tracks, state.live, manualPause])

  function onEnded() {
    if (state.tracks.length === 0) return
    setCurrentIndex((i) => (i + 1) % state.tracks.length)
  }

  function togglePlay() {
    if (state.live || !audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
      setManualPause(true)
    } else {
      audioRef.current.play().then(() => {
        setPlaying(true)
        setManualPause(false)
      }).catch(() => {})
    }
  }

  function stopPlayer() {
    if (!audioRef.current) return
    audioRef.current.pause()
    audioRef.current.currentTime = 0
    setPlaying(false)
    setManualPause(true)
  }

  return (
    <div className="bg-gray-800 p-6 rounded-3xl shadow-2xl border border-indigo-600">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-semibold text-indigo-200">Player</h2>
          <p className="text-gray-300 mt-1">
            {state.live ? 'LIVE yayın (admin tarafından başlatıldı)' : 'Çalan: ' + (state.tracks[currentIndex]?.title || '—')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-400 hover:from-indigo-500 hover:to-indigo-300 text-white font-semibold transition-all"
          >
            {state.live ? 'Live' : (playing ? 'Pause' : 'Play')}
          </button>
          <button
            onClick={stopPlayer}
            className="px-4 py-2 rounded-2xl bg-gray-700 hover:bg-gray-600 text-white transition-all"
          >
            Stop
          </button>
        </div>
      </div>

      <div>
        {state.live && state.casterUrl ? (
          <div className="rounded-xl overflow-hidden">
            <iframe src={state.casterUrl} title="Caster.fm embed" width="100%" height="140" className="border-0 rounded-xl" />
          </div>
        ) : (
          <div>
            <audio
              ref={audioRef}
              controls
              onEnded={onEnded}
              className="w-full rounded-xl shadow-inner"
            />
            <div className="flex gap-2 mt-4 flex-wrap">
              {state.tracks.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => { setCurrentIndex(idx); setManualPause(false) }}
                  className="px-3 py-1 rounded-2xl bg-gray-700 text-sm hover:bg-indigo-600 transition-all"
                >
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
