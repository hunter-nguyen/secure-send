import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react"

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileId: string;
}

interface ShareSettings {
    expiration: string
    password: string
    usageLimit: number | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({isOpen, onClose, fileId}: ShareModalProps) => {


    const [shareSettings, setShareSettings] = useState<ShareSettings>({
        expiration: '24h',
        password: '',
        usageLimit: null
    });


    const [copyUrlStatus, setCopyUrlStatus] = useState<'idle' | 'copied'>('idle');

    const [shareUrl, setShareUrl] = useState('');

    useEffect(() => {
        console.log("Modal open: ", isOpen, "File ID: ", fileId);
        if (isOpen && fileId) {
            generateShareUrl();
        }
    }, [isOpen, fileId]);

    const handleSettingChange = (setting: keyof ShareSettings, value: any) => {
        setShareSettings(prev => ({
            ...prev,
            [setting]: value
        }))
        // Generate new URL when we change settings
    }

    const generateShareUrl = async () => {
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('shares')
                .insert([{
                    file_id: fileId,
                    created_by: user.id,  // Add creator
                    expiration: calculateExpiration(shareSettings.expiration),
                    password_hash: shareSettings.password ? await hashPassword(shareSettings.password) : null,
                    usage_limit: shareSettings.usageLimit,
                    usage_count: 0  // Initialize usage count
                }])
                .select()
                .single();

            if (error) {
                console.error("Error inserting share record: ", error);
                return;
            }

            setShareUrl(`${window.location.origin}/share/${data.id}`);
        } catch (error) {
            console.error("Error generating share URL:", error);
        }
    };

            // Calculate when share link expires based on selection
        const calculateExpiration = (duration: string): Date => {
            const now = new Date();
            switch(duration) {
                case '24h':
                    return new Date(now.setHours(now.getHours() + 24));
                case '7d':
                    return new Date(now.setDate(now.getDate() + 7));
                case '30d':
                    return new Date(now.setDate(now.getDate() + 30));
                case 'never':
                    return new Date('9999-12-31T23:59:59.999Z');
                default:
                    return new Date(now.setHours(now.getHours() + 24));
            }
        };

        // Hash password for secure storage
        const hashPassword = async (password: string): Promise<string> => {
            // Convert password to hash using Web Crypto API
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        };

        const handleCopyUrl = async () => {
            try {
                await navigator.clipboard.writeText(shareUrl);
                setCopyUrlStatus('copied');
                // Reset "Copied!" text after 2 seconds
                setTimeout(() => setCopyUrlStatus('idle'), 2000);
            } catch (error) {
                console.error('Failed to copy URL:', error);
            }
        };


    return (
        // Only show if isOpen is true
        isOpen && (
            // Full screen overlay
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                {/* Modal Container */}
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-black">Share File</h3>
                        <button
                            onClick={() => {
                                console.log("closing modal...")
                                onClose();
                            }}
                            className="text-gray-500 hover:text-gray-700 text-black"
                        >
                            ✕
                        </button>
                    </div>


                    {/* Share Settings */}
                    <div className="space-y-4">
                        {/* Expiration Setting */}
                        <div>
                            <label className="block text-sm font-medium text-black">
                                Link Expires In
                            </label>
                            <select
                                value={shareSettings.expiration}
                                onChange={(e) => handleSettingChange('expiration', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900"
                            >
                                <option value="24h">24 Hours</option>
                                <option value="7d">7 Days</option>
                                <option value="30d">30 Days</option>
                                <option value="never">Never</option>
                            </select>
                        </div>

                        {/* Password Setting */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Password Protection
                            </label>
                            <input
                                value={shareSettings.password}
                                onChange={(e) => handleSettingChange('password', e.target.value)}
                                placeholder="Optional password"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-5 text-gray-800"
                            />
                            <button

                            onClick={generateShareUrl}
                            className="mt-2 w-full px-4 py-2 bg-green-500 text-white rounded"
                            >
                            Confirm Settings & Generate Link
                            </button>
                        </div>

                        {/* Share URL */}
                        <div className="mt-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={shareUrl}
                                    placeholder="shareable link will appear here"
                                    readOnly
                                    className="block w-full rounded-md border-gray-300 bg-gray-50 text-start px-5 text-gray-600"
                                />
                                <button
                                    onClick={handleCopyUrl}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    {copyUrlStatus === 'copied' ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        ))}

