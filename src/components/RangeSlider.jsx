import { useRef, useCallback } from 'react'

const THUMB = 16

export default function RangeSlider({ min, max, value, onChange }) {
  const [lo, hi] = value
  const trackRef = useRef(null)
  const dragRef  = useRef(null)

  const toVal = useCallback((clientX) => {
    const rect = trackRef.current.getBoundingClientRect()
    const pct  = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return Math.round(min + pct * (max - min))
  }, [min, max])

  const onMouseDown = (type) => (e) => {
    e.preventDefault()
    dragRef.current = { type, startX: e.clientX, startLo: lo, startHi: hi }

    const onMove = (ev) => {
      const d = dragRef.current
      if (!d) return
      const range = max - min
      if (d.type === 'lo') {
        onChange([Math.max(min, Math.min(toVal(ev.clientX), d.startHi - 1)), d.startHi])
      } else if (d.type === 'hi') {
        onChange([d.startLo, Math.min(max, Math.max(toVal(ev.clientX), d.startLo + 1))])
      } else {
        const dx    = ev.clientX - d.startX
        const rect  = trackRef.current.getBoundingClientRect()
        const delta = Math.round((dx / rect.width) * range)
        const span  = d.startHi - d.startLo
        let newLo   = d.startLo + delta
        let newHi   = d.startHi + delta
        if (newLo < min) { newLo = min; newHi = min + span }
        if (newHi > max) { newHi = max; newLo = max - span }
        onChange([newLo, newHi])
      }
    }

    const onUp = () => {
      dragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const loPct = (lo - min) / (max - min)
  const hiPct = (hi - min) / (max - min)
  const loLeft     = `calc(${loPct * 100}% - ${loPct * THUMB}px)`
  const hiLeft     = `calc(${hiPct * 100}% - ${hiPct * THUMB}px)`
  const activeLeft  = `calc(${loPct * 100}% - ${loPct * THUMB}px + ${THUMB / 2}px)`
  const activeRight = `calc(${(1 - hiPct) * 100}% - ${(1 - hiPct) * THUMB}px + ${THUMB / 2}px)`

  return (
    <div className="range-track-wrap" ref={trackRef} style={{ width: '100%' }}>
      <div className="range-inactive" style={{ left: 0, right: 0 }} />
      <div
        className="range-active"
        style={{ left: activeLeft, right: activeRight }}
        onMouseDown={onMouseDown('range')}
      />
      <div className="range-thumb" style={{ left: loLeft }} onMouseDown={onMouseDown('lo')} />
      <div className="range-thumb" style={{ left: hiLeft }} onMouseDown={onMouseDown('hi')} />
    </div>
  )
}