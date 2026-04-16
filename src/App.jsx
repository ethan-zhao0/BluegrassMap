import { useState, useMemo } from 'react'
import USMap from './components/USMap'
import RightPanel from './components/RightPanel'
import rawData from './data/plants.json'

// ─── replace rawData with your real imported JSON later ───
// Expected shape of your ONE json file:
// [
//   {
//     plant_common:     "Blackberry",
//     plant_scientific: "Rubus allegheniensis",
//     song_title:       "Clinch Mountain Home",
//     artist:           "Stanley Brothers",
//     year:             1956,
//     states: {
//       "Virginia":      412,   ← GBIF occurrence count
//       "West Virginia": 893,
//       "Kentucky":      301
//       ... only states where plant is present
//     }
//   },
//   ...
// ]

const DATA_YEAR_MIN = 1970
const DATA_YEAR_MAX = 2026

export default function App() {
  const [threshold, setThreshold]         = useState(5)
  const [yearRange, setYearRange]         = useState([1970, 2026])
  const [selectedState, setSelectedState] = useState(null)

  // filter raw data by year range
  const filteredData = useMemo(() => {
    return rawData.filter(d => d.year >= yearRange[0] && d.year <= yearRange[1])
  }, [yearRange])

  // build per-state plant counts from filtered data
const stateData = useMemo(() => {
  const map = {}
  filteredData.forEach(entry => {
    Object.keys(entry.states || {}).forEach(state => {
      if (!map[state]) map[state] = { count: 0, entries: [] }
      map[state].count += 1
      map[state].entries.push(entry)
    })
  })
  return map
}, [filteredData])

  // plants to show in right panel
  const panelEntries = useMemo(() => {
    if (selectedState) {
      return stateData[selectedState]?.entries || []
    }
    return filteredData
  }, [selectedState, stateData, filteredData])

  return (
    <div className="layout">
      <div className="map-side">
        <div className="topbar">
          <h1 className="title">APPlantLACHIA</h1>
          <p className="subtitle">Plants in bluegrass lyrics</p>
        </div>

        <USMap
  stateData={stateData}
  threshold={threshold}
  selectedState={selectedState}
  onStateClick={name => setSelectedState(prev => prev === name ? null : name)}
  onClickOutside={() => setSelectedState(null)}
/>
      </div>

      <div className="right-panel">
        <RightPanel
          entries={panelEntries}
          selectedState={selectedState}
          threshold={threshold}
          setThreshold={setThreshold}
          yearRange={yearRange}
          setYearRange={setYearRange}
          yearMin={DATA_YEAR_MIN}
          yearMax={DATA_YEAR_MAX}
        />
      </div>
    </div>
  )
}