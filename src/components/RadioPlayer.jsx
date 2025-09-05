import { useState } from 'react'

const presetRadios = [
  { name: 'Kral FM', url: 'https://listen.radyotvonline.com/kralfm/;stream/1' },
  { name: 'PowerTürk', url: 'https://powerapp.powerapp.com.tr:8000/powerturk.mp3' },
  { name: 'Joy FM', url: 'https://streaming.joyfm.com.tr/joyfm.mp3' },
  { name: 'BBC Radio 1', url: 'http://bbcmedia.ic.llnwd.net/stream/bbcmedia_radio1_mf_p' },
  { name: 'NPR', url: 'https://npr-ice.streamguys1.com/live.mp3' },
  { name: 'Radio France', url: 'http://direct.franceinter.fr/live/franceinter-midfi.mp3' },
  { name: 'Radio Nova', url: 'http://cdn.nrjaudio.fm/adwz1/fr/30201/mp3_128.mp3' },
  { name: 'Capital FM', url: 'http://media-ice.musicradio.com:80/CapitalMP3' },
  { name: 'Classic FM', url: 'http://media-ice.musicradio.com/ClassicFMMP3' },
  { name: 'Radio X', url: 'http://media-ice.musicradio.com:80/RadioXMP3' },
]

export default function RadioPlayer({ casterUrl }) {
  const [selectedRadio, setSelectedRadio] = useState(null)

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-indigo-300">🎵 Canlı Yayın</h2>
      {casterUrl ? (
        <iframe
          title="Caster.fm Player"
          src={casterUrl}
          width="100%"
          height="120"
          className="rounded-lg border-0"
        ></iframe>
      ) : (
        <p className="text-gray-400">Şu an canlı yayın yok.</p>
      )}

      <h3 className="text-xl font-semibold mt-6 mb-3 text-indigo-200">Hazır Radyolar</h3>
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

      {selectedRadio && (
        <div className="mt-4">
          <audio controls autoPlay src={selectedRadio} className="w-full rounded-lg">
            Tarayıcınız audio elementini desteklemiyor.
          </audio>
        </div>
      )}
    </div>
  )
}
