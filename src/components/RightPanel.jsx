import RangeSlider from './RangeSlider'

function sliderBg(val, min, max) {
  const pct = ((val - min) / (max - min) * 100).toFixed(1)
  return `linear-gradient(to right, #8acc50 0%, #8acc50 ${pct}%, #2a4a1a ${pct}%, #2a4a1a 100%)`
}

export default function RightPanel({
  entries, selectedState,
  threshold, setThreshold,
  yearRange, setYearRange,
  yearMin, yearMax,
  includeNoYear, setIncludeNoYear,
  onPlantClick, selectedPlant
}) {
  const grouped = {}
  entries.forEach(e => {
    const key = e.plant_scientific || e.plant_common
    if (!grouped[key]) grouped[key] = { ...e, songs: [] }
    grouped[key].songs.push({
      title:    e.song_title,
      artist:   e.artist,
      year:     e.year,
      fragment: e.lyric_fragment || ''
    })
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
          min="1" max="43"
          value={threshold}
          onChange={e => setThreshold(Number(e.target.value))}
          style={{ width: '100%', background: sliderBg(threshold, 1, 43) }}
          className="range-input"
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
        <div className="year-ends">
          <span>{yearMin}</span>
          <span>{yearMax}</span>
        </div>
        <label className="no-year-toggle">
          <input
            type="checkbox"
            checked={includeNoYear}
            onChange={e => setIncludeNoYear(e.target.checked)}
          />
          <span>include songs without year data</span>
        </label>
      </div>

      {/* plant count label */}
      <div className="panel-label" style={{ padding: '10px 16px 6px' }}>
        {selectedState
          ? `Plants in ${selectedState} (${plants.length})`
          : `All plants (${plants.length})`}
      </div>

      {/* plant list */}
      <div className="plant-scroll">
        {plants.length === 0 && (
          <div className="empty-msg">No plants match current filters</div>
        )}
        {plants.map((p, i) => {
          const isSelected = selectedPlant?.plant_scientific === p.plant_scientific
          return (
            <div
              key={i}
              className={`plant-card ${isSelected ? 'plant-card--selected' : ''}`}
              onClick={() => onPlantClick(isSelected ? null : p)}
            >
              {p.images?.[0]?.url && (
                <div className="plant-thumb-wrap">
                  <img
                    src={p.images[0].url}
                    alt={p.plant_common}
                    className="plant-thumb"
                    onError={e => { e.target.style.display = 'none' }}
                  />
                </div>
              )}
              <div className="plant-card-body">
                <div className="plant-name">{p.plant_common}</div>
                <div className="plant-sci">{p.plant_scientific}</div>
                <div className="plant-meta-row">
                  {p.growth_habit && (
                    <span className="badge badge--habit">{p.growth_habit}</span>
                  )}
                  {p.native_status && (
                    <span className={`badge badge--${p.native_status === 'Native' ? 'native' : 'introduced'}`}>
                      {p.native_status}
                    </span>
                  )}
                </div>
                <div className="plant-songs-count">
                  {p.songs.length} song{p.songs.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}