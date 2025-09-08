/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import { Upload, ArrowLeft, Music } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { AuthButtons } from "../components/AuthButton";
import { Session } from "@supabase/supabase-js";
import { parseLrc } from "@/utils/lrcParser";


interface SongData {
    trackName: string;
    artistName: string;
    plainLyrics: string;
    syncedLyrics: string;
}

const BUCKET = "audio";

function slugify(s: string) {
    return s
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

export default function SetupPage() {
    const [supabase] = useState(() => supabaseBrowser());
    const [songData, setSongData] = useState<SongData | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [status, setStatus] = useState("");
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const router = useRouter();
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
        };

        getSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    useEffect(() => {
        const storedSong = localStorage.getItem("karaokeSetupSong");
        if (storedSong) {
            setSongData(JSON.parse(storedSong));
        } else {
            router.push("/");
        }
    }, [router]);

    const handleFileSelect = (file: File) => {
        if (file.type.startsWith("audio/")) {
            setAudioFile(file);
            setUploadedUrl(null);
        } else {
            alert("Please select an audio file (MP3, WAV, etc.)");
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) handleFileSelect(files[0]);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) handleFileSelect(files[0]);
    };

    const handleStartKaraoke = async () => {
        if (!audioFile || !songData || !session) return;

        try {
            const lrc_parsed = parseLrc(songData.syncedLyrics || "");
            setStatus("Uploading audio file…");
            const artistSlug = slugify(songData.artistName || "artist");
            const trackSlug = slugify(songData.trackName || "track");
            const ext = audioFile.name.split(".").pop() || "bin";
            const fileName = `${Date.now()}-original.${ext}`;
            const storagePath = `${artistSlug}/${trackSlug}/${fileName}`;

            const { error: uploadErr } = await supabase.storage
                .from(BUCKET)
                .upload(storagePath, audioFile, {
                    contentType: audioFile.type,
                    upsert: false,
                });

            if (uploadErr) {
                throw uploadErr;
            }

            setStatus("Saving song details to database…");
            const { error: insertErr } = await supabase.from("songs").insert({
                user_id: session.user.id,
                track_name: songData.trackName,
                artist_name: songData.artistName,
                lrc_text: songData.plainLyrics,
                lrc_parsed: lrc_parsed,
                audio_original_path: storagePath,
            });

            if (insertErr) {
                throw insertErr;
            }

            const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
            setUploadedUrl(pub.publicUrl);
            setStatus("✅ Song saved successfully!");

        } catch (err: any) {
            console.error("Full error:", err);
            setStatus(`Error: ${err?.message ?? "An unknown error occurred"}`);
        }
    };

    if (!songData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }


    return (
        <main className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-6">
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <h1 className="text-3xl font-light text-gray-900 mb-2">Karaoke Setup</h1>
                    <p className="text-gray-600">Upload an MP3 file to start your karaoke session</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Music className="w-5 h-5 text-gray-400" />
                        <div>
                            <h2 className="font-medium text-gray-900">{songData.trackName}</h2>
                            <p className="text-gray-600 text-sm">{songData.artistName}</p>
                        </div>
                    </div>
                    <div className="text-sm text-gray-500">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Synced Lyrics Ready</span>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                    <h3 className="font-medium text-gray-900 mb-4">Upload Audio File</h3>

                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver ? "border-gray-400 bg-gray-50" :
                            audioFile ? "border-green-300 bg-green-50" : "border-gray-300"
                            }`}
                    >
                        {audioFile ? (
                            <div className="space-y-2">
                                <Upload className="w-8 h-8 text-green-600 mx-auto" />
                                <p className="font-medium text-green-800">{audioFile.name}</p>
                                <p className="text-sm text-green-600">
                                    {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                                <button
                                    onClick={() => { setAudioFile(null); setUploadedUrl(null); }}
                                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                                >
                                    Remove file
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                                <p className="text-gray-600">
                                    Drag and drop your MP3 file here, or{" "}
                                    <label className="text-gray-900 underline cursor-pointer hover:text-gray-700">
                                        browse
                                        <input type="file" accept="audio/*" onChange={handleFileInput} className="hidden" />
                                    </label>
                                </p>
                                <p className="text-sm text-gray-500">Supports MP3, WAV, and other audio formats</p>
                            </div>
                        )}
                    </div>
                </div>

                {session ? (
                    <button
                        onClick={handleStartKaraoke}
                        disabled={!audioFile || status.startsWith("Uploading") || status.startsWith("Saving")}
                        className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${audioFile ? "bg-gray-900 text-white hover:bg-gray-800" :
                            "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        Save and Upload Song
                    </button>
                ) : (
                    <AuthButtons />
                )}

                <div className="mt-4">
                    {status && <p className="text-sm text-gray-600">{status}</p>}
                    {uploadedUrl && (
                        <p className="text-sm text-green-700 break-all">
                            Public URL: <a className="underline" href={uploadedUrl} target="_blank" rel="noreferrer">{uploadedUrl}</a>
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}
