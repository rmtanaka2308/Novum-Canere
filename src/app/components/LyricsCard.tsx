"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface LyricsModalProps {
    isOpen: boolean
    onClose: () => void
    trackName: string
    artistName: string
    plainLyrics: string
    syncedLyrics: string
}

export function LyricsModal({ isOpen, onClose, trackName, artistName, plainLyrics, syncedLyrics }: LyricsModalProps) {
    const [showSynced, setShowSynced] = useState(false)
    const router = useRouter()

    if (!isOpen) return null

    const currentLyrics = showSynced ? syncedLyrics : plainLyrics
    const hasLyrics = plainLyrics || syncedLyrics
    const hasBothTypes = plainLyrics && syncedLyrics

    const handleStartKaraoke = () => {
        // Store song data in localStorage for the setup page
        const songData = {
            trackName,
            artistName,
            plainLyrics,
            syncedLyrics,
        }
        localStorage.setItem("karaokeSetupSong", JSON.stringify(songData))
        router.push("/setup")
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-medium text-gray-900">{trackName}</h2>
                        <p className="text-gray-600">{artistName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        close
                    </button>
                </div>

                {/* Toggle Controls */}
                {hasBothTypes && (
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-700">View:</span>
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setShowSynced(false)}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${!showSynced ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                                        }`}
                                >
                                    Plain Lyrics
                                </button>
                                <button
                                    onClick={() => setShowSynced(true)}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${showSynced ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                                        }`}
                                >
                                    Synced Lyrics
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lyrics Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {hasLyrics ? (
                        <div className="space-y-4">
                            {!hasBothTypes && (
                                <div className="mb-4">
                                    <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                                        {syncedLyrics ? "Synced Lyrics" : "Plain Lyrics"}
                                    </span>
                                </div>
                            )}
                            <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed font-mono text-sm">{currentLyrics}</pre>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No lyrics available for this track</p>
                        </div>
                    )}
                </div>

                {syncedLyrics && (
                    <div className="p-6 border-t border-gray-200">
                        <button
                            onClick={handleStartKaraoke}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
                        >
                            <div className="w-4 h-4" />
                            Start Karaoke Setup
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
