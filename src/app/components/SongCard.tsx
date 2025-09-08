"use client"

interface SongCardProps {
  id: string
  trackName: string
  artistName: string
  plainLyrics: string
  syncedLyrics: string
  onClick?: () => void
}

export function SongCard(props: SongCardProps) {
  const { id, artistName, trackName, plainLyrics, syncedLyrics, onClick } = props

  return (
    <div
      className="group border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors bg-white cursor-pointer hover:shadow-sm"
      onClick={onClick}
    >
      <div className="space-y-2">
        <h3 className="font-medium text-gray-900 text-lg leading-tight">{trackName}</h3>
        <p className="text-gray-600 text-sm">{artistName}</p>
      </div>

      {plainLyrics && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Lyrics Preview</p>
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">{plainLyrics.slice(0, 150)}...</p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
        <span>ID: {id}</span>
        {syncedLyrics && <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">Synced</span>}
      </div>
    </div>
  )
}
