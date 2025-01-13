import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
export async function middleware(req: NextRequest) {

    // check if the user is authenticated using Supabase
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });
    const { data: { session }} = await supabase.auth.getSession();
    // no valid session
    if (!session && req.nextUrl.pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    if (session && req.nextUrl.pathname === '/login')
        return NextResponse.redirect(new URL('/dashboard', req.url));

    // if authenticated, proceed.
    return res;
}

export const config = {
    matcher: ['/dashboard/:path*']
}
