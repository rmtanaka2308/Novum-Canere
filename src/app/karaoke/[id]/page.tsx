/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { notFound, useParams, useRouter } from "next/navigation"
import { supabaseBrowser } from "@/lib/supabaseBrowser"
import { ArrowLeft, Play, Pause } from "lucide-react"

type LrcLine = { time: number; text: string }
type SongRow = {
    id: string
    track_name: string
    artist_name: string
    lrc_text: string | null
    lrc_parsed: LrcLine[] | null
    audio_original_path: string | null
}

function parseLrc(lrc: string): LrcLine[] {
    return lrc
        .split(/\r?\n/)
        .flatMap((line) => {
            const matches = [...line.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)]
            const text = line.replace(/\[(\d+):(\d+(?:\.\d+)?)\]/g, "").trim()
            return matches.map((m) => ({
                time: Number(m[1]) * 60 + Number(m[2]),
                text,
            }))
        })
        .filter((l) => l.text.length)
        .sort((a, b) => a.time - b.time)
}

export default function KaraokePage() {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const supabase = supabaseBrowser()

    const [loading, setLoading] = useState(true)
    const [song, setSong] = useState<SongRow | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [error, setError] = useState<string>("")

    const audioRef = useRef<HTMLAudioElement | null>(null)
    const lyricsContainerRef = useRef<HTMLDivElement | null>(null)
    const rafRef = useRef<number | null>(null)
    const [currentIdx, setCurrentIdx] = useState<number>(-1)
    const [isPlaying, setIsPlaying] = useState(false)

    const lines: LrcLine[] = useMemo(() => {
        if (!song) return []
        if (song.lrc_parsed && Array.isArray(song.lrc_parsed)) return song.lrc_parsed
        if (song.lrc_text) return parseLrc(song.lrc_text)
        return []
    }, [song])

    useEffect(() => {
        if (currentIdx >= 0 && lyricsContainerRef.current) {
            const container = lyricsContainerRef.current
            const activeLine = container.children[currentIdx] as HTMLElement

            if (activeLine) {
                const containerHeight = container.clientHeight
                const lineTop = activeLine.offsetTop
                const lineHeight = activeLine.clientHeight

                // Calculate scroll position to center the active line
                const scrollTop = lineTop - containerHeight / 2 + lineHeight / 2

                container.scrollTo({
                    top: scrollTop,
                    behavior: "smooth",
                })
            }
        }
    }, [currentIdx])

    useEffect(() => {
        ; (async () => {
            setLoading(true)
            setError("")
            try {
                const { data, error } = await supabase
                    .from("songs")
                    .select("id, track_name, artist_name, lrc_text, lrc_parsed, audio_original_path")
                    .eq("id", params.id)
                    .maybeSingle<SongRow>()
                if (error) throw error
                if (!data) return notFound()
                setSong(data)

                if (data.audio_original_path) {
                    const { data: pub } = supabase.storage.from("audio").getPublicUrl(data.audio_original_path)
                    setAudioUrl(pub.publicUrl)
                } else {
                    setError("No audio path saved for this song.")
                }
            } catch (e: any) {
                console.error(e)
                setError(e.message ?? "Failed to load song.")
            } finally {
                setLoading(false)
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id])

    useEffect(() => {
        const step = () => {
            const audio = audioRef.current
            if (!audio || !isPlaying || lines.length === 0) {
                rafRef.current = requestAnimationFrame(step)
                return
            }
            const t = audio.currentTime

            let lo = 0,
                hi = lines.length - 1,
                idx = -1
            while (lo <= hi) {
                const mid = (lo + hi) >> 1
                if (lines[mid].time <= t) {
                    idx = mid
                    lo = mid + 1
                } else {
                    hi = mid - 1
                }
            }
            if (idx !== currentIdx) setCurrentIdx(idx)
            rafRef.current = requestAnimationFrame(step)
        }

        rafRef.current = requestAnimationFrame(step)
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [isPlaying, lines, currentIdx])

    const onPlayPause = async () => {
        const audio = audioRef.current
        if (!audio) return
        if (audio.paused) {
            await audio.play()
            setIsPlaying(true)
        } else {
            audio.pause()
            setIsPlaying(false)
        }
    }

    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="text-white/70 hover:text-white flex items-center gap-2 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>

                    {song && (
                        <div className="text-right">
                            <h1 className="text-lg font-medium text-white/90">{song.track_name}</h1>
                            <p className="text-sm text-white/60">{song.artist_name}</p>
                        </div>
                    )}
                </div>
            </div>

            <audio
                ref={audioRef}
                src={audioUrl ?? undefined}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                preload="auto"
                className="hidden"
            />

            <button
                onClick={onPlayPause}
                className="fixed bottom-8 right-8 z-20 w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-105"
                disabled={!audioUrl}
            >
                {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-1" />}
            </button>

            <div
                ref={lyricsContainerRef}
                className="h-screen overflow-y-auto scrollbar-hide pt-32 pb-32"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {loading && (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-white/60 text-xl">Loading lyrics...</p>
                    </div>
                )}

                {error && (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-red-400 text-xl">{error}</p>
                    </div>
                )}

                {lines.length === 0 && !loading && !error && (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-white/40 text-xl">No synced lyrics available</p>
                    </div>
                )}

                {lines.map((line, i) => (
                    <div
                        key={`${line.time}-${i}`}
                        className={`text-center px-8 py-6 transition-all duration-700 ease-out ${i === currentIdx
                                ? "text-white text-4xl md:text-5xl lg:text-6xl font-light scale-105 opacity-100"
                                : i === currentIdx - 1 || i === currentIdx + 1
                                    ? "text-white/60 text-2xl md:text-3xl lg:text-4xl font-light opacity-80"
                                    : "text-white/30 text-xl md:text-2xl lg:text-3xl font-light opacity-50"
                            }`}
                        style={{
                            lineHeight: "1.2",
                            textShadow: i === currentIdx ? "0 0 20px rgba(255,255,255,0.3)" : "none",
                        }}
                    >
                        {line.text || "\u00A0"}
                    </div>
                ))}

                <div className="h-96"></div>
            </div>

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </main>
    )
}
