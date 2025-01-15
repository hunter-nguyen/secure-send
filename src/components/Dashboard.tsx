"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import FileUploadSection from '@/components/FileUploadSection';

interface StorageStats {
  used: number;
  daily: number;
  total: number;
  dailyLimit: number;
}

interface RecentActivity {
  id: string;
  type: 'upload' | 'download' | 'share';
  filename: string;
  timestamp: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [storageStats, setStorageStats] = useState<StorageStats>({
    used: 0,
    daily: 0,
    total: 5000000000, // 5 GB
    dailyLimit: 500000000 // 500 MB
  }); // 5GB default
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        // Fetch storage stats and recent activity
        await fetchStorageStats(user.id);
        await fetchRecentActivity(user.id);
      }
    };

    checkUser();
  }, [router]);

  const fetchStorageStats = async (userId: string) => {
    try {
        // Get 24hr stats from database
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const { data: recentFiles, error: recentError } = await supabase
            .from('files')
            .select('size')
            .eq('user_id', userId)
            .gte('created_at', twentyFourHoursAgo.toISOString());

        if (recentError) throw recentError;

        // Get all-time stats from database
        const { data: allFiles, error: allError } = await supabase
            .from('files')
            .select('size')
            .eq('user_id', userId);

        if (allError) throw allError;

        // Verify against storage bucket
        const { data: storageFiles, error: storageError } = await supabase
            .storage
            .from('uploads')
            .list(`${userId}/`);

        if (storageError) throw storageError;

        const dailyUsage = recentFiles?.reduce((acc, file) => acc + (file.size || 0), 0) || 0;
        const totalUsage = allFiles?.reduce((acc, file) => acc + (file.size || 0), 0) || 0;

        setStorageStats({
            used: totalUsage,
            daily: dailyUsage,
            total: 5000000000,    // 5GB total
            dailyLimit: 500000000 // 500MB daily
        });
    } catch (error) {
        console.error('Error fetching storage stats:', error);
    }
};


  const fetchRecentActivity = async (userId: string) => {
    try {

      // get recent file activities from Supabase table
      const { data, error } = await supabase
        .from('file_activities')
        .select('id, filename, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error;

      const activities = data?.map(file => ({
        id: file.id,
        type: 'upload' as const,
        filename: file.filename,
        timestamp: file.created_at
      })) || [];

      setRecentActivity(activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Secure Send Dashboard</h1>
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Storage Usage Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-black">Storage Usage</h2>
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded">
                <div
                  className="h-2 bg-blue-500 rounded"
                  style={{ width: `${(storageStats.used / storageStats.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                {formatBytes(storageStats.used)} of {formatBytes(storageStats.total)} used
              </p>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                New File Upload
              </button>
              <button className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                View Your Uploaded Files
              </button>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-black">Recent Activity</h2>
            <div className="space-y-2">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="text-sm text-gray-600">
                  {activity.type === 'upload' && '⬆️'}
                  {activity.type === 'download' && '⬇️'}
                  {activity.type === 'share' && '🔗'}
                  {' '}{activity.filename}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-black">Upload Files</h2>
          <FileUploadSection/>
        </div>
      </main>
    </div>
  );
}