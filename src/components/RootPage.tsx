"use client";
import { useRouter } from "next/navigation";

export default function RootPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Nav */}
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-black">Secure Send</h1>
                    <button
                        onClick={() => router.push('/login')}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Login
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <main className="max-w-3xl mx-auto px-4 py-20 text-center">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Share Files Securely
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                    Client-side encrypted file sharing service for secure and private transfers.
                </p>
                <button
                    onClick={() => router.push('/login')}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Get Started
                </button>
            </main>
        </div>
    );
}