import { useState, useMemo, useEffect } from 'react'
import USMap from './components/USMap'
import RightPanel from './components/RightPanel'
import PlantDetail from './components/PlantDetail'
import rawData from './data/plants.json'

// Spotify authentication setup

import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const CLIENT_ID = "9e29c53b00154bdcaade5e8d1652891b";
const REDIRECT_URI = "https://bluegrass-map.vercel.app/";

const API = SpotifyApi.withUserAuthorization(CLIENT_ID, REDIRECT_URI);
const auth = async () => {
  await API.authenticate();
}
auth();

// end spotify setup

const DATA_YEAR_MIN = 1962
const DATA_YEAR_MAX = 2026

const ALL_PLANTS = (() => {
  const map = {}
  rawData.forEach(entry => {
    const key = entry.plant_scientific || entry.plant_common
    if (!map[key]) map[key] = { ...entry, songs: [] }
    map[key].songs.push({
      title: entry.song_title,
      artist: entry.artist,
      year: entry.year,
      fragment: entry.lyric_fragment || ''
    })
  })
  return Object.values(map)
})()

export default function App() {
  const [threshold, setThreshold] = useState(5)
  const [yearRange, setYearRange] = useState([1970, 2000])
  const [includeNoYear, setIncludeNoYear] = useState(true)
  const [selectedState, setSelectedState] = useState(null)
  const [selectedPlant, setSelectedPlant] = useState(null)
  const [enabledPlants, setEnabledPlants] = useState(
    () => new Set(ALL_PLANTS.map(p => p.plant_scientific || p.plant_common))
  )

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      // Clean the code out of the URL so it doesn't get reused on refresh
      window.history.replaceState({}, '', window.location.pathname);
      exchangeCodeForToken(code).then(() => {
        // token is now stored, app can proceed normally
      });
    }
  }, []);

  const filteredData = useMemo(() => {
    return rawData.filter(d => {
      if (d.year === null || d.year === undefined) return includeNoYear
      return d.year >= yearRange[0] && d.year <= yearRange[1]
    })
  }, [yearRange, includeNoYear])

  const stateData = useMemo(() => {
    const map = {}
    filteredData.forEach(entry => {
      const key = entry.plant_scientific || entry.plant_common
      if (!enabledPlants.has(key)) return
      Object.keys(entry.states || {}).forEach(state => {
        if (!map[state]) map[state] = { count: 0, entries: [] }
        const alreadyCounted = map[state].entries.some(
          e => (e.plant_scientific || e.plant_common) === key
        )
        if (!alreadyCounted) {
          map[state].count += 1
          map[state].entries.push(entry)
        }
      })
    })
    return map
  }, [filteredData, enabledPlants])

  const visiblePlants = useMemo(() => {
    return ALL_PLANTS.filter(p => {
      const hasMatchingSong = p.songs.some(s => {
        if (s.year === null || s.year === undefined) return includeNoYear
        return s.year >= yearRange[0] && s.year <= yearRange[1]
      })
      if (!hasMatchingSong) return false
      if (selectedState) {
        return p.states && p.states[selectedState] !== undefined
      }
      return true
    })
  }, [yearRange, includeNoYear, selectedState])

  const occurrenceCoords = useMemo(() => {
    const seen = new Set()
    const coords = []
    filteredData.forEach(entry => {
      const key = entry.plant_scientific || entry.plant_common
      if (seen.has(key)) return
      seen.add(key)
      const plant = ALL_PLANTS.find(p => (p.plant_scientific || p.plant_common) === key)
      if (!plant?.occurrence_coords) return
      plant.occurrence_coords.forEach(c => coords.push(c))
    })
    return coords
  }, [filteredData])

  const handleTogglePlant = (key) => {
    setEnabledPlants(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

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
          visiblePlants={visiblePlants}
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
          enabledPlants={enabledPlants}
          onTogglePlant={handleTogglePlant}
          onEnableAll={() => setEnabledPlants(new Set(ALL_PLANTS.map(p => p.plant_scientific || p.plant_common)))}
          onDisableAll={() => setEnabledPlants(new Set())}
        />
      </div>

      {selectedPlant && (
        <PlantDetail
          api={API}
          plant={selectedPlant}
          onClose={() => setSelectedPlant(null)}
        />
      )}
    </div>
  )
}