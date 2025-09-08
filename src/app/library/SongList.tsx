/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import type { Song } from "./page";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Trash2, Music, Play } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SongList({ songs: initialSongs }: { songs: Song[] }) {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [songs, setSongs] = useState(initialSongs);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (song: Song) => {
    if (deletingId) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${song.track_name}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    setDeletingId(song.id);
    setError("");

    if (song.audio_original_path) {
      const { error: storageError } = await supabase.storage
        .from("audio")
        .remove([song.audio_original_path]);

      if (storageError) {
        console.error("Storage deletion error:", storageError);
        setError(`Failed to delete audio file from storage. Please try again.`);
        setDeletingId(null);
        return;
      }
    }

    const { error: dbError } = await supabase
      .from("songs")
      .delete()
      .eq("id", song.id);

    if (dbError) {
      console.error("Database deletion error:", dbError);
      setError(`Failed to delete song from database. Please try again.`);
    } else {
      setSongs(songs.filter((s) => s.id !== song.id));
    }
    setDeletingId(null);
  };

  const handlePlay = (song: Song) => {
    // Navigate to karaoke screen with this song id
    router.push(`/karaoke/${song.id}`);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {error && (
        <p className="p-4 text-sm text-center text-red-600 bg-red-50 rounded-t-lg">
          {error}
        </p>
      )}
      <ul className="divide-y divide-gray-200">
        {songs.length === 0 && (
          <li className="p-8 text-center text-gray-500">
            <Music className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            You haven't uploaded any songs yet.
          </li>
        )}
        {songs.map((song) => (
          <li
            key={song.id}
            className={`p-4 flex items-center justify-between gap-3 transition-opacity ${deletingId === song.id ? "opacity-50" : "opacity-100"
              }`}
          >
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {song.track_name}
              </p>
              <p className="text-sm text-gray-600 truncate">{song.artist_name}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePlay(song)}
                className="text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded-md flex items-center gap-1"
                aria-label={`Play ${song.track_name}`}
              >
                <Play className="w-4 h-4" />
                Play
              </button>

              <button
                onClick={() => handleDelete(song)}
                disabled={deletingId === song.id}
                className="text-gray-400 hover:text-red-600 disabled:text-gray-300 disabled:cursor-not-allowed p-2 rounded-md transition-colors"
                aria-label={`Delete ${song.track_name}`}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
