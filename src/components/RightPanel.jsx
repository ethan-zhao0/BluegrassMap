import { useEffect, useState } from 'react'
import RangeSlider from './RangeSlider'

function sliderBg(val, min, max) {
  const pct = ((val - min) / (max - min) * 100).toFixed(1)
  return `linear-gradient(to right, #8acc50 0%, #8acc50 ${pct}%, #2a4a1a ${pct}%, #2a4a1a 100%)`
}

export default function RightPanel({
  allPlants, entries, selectedState,
  threshold, setThreshold,
  yearRange, setYearRange,
  yearMin, yearMax,
  includeNoYear, setIncludeNoYear,
  onPlantClick, selectedPlant,
  enabledPlants, setEnabledPlants, onTogglePlant, onEnableAll, onDisableAll
}) {
  // Use allPlants instead of grouping entries, so disabled plants still show
  const plants = allPlants || []
  const [dateFilteredPlants, setDateFilteredPlants] = useState(plants)

  useEffect(() => {
    const filteredPlants = plants.filter(p => {
      const hasYearInRange = p.songs.some(s => s.year && s.year >= yearRange[0] && s.year <= yearRange[1])
      const hasNoYear = p.songs.some(s => !s.year)
      return hasYearInRange || (includeNoYear && hasNoYear)
    })
    setDateFilteredPlants(filteredPlants)
    setEnabledPlants(filteredPlants.reduce((set, p) => set.add(p.plant_scientific), new Set()));
  }, [plants, yearRange, includeNoYear])

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
          : `Plants in Date Range (${dateFilteredPlants.length})`}
      </div>

      {/* enable/disable all buttons */}
      <div style={{ display: 'flex', gap: '8px', padding: '8px 16px' }}>
        <button
          onClick={onEnableAll}
          style={{
            flex: 1,
            padding: '6px 12px',
            background: '#8acc50',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          Enable All
        </button>
        <button
          onClick={onDisableAll}
          style={{
            flex: 1,
            padding: '6px 12px',
            background: '#3a7a20',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          Disable All
        </button>
      </div>

      {/* plant list */}
      <div className="plant-scroll">
        {dateFilteredPlants.length === 0 && (
          <div className="empty-msg">No plants match current filters</div>
        )}
        {dateFilteredPlants.map((p, i) => {
          const isSelected = selectedPlant?.plant_scientific === p.plant_scientific
          const isEnabled = enabledPlants.has(p.plant_scientific)
          return (
            <div
              key={i}
              className={`plant-card ${isSelected ? 'plant-card--selected' : ''}`}
              style={{
                background: isSelected ? '#c8e870' : '#2a4a1a',
                gap: '12px',
                padding: '12px',
                opacity: isEnabled ? 1 : 0.5,
                cursor: isEnabled ? 'pointer' : 'pointer',
                // visibility: "hidden"
              }}
              onClick={() => {
                if (isEnabled) onPlantClick(isSelected ? null : p)
              }}
            >
              {/* Checkbox */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '2px',
                  flexShrink: 0
                }}
                onClick={e => {
                  e.stopPropagation()
                  onTogglePlant(p.plant_scientific)
                }}
              >
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={() => { }}
                  style={{
                    cursor: 'pointer',
                    width: '18px',
                    height: '18px',
                    accentColor: '#8acc50'
                  }}
                />
              </div>

              {/* Content wrapper */}
              <div style={{ display: 'flex', flexDirection: 'row', minWidth: 0, gap: 10, alignItems: 'center' }}>
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
            </div>
          )
        })}
      </div>
    </div>
  )
}