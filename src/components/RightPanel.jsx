import RangeSlider from './RangeSlider'

export default function RightPanel({
  entries, selectedState,
  threshold, setThreshold,
  yearRange, setYearRange,
  yearMin, yearMax
}) {
  // group entries by plant
  const grouped = {}
  entries.forEach(e => {
    const key = e.plant_scientific || e.plant_common
    if (!grouped[key]) grouped[key] = { ...e, songs: [] }
    grouped[key].songs.push({ title: e.song_title, artist: e.artist, year: e.year })
  })
  const plants = Object.values(grouped)

  return (
    <div className="panel">

{/* threshold slider */}
<div className="panel-section">
  <div className="panel-label">
    Min. plants per state — <span style={{ color: '#c8e870' }}>{threshold} species</span>
  </div>
  <input
    type="range"
    min="1" max="30"
    value={threshold}
    onChange={e => setThreshold(Number(e.target.value))}
    className="single-slider"
    style={{ background: sliderBg(threshold, 1, 30) }}
  />
</div>

{/* year range slider */}
<div className="panel-section">
  <div className="panel-label">
    Year range — <span style={{ color: '#c8e870' }}>{yearRange[0]} – {yearRange[1]}</span>
  </div>
  <RangeSlider
    min={yearMin} max={yearMax}
    value={yearRange}
    onChange={setYearRange}
  />
</div>

      {/* plant list */}
      <div className="panel-label" style={{ padding: '10px 16px 6px' }}>
        {selectedState
          ? `Plants in ${selectedState} (${plants.length})`
          : `All plants (${plants.length})`}
      </div>

      <div className="plant-scroll">
        {plants.length === 0 && (
          <div className="empty-msg">No data yet — add your JSON to App.jsx</div>
        )}
        {plants.map((p, i) => (
          <div key={i} className="plant-card">
            <div className="plant-name">{p.plant_common}</div>
            <div className="plant-sci">{p.plant_scientific}</div>
            <div className="song-list">
              {p.songs.map((s, j) => (
                <div key={j} className="song-row">
                  <span className="song-title">"{s.title}"</span>
                  <span className="song-meta">{s.artist} · {s.year}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

function sliderBg(val, min, max) {
  const pct = ((val - min) / (max - min) * 100).toFixed(1)
  return `linear-gradient(to right, #8acc50 0%, #8acc50 ${pct}%, #2a4a1a ${pct}%, #2a4a1a 100%)`
}