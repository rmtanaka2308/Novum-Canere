// middleware.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: Request) {
    const res = NextResponse.next();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => res.cookies.getAll(),
                setAll: (cookies) => {
                    cookies.forEach(({ name, value, options }) => {
                        res.cookies.set(name, value, { path: "/", ...options });
                    });
                }
            }
        }
    );

    // Touch auth to refresh session cookies if needed
    await supabase.auth.getUser();
    return res;
}

export const config = { matcher: ["/home/:path*"] };
