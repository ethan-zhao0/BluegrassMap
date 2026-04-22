import RangeSlider from './RangeSlider'

function sliderBg(val, min, max) {
  const pct = ((val - min) / (max - min) * 100).toFixed(1)
  return `linear-gradient(to right, #8acc50 0%, #8acc50 ${pct}%, #2a4a1a ${pct}%, #2a4a1a 100%)`
}

export default function RightPanel({
  visiblePlants,
  selectedState,
  threshold, setThreshold,
  yearRange, setYearRange,
  yearMin, yearMax,
  includeNoYear, setIncludeNoYear,
  onPlantClick, selectedPlant,
  enabledPlants, onTogglePlant, onEnableAll, onDisableAll
}) {
  return (
    <div className="panel">

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

      <div className="panel-section" style={{ padding: '8px 16px' }}>
        <div className="panel-label" style={{ marginBottom: 6 }}>
          {selectedState
            ? `Plants in ${selectedState} (${visiblePlants.length})`
            : `All plants (${visiblePlants.length})`}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="toggle-btn toggle-btn--on" onClick={onEnableAll}>Enable all</button>
          <button className="toggle-btn toggle-btn--off" onClick={onDisableAll}>Disable all</button>
        </div>
      </div>

      <div className="plant-scroll">
        {visiblePlants.length === 0 && (
          <div className="empty-msg">No plants match current filters</div>
        )}
        {visiblePlants.map((p, i) => {
          const key        = p.plant_scientific || p.plant_common
          const isSelected = selectedPlant?.plant_scientific === p.plant_scientific
          const isEnabled  = enabledPlants.has(key)
          return (
            <div
              key={i}
              className={`plant-card ${isSelected ? 'plant-card--selected' : ''} ${!isEnabled ? 'plant-card--disabled' : ''}`}
              onClick={() => onPlantClick(isSelected ? null : p)}
            >
              <div
                className="plant-toggle"
                onClick={e => { e.stopPropagation(); onTogglePlant(key) }}
              >
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={() => {}}
                  style={{ cursor: 'pointer', width: 16, height: 16, accentColor: '#8acc50' }}
                />
              </div>

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
                  {p.growth_habit && <span className="badge badge--habit">{p.growth_habit}</span>}
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