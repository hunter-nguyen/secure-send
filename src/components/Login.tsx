"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-lg">
            {/* Header */}
            <h1 className="text-3xl font-bold text-center mb-2 text-black">Secure Send</h1>
            <p className="text-gray-600 text-center mb-8">
                Secure file sharing made simple
            </p>

            {/* Google Sign In Button */}
            <button
                onClick={signInWithGoogle}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300
                          rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
                {/* Google Icon*/}
                <svg className="w-5 h-5 shrink"
                viewBox="0 0 50 50">
                  <path d="M 25.996094 48 C 13.3125 48 2.992188 37.683594 2.992188 25 C 2.992188 12.316406 13.3125 2 25.996094 2 C 31.742188 2 37.242188 4.128906 41.488281 7.996094 L 42.261719 8.703125 L 34.675781 16.289063 L 33.972656 15.6875 C 31.746094 13.78125 28.914063 12.730469 25.996094 12.730469 C 19.230469 12.730469 13.722656 18.234375 13.722656 25 C 13.722656 31.765625 19.230469 37.269531 25.996094 37.269531 C 30.875 37.269531 34.730469 34.777344 36.546875 30.53125 L 24.996094 30.53125 L 24.996094 20.175781 L 47.546875 20.207031 L 47.714844 21 C 48.890625 26.582031 47.949219 34.792969 43.183594 40.667969 C 39.238281 45.53125 33.457031 48 25.996094 48 Z"></path>
                </svg>
                Sign in with Google
            </button>

            <p className="text-xs text-gray-500 text-center mt-8">
                Your files are encrypted before upload
            </p>
        </div>
    </div>
);
}