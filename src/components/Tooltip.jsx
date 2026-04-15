export default function Tooltip({ x, y, state, data, threshold, visible }) {
  if (!visible || !state) return null

  const flipped = x > 500

  return (
    <div
      className="tooltip"
      style={{
        left: flipped ? x - 220 : x + 14,
        top: y - 10,
      }}
    >
      <div className="tt-name">{state}</div>
      {data ? (
        <>
          <div className="tt-count">{data.count} plant species recorded</div>
          <div className="tt-plants">
            {data.plants.slice(0, 4).map(p => (
              <div key={p} className="tt-plant">{p}</div>
            ))}
            {data.plants.length > 4 && (
              <div className="tt-more">…and more</div>
            )}
          </div>
          <div className="tt-status">
            {data.count >= threshold ? '· above threshold' : '· below threshold'}
          </div>
        </>
      ) : (
        <div className="tt-count">no data yet</div>
      )}
    </div>
  )
}