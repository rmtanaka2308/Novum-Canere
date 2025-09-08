export type LrcLine = { time: number; text: string };

export function parseLrc(lrc: string): LrcLine[] {
    return lrc
        .split(/\r?\n/)
        .flatMap((line) => {
            const times = [...line.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)];
            const text = line.replace(/\[(\d+):(\d+(?:\.\d+)?)\]/g, "").trim();
            return times.map((m) => {
                const min = Number(m[1]);
                const sec = Number(m[2]);
                return { time: min * 60 + sec, text };
            });
        })
        .filter((x) => x.text.length);
}
