    "use client";
    import { useEffect, useState } from 'react';
    import { supabase } from '@/lib/supabase';

    export default function SharePage({ params }: { params: { id: string } }) {
        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);
        const [shares, setShares] = useState<any>(null);
        const [shareId, setShareId] = useState<string | null>(null);

        useEffect(() => {
            if (params) {
                setShareId(params.id);
                validateShare(params.id);
            }
        }, [params]);

        const handleFileRedirect = async () => {
            // TODO handle redirect
            // create a signed URL
        }

        const validateShare = async (id: string) => {
            try {
                setIsLoading(true);

                // Log the share ID we're looking for
                console.log("Looking for share with ID:", params.id);

                const { data, error } = await supabase
                    .from('shares')
                    .select('*, files(*)')
                    .eq('id', params.id)
                    .single();

                // Log what we got back
                console.log("Share data:", data);
                console.log("Error if any:", error);

                if (error || !data) {
                    setError('Share link not found or expired');
                    return;
                }

                // Check what file_id we're trying to use
                console.log("File ID:", data.file_id);

                setShares(data);

            } catch (error) {
                console.error("Error in validateShare:", error);
                setError('Error accessing shared file');
            } finally {
                setIsLoading(false);
            }
        };

        // Show loading/error states
        if (isLoading) return <div>Loading...</div>;
        if (error) return <div>{error}</div>;

        return (
            <div>
                {shareId == null ? (
                    <div>Loading...</div>
                ) :

                shares && (
                    <>
                        <h1>Shared File:</h1>
                        <p>File name: {shares.files.filename}</p>
                        <button className="bg-blue-500 h-8 w-1/2 rounded-full"onClick={handleFileRedirect}>Redirect to File</button>
                    </>
                )
    }
                </div>



        )
    }