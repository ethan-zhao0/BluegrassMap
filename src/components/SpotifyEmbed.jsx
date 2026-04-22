export default function SpotifyPlayer({ trackId }) {
    return (
        <iframe
            src={`https://open.spotify.com/embed/track/${trackId}`}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{ borderRadius: '12px', border: 'none' }}
        />
    );
}