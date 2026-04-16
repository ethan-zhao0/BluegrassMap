import { useState, useMemo } from 'react'
import USMap from './components/USMap'
import RightPanel from './components/RightPanel'
import PlantDetail from './components/PlantDetail'
import rawData from './data/plants.json'

const DATA_YEAR_MIN = 1962
const DATA_YEAR_MAX = 2026

export default function App() {
  const [threshold, setThreshold]           = useState(5)
  const [yearRange, setYearRange]           = useState([1970, 2000])
  const [includeNoYear, setIncludeNoYear]   = useState(true)
  const [selectedState, setSelectedState]   = useState(null)
  const [selectedPlant, setSelectedPlant]   = useState(null)

  const filteredData = useMemo(() => {
    return rawData.filter(d => {
      if (d.year === null || d.year === undefined) return includeNoYear
      return d.year >= yearRange[0] && d.year <= yearRange[1]
    })
  }, [yearRange, includeNoYear])

const stateData = useMemo(() => {
  const map = {}
  filteredData.forEach(entry => {
    Object.keys(entry.states || {}).forEach(state => {
      const occurrenceCount = entry.states[state]
      if (occurrenceCount < 15) return  // skip if fewer than 10 recorded observations
      if (!map[state]) map[state] = { count: 0, entries: [] }
      map[state].count += 1
      map[state].entries.push(entry)
    })
  })
  return map
}, [filteredData, includeNoYear])

  const panelEntries = useMemo(() => {
    if (selectedState) return stateData[selectedState]?.entries || []
    return filteredData
  }, [selectedState, stateData, filteredData])

  const occurrenceCoords = useMemo(() => {
    if (!selectedPlant) return []
    return selectedPlant.occurrence_coords || []
  }, [selectedPlant])

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
          occurrenceCoords={occurrenceCoords}
          onStateClick={name => {
            setSelectedState(prev => prev === name ? null : name)
            setSelectedPlant(null)
          }}
          onClickOutside={() => {
            setSelectedState(null)
            setSelectedPlant(null)
          }}
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
          includeNoYear={includeNoYear}
          setIncludeNoYear={setIncludeNoYear}
          onPlantClick={setSelectedPlant}
          selectedPlant={selectedPlant}
        />
      </div>

      {selectedPlant && (
        <PlantDetail
          plant={selectedPlant}
          onClose={() => setSelectedPlant(null)}
        />
      )}
    </div>
  )
}