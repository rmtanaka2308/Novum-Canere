"use client";

import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Session } from "@supabase/supabase-js";

export function AuthButtons() {
    const [supabase] = useState(() => supabaseBrowser());
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

    async function signInWithGitHub() {
        await supabase.auth.signInWithOAuth({
            provider: "github",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        });
    }

    async function signOut() {
        await supabase.auth.signOut();
        window.location.reload();
    }

    if (session) {
        return (
            <button onClick={signOut} className="px-4 py-2 bg-gray-200 rounded">
                Sign out
            </button>
        );
    }

    return (
        <button onClick={signInWithGitHub} className="px-4 py-2 bg-black text-white rounded">
            Sign in with GitHub
        </button>
    );
}
