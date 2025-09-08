// src/app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // This reads the URL hash (#access_token=...) and stores the session
        supabase.auth.getSession().then(({ data: { session } }) => {
            // optional: you could store user info/state here
            router.replace(session ? "/home" : "/");
        });
    }, [router]);

    return (
        <div style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
            Finishing sign-in…
        </div>
    );
}
