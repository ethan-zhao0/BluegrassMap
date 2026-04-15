import { useState } from 'react'
import USMap from './components/USMap'

export default function App() {
  const [threshold, setThreshold] = useState(12)

  return (
    <div className="root">
      <div className="topbar">
        <div>
          <h1 className="title">Botanical Appalachia</h1>
          <p className="subtitle">
            Plants named in bluegrass lyrics, 1945–1975 · distribution sourced from GBIF occurrence records
          </p>
        </div>
      </div>

      <USMap threshold={threshold} />

      <div className="bottom">
        <div className="legend">
          <span className="leg-label">Species density</span>
          <div className="leg"><div className="ls ls-few" /> few</div>
          <div className="leg"><div className="ls ls-moderate" /> moderate</div>
          <div className="leg"><div className="ls ls-many" /> many</div>
          <div className="leg"><div className="ls ls-most" /> most</div>
          <div className="leg"><div className="ls ls-none" /> below threshold</div>
        </div>

        <div className="divider" />

        <div className="ctrl">
          <span className="ctrl-label">Threshold:</span>
          <input
            type="range"
            min="1"
            max="35"
            value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            className="slider"
          />
          <span className="ctrl-val">{threshold} species</span>
        </div>
      </div>

      <div className="hintbar">
        {threshold <= 6  && 'Low threshold — lyric plants are found widely across the whole country'}
        {threshold > 6  && threshold <= 14 && 'Threshold rising — the eastern woodlands begin to separate from the west'}
        {threshold > 14 && threshold <= 22 && 'The Appalachian corridor is emerging from the data'}
        {threshold > 22 && threshold <= 28 && 'Only the mountain heartland remains — WV, KY, VA, NC, TN'}
        {threshold > 28 && 'The core of bluegrass country, defined entirely by its plants'}
      </div>
    </div>
  )
}