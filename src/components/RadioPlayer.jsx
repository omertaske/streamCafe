import { useState } from 'react'

const presetRadios = [
  { name: 'Kral POP', url: 'http://46.20.3.201:80/stream/1/' },
  { name: 'Kral FM', url: 'http://46.20.3.204:80/stream/1/' },
  { name: 'PowerTürk', url: 'https://listen.powerapp.com.tr/powerturk/abr/playlist.m3u8' },
  { name: 'Joy FM', url: 'https://radyo.duhnet.tv/joyturkaac' },
  { name: 'BBC Radio 1', url: 'http://stream.live.vc.bbcmedia.co.uk/bbc_radio_one' },
  { name: 'NPR', url: 'https://npr-ice.streamguys1.com/live.mp3' },
  { name: 'Radio France', url: 'http://direct.franceinter.fr/live/franceinter-midfi.mp3' },
  { name: 'Radio Nova', url: 'http://nova-live.nrjaudio.fm/nrj/nova.mp3' },
  { name: 'Capital FM (UK)', url: 'https://media-ice.musicradio.com/CapitalMP3' },
  { name: 'Classic FM (UK)', url: 'https://media-ice.musicradio.com/ClassicFMMP3' },
  { name: 'Radio X (UK)', url: 'https://media-ice.musicradio.com/RadioXMP3' },
]


export default function RadioPlayer({ casterUrl }) {
  const [selectedRadio, setSelectedRadio] = useState(null)

  const activeRadio = selectedRadio || casterUrl

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg mb-8 text-gray-100">
      <h2 className="text-2xl font-semibold mb-4 text-indigo-300">🎵 Canlı Yayın</h2>

      {activeRadio ? (
        <audio
          controls
          autoPlay
          src={activeRadio}
          className="w-full rounded-lg mb-4 bg-gray-900"
        >
          Tarayıcınız audio elementini desteklemiyor.
        </audio>
      ) : (
        <p className="text-gray-400">Şu an canlı yayın yok.</p>
      )}

    
        <>
          <h3 className="text-xl font-semibold mt-4 mb-2 text-indigo-200">Hazır Radyolar</h3>
          <div className="flex flex-wrap gap-3">
            {presetRadios.map((radio) => (
              <button
                key={radio.name}
                onClick={() => setSelectedRadio(radio.url)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                {radio.name}
              </button>
            ))}
          </div>
        </>
      
    </div>
  )
}
