/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import type React from "react"
import { useState } from "react"
import { SongCard } from "../components/SongCard"
import { LyricsModal } from "../components/LyricsCard"

export default function Home() {
  const [track, setTrack] = useState("")
  const [artist, setArtist] = useState("")
  const [status, setStatus] = useState("")
  const [songs, setSongs] = useState<any[]>([])
  const [selectedSong, setSelectedSong] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("Searching...")
    setSongs([])
    try {
      const params = new URLSearchParams({
        track_name: track,
        artist_name: artist,
      })
      console.log(params)
      const res = await fetch(`/api/lrclib?${params.toString()}`)
      const songs = await res.json()
      console.log("songs>>>>>>>>>>>>>>>>>>>>>", songs)
      setSongs(songs)
    } catch (error) {
      console.error("no songs found!!!", error)
    }
    setStatus("")
  }

  const handleSongClick = (song: any) => {
    setSelectedSong(song)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedSong(null)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-light text-gray-900 mb-2">Song Search</h1>
          <p className="text-gray-600">Find lyrics for your favorite tracks</p>
        </div>

        <form onSubmit={handleSearch} className="mb-12">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Track Name</label>
                <input
                  type="text"
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                  placeholder="Enter track name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Artist Name</label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Enter artist name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
            >
              Search Songs
            </button>
          </div>
        </form>

        {status && (
          <div className="text-center mb-8">
            <p className="text-gray-600 italic">{status}</p>
          </div>
        )}

        {songs.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-light text-gray-900 mb-6">Search Results ({songs.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {songs.map((song) => (
                <SongCard
                  key={song.id}
                  id={song.id}
                  trackName={song.name || song.trackName}
                  artistName={song.artistName}
                  plainLyrics={song.plainLyrics || ""}
                  syncedLyrics={song.syncedLyrics || ""}
                  onClick={() => handleSongClick(song)}
                />
              ))}
            </div>
          </div>
        )}

        {selectedSong && (
          <LyricsModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            trackName={selectedSong.name || selectedSong.trackName}
            artistName={selectedSong.artistName}
            plainLyrics={selectedSong.plainLyrics || ""}
            syncedLyrics={selectedSong.syncedLyrics || ""}
          />
        )}
      </div>
    </main>
  )
}
