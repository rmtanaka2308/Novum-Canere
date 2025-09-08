import { supabase } from "./supbaseClient";

export type LrcLine = { time: number; text: string };

export function parseLrc(lrc: string): LrcLine[] {
    return lrc.split("\n").map(line => {
        const m = line.match(/\[(\d+):(\d+(?:\.\d+)?)\](.*)/);
        if (!m) return null;
        const minutes = Number(m[1]);
        const seconds = Number(m[2]);
        return { time: minutes * 60 + seconds, text: m[3].trim() };
    }).filter(Boolean) as LrcLine[];
}

export async function upsertSongFromLrclib(
    match: { id: string; trackName: string; artistName: string; albumName?: string; duration?: number },
    lrcText: string,
    paths?: { original?: string; instrumental?: string }
) {
    const { data, error } = await supabase
        .from("songs")
        .upsert(
            {
                lrclib_id: String(match.id),
                track_name: match.trackName,
                artist_name: match.artistName,
                album_name: match.albumName ?? null,
                duration_seconds: match.duration ?? null,
                lrc_text: lrcText,
                lrc_parsed: parseLrc(lrcText),
                audio_original_path: paths?.original ?? null,
                audio_instrumental_path: paths?.instrumental ?? null,
            },
            { onConflict: "lrclib_id" }
        )
        .select()
        .single();

    if (error) throw error;
    return data;
}
