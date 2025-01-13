
// convert temporary Google code into a Supabase session

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    // Move requestUrl declaration to function scope
    const requestUrl = new URL(request.url);
    try {
        const code = requestUrl.searchParams.get('code');

        if (code) {
            const supabase = createRouteHandlerClient({ cookies });
            await supabase.auth.exchangeCodeForSession(code);

            return NextResponse.redirect(new URL('/dashboard', requestUrl.origin), {
                status: 303
            });

        }

        // Now requestUrl is accessible here
        return NextResponse.redirect(new URL('/login', requestUrl.origin));
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.redirect(new URL('/login', requestUrl.origin));
    }
}