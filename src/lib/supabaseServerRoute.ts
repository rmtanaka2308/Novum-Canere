// src/lib/supabaseServerRoute.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const supabaseServerRoute = async () => {
    const cookieStore = await cookies(); // ✅ Next 15: await
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set({
                            name,
                            value,
                            path: options?.path ?? "/",
                            ...options,
                        } as CookieOptions & { name: string; value: string });
                    });
                },
            },
        }
    );
};
