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
    <div>
      <h2>🎵 Canlı Yayın</h2>
      {casterUrl ? (
        <iframe
          title="Caster.fm Player"
          src={casterUrl}
          width="400"
          height="100"
          style={{ border: 'none' }}
        ></iframe>
      ) : (
        <p>Şu an canlı yayın yok.</p>
      )}

      <h3>Hazır Radyolar</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
        {presetRadios.map((radio) => (
          <button
            key={radio.name}
            onClick={() => setSelectedRadio(radio.url)}
            style={{ padding: '0.5rem 1rem', borderRadius: '5px' }}
          >
            {radio.name}
          </button>
        ))}
      </div>

      {selectedRadio && (
        <div style={{ marginTop: '1rem' }}>
          <audio controls autoPlay src={selectedRadio}>
            Tarayıcınız audio elementini desteklemiyor.
          </audio>
        </div>
      )}
    </div>
  )
}
