import { useRef, useCallback } from 'react'

export default function RangeSlider({ min, max, value, onChange }) {
  const [lo, hi] = value
  const trackRef = useRef(null)
  const dragRef  = useRef(null) // { type: 'lo'|'hi'|'range', startX, startLo, startHi }

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
        const newLo = Math.min(toVal(ev.clientX), d.startHi - 1)
        onChange([Math.max(min, newLo), d.startHi])
      } else if (d.type === 'hi') {
        const newHi = Math.max(toVal(ev.clientX), d.startLo + 1)
        onChange([d.startLo, Math.min(max, newHi)])
      } else {
        // drag whole range
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

  const loPct = ((lo - min) / (max - min) * 100).toFixed(1)
  const hiPct = ((hi - min) / (max - min) * 100).toFixed(1)

return (
  <div
    className="range-track-wrap"
    ref={trackRef}
    style={{ width: '97%', left: 8 }}
  >
    <div className="range-inactive" style={{ left: 0, right: 0 }} />
    <div
      className="range-active"
      style={{ left: loPct + '%', width: (hiPct - loPct) + '%' }}
      onMouseDown={onMouseDown('range')}
    />
    <div className="range-thumb" style={{ left: loPct + '%' }} onMouseDown={onMouseDown('lo')} />
    <div className="range-thumb" style={{ left: hiPct + '%' }} onMouseDown={onMouseDown('hi')} />
  </div>
)
}