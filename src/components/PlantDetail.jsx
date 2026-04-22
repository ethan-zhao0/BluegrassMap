import { useState, useEffect } from 'react'
import SpotifyPlayer from './SpotifyEmbed'

export default function PlantDetail({ api, plant, onClose }) {
  const [spotifyTrackIds, setSpotifyTrackIds] = useState({})
  const [loadingSpotify, setLoadingSpotify] = useState(false)

  if (!plant) return null

  const searchSpotifyTrack = async (title, artist) => {
    console.log(title + " " + artist);
    let rawResults = await api.search(title + " " + artist, ["track"], undefined, 10, 0);
    let tracks = rawResults.tracks.items;
    return tracks[0].id;
  }


  const songs = plant.songs || [{
    title: plant.song_title,
    artist: plant.artist,
    year: plant.year,
    fragment: plant.lyric_fragment || ''
  }]

  // Search for Spotify tracks when component mounts
  useEffect(() => {
    const searchAllTracks = async () => {
      setLoadingSpotify(true)
      const trackIds = {}

      for (let i = 0; i < songs.length; i++) {
        const song = songs[i]
        const trackId = await searchSpotifyTrack(song.title, song.artist)
        if (trackId) {
          trackIds[i] = trackId
        }
      }

      setSpotifyTrackIds(trackIds)
      setLoadingSpotify(false)
    }

    searchAllTracks()
  }, [songs])

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={e => e.stopPropagation()}>

        <button className="detail-close" onClick={onClose}>✕</button>

        {/* image */}
        {plant.images?.[0]?.url && (
          <div className="detail-image-wrap">
            <img
              src={plant.images[0].url}
              alt={plant.plant_common}
              className="detail-image"
              onError={e => { e.target.style.display = 'none' }}
            />
            {plant.images[0].credit && (
              <div className="detail-image-credit">Photo: {plant.images[0].credit}</div>
            )}
          </div>
        )}

        {/* header */}
        <div className="detail-header">
          <div className="detail-common">{plant.plant_common}</div>
          <div className="detail-sci">{plant.plant_scientific}</div>
          <div className="detail-badges">
            {plant.growth_habit && (
              <span className="badge badge--habit">{plant.growth_habit}</span>
            )}
            {plant.native_status && (
              <span className={`badge badge--${plant.native_status === 'Native' ? 'native' : 'introduced'}`}>
                {plant.native_status}
              </span>
            )}
            {plant.family && (
              <span className="badge badge--family">{plant.family}</span>
            )}
          </div>
        </div>

        {/* vernacular names */}
        {plant.vernacular_names?.length > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">Also known as</div>
            <div className="detail-vernacular">
              {[...new Set(plant.vernacular_names)].join(', ')}
            </div>
          </div>
        )}

        {/* songs */}
        <div className="detail-section">
          <div className="detail-section-title">
            Mentioned in {songs.length} song{songs.length !== 1 ? 's' : ''}
          </div>
          <div className="detail-songs">
            {songs.map((s, i) => (
              <div key={i} className="detail-song-row" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div className="detail-song-title" >
                    "{s.title}"
                    {s.year && <span className="detail-song-year"> · {s.year}</span>}
                  </div>
                  {s.artist && <div className="detail-song-artist">{s.artist}</div>}
                  {s.fragment && (
                    <div className="detail-lyric-fragment">"{s.fragment}"</div>
                  )}
                </div>
                <SpotifyPlayer trackId={spotifyTrackIds[i]} />
              </div>
            ))}
          </div>
        </div>

        {/* occurrence info */}
        {plant.occurrence_coords?.length > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">Distribution</div>
            <div className="detail-vernacular">
              {plant.occurrence_coords.length} recorded observations shown on map
            </div>
          </div>
        )}

        {/* state counts */}
        {plant.states && Object.keys(plant.states).length > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">Top states by occurrence</div>
            <div className="detail-states">
              {Object.entries(plant.states)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([state, count]) => (
                  <div key={state} className="detail-state-row">
                    <span className="detail-state-name">{state}</span>
                    <span className="detail-state-count">{count.toLocaleString()}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}