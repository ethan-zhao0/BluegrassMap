import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import Tooltip from './Tooltip'

// swap this out for your real data later
const plantData = {}

const APP_CORE = new Set([
  'West Virginia', 'Kentucky', 'Virginia', 'Tennessee',
  'North Carolina', 'Pennsylvania', 'Georgia', 'Alabama'
])

function getColor(data, threshold) {
  if (!data || data.count < threshold) return '#cdc4a4'
  if (data.count < 15) return '#e8d8a0'
  if (data.count < 22) return '#c8a050'
  if (data.count < 28) return '#9a6828'
  return '#5a3010'
}

function getStroke(name, data, threshold) {
  if (data && data.count >= threshold && APP_CORE.has(name)) return '#2a1204'
  if (data && data.count >= threshold) return '#7a5020'
  return '#b8a878'
}

function getStrokeWidth(name, data, threshold) {
  if (data && data.count >= threshold && APP_CORE.has(name)) return 1.8
  if (data && data.count >= threshold) return 0.9
  return 0.4
}

export default function USMap({ threshold }) {
  const svgRef = useRef(null)
  const [geoData, setGeoData] = useState(null)
  const [tooltip, setTooltip] = useState({
    visible: false, x: 0, y: 0, state: '', data: null
  })

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      .then(r => r.json())
      .then(us => {
        const states = topojson.feature(us, us.objects.states)
        setGeoData(states)
      })
  }, [])

  useEffect(() => {
    if (!geoData || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    const projection = d3.geoAlbersUsa().scale(1060).translate([480, 270])
    const pathGen = d3.geoPath().projection(projection)

    svg.selectAll('path')
      .data(geoData.features)
      .join('path')
      .attr('d', pathGen)
      .attr('fill',         d => getColor(plantData[d.properties.name], threshold))
      .attr('stroke',       d => getStroke(d.properties.name, plantData[d.properties.name], threshold))
      .attr('stroke-width', d => getStrokeWidth(d.properties.name, plantData[d.properties.name], threshold))
      .attr('cursor', 'pointer')
      .on('mousemove', function(event, d) {
  const rect = svgRef.current.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  setTooltip({
    visible: true,
    x, y,
    state: d.properties.name,
    data: plantData[d.properties.name] || null,
  })
})

  }, [geoData, threshold])

  return (
    <div className="map-wrap">
      <svg
        ref={svgRef}
        width="100%"
        viewBox="0 0 960 540"
        style={{ display: 'block', background: '#e8dbb8' }}
      />
      <Tooltip {...tooltip} threshold={threshold} />
    </div>
  )
}