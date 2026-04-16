import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'

function getColor(data, threshold, name, selectedState) {
  if (name === selectedState) return '#439B47'
  if (!data || data.count < threshold) return 'transparent'
  if (data.count < 5)  return '#3a7a20'
  if (data.count < 10) return '#5aaa30'
  if (data.count < 20) return '#8acc50'
  return '#b8e870'
}

function getStroke(name, selectedState) {
  if (name === selectedState) return '#ffffff'
  return 'rgba(255,255,255,0.6)'
}

function getStrokeWidth(name, selectedState) {
  return name === selectedState ? 3 : 1.5
}

function getOpacity(name, selectedState) {
  if (!selectedState) return 1
  return name === selectedState ? 1 : 0.4
}

export default function USMap({ stateData, threshold, selectedState, onStateClick, onClickOutside }) {
  const svgRef = useRef(null)
  const geoRef = useRef(null)
  const onClickOutsideRef = useRef(onClickOutside)

  useEffect(() => {
    onClickOutsideRef.current = onClickOutside
  }, [onClickOutside])

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      .then(r => r.json())
      .then(us => {
        geoRef.current = topojson.feature(us, us.objects.states)
        draw()
      })
  }, [])

  useEffect(() => { draw() }, [stateData, threshold, selectedState])

  function draw() {
    if (!geoRef.current || !svgRef.current) return

    const svg     = d3.select(svgRef.current)
    const proj    = d3.geoAlbersUsa().scale(1060).translate([480, 270])
    const pathGen = d3.geoPath().projection(proj)

    // transparent full-svg background rect to catch outside clicks
    svg.selectAll('.bg-rect')
      .data([null])
      .join('rect')
      .attr('class', 'bg-rect')
      .attr('width', 960)
      .attr('height', 540)
      .attr('fill', 'transparent')
      .on('click', () => onClickOutsideRef.current())

    svg.selectAll('path')
      .data(geoRef.current.features)
      .join('path')
      .attr('d',            pathGen)
      .attr('fill',         d => getColor(stateData[d.properties.name], threshold, d.properties.name, selectedState))
      .attr('stroke',       d => getStroke(d.properties.name, selectedState))
      .attr('stroke-width', d => getStrokeWidth(d.properties.name, selectedState))
      .attr('opacity',      d => getOpacity(d.properties.name, selectedState))
      .attr('cursor', 'pointer')
      .on('click', function(event, d) {
        event.stopPropagation()
        onStateClick(d.properties.name)
      })
      .on('mousemove', function(event, d) {
        const name  = d.properties.name
        const count = stateData[name]?.count || 0
        if (name !== selectedState) {
          d3.select(this).attr('stroke', '#ffffff').attr('stroke-width', 2)
        }
        d3.select(this).select('title').remove()
        d3.select(this).append('title').text(`${name} · ${count} plants`)
      })
      .on('mouseleave', function(event, d) {
        const name = d.properties.name
        d3.select(this)
          .attr('stroke',       getStroke(name, selectedState))
          .attr('stroke-width', getStrokeWidth(name, selectedState))
      })
  }

  return (
    <div className="map-wrap">
      <svg
        ref={svgRef}
        width="100%"
        viewBox="0 0 960 540"
        style={{ display: 'block' }}
      />
    </div>
  )
}