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

  const refreshStorageStats = async () => {
    console.log("refreshStorageStats called")
    const { data : { user } } = await supabase.auth.getUser();
    if (user) {
      await fetchStorageStats(user.id)
    }
  }

  const fetchStorageStats = async (userId: string) => {
    try {
        // Get 24hr stats from database
        console.log("Current user ID: ", userId)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // First, get ALL files without any filters to verify data exists
        const { data: allFilesNoFilter, error: noFilterError } = await supabase
            .from('files')
            .select('*');

        console.log("All files in table (no filter):", allFilesNoFilter);

        const { data: recentFiles, error: recentError } = await supabase
            .from('files')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', twentyFourHoursAgo.toISOString());

        console.log("Recent files (full data): ", recentFiles);

        if (recentError) throw recentError;

        // Get all-time stats from database
        const { data: allFiles, error: allError } = await supabase
            .from('files')
            .select('*')
            .eq('user_id', userId);

        console.log("All files: (full data) ", allFiles);

        if (allError) throw allError;

        // Calculate with detailed logging
        let totalUsage = 0;
        allFiles?.forEach(file => {
            console.log(`Adding file size: ${file.size} bytes from ${file.filename}`);
            totalUsage += file.size;
        });

        let dailyUsage = 0;
        recentFiles?.forEach(file => {
            console.log(`Adding to daily usage: ${file.size} bytes from ${file.filename}`);
            dailyUsage += file.size;
        });

        console.log(`Final calculations - Total: ${totalUsage}, Daily: ${dailyUsage}`);


        // Verify against storage bucket
        const { data: storageFiles, error: storageError } = await supabase
            .storage
            .from('uploads')
            .list(`${userId}/`);

        if (storageError) throw storageError;

        // const dailyUsage = recentFiles?.reduce((acc, file) => acc + (file.size || 0), 0) || 0;
        // const totalUsage = allFiles?.reduce((acc, file) => acc + (file.size || 0), 0) || 0;

        setStorageStats({
            used: totalUsage,
            daily: dailyUsage,
            total: 5000000000,    // 5GB total
            dailyLimit: 500000000 // 500MB daily
        });
      console.log("Calculated usage: ", { dailyUsage, totalUsage } );
    } catch (error) {
        console.error('Error fetching storage stats:', error);
    }
};


  const fetchRecentActivity = async (userId: string) => {
    try {

      // get recent file activities from Supabase table
      const { data, error } = await supabase
        .from('file_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const activities = data?.map(file => ({
        id: file.id,
        type: 'upload' as const,
        filename: file.filename,
        timestamp: file.created_at
      })) || [];

      setRecentActivity(data || []);
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Secure Send Dashboard</h1>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">

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

              <div className="mt-4 text-sm text-gray-600">
            <p>Daily upload limit: {storageStats.dailyLimit / 10000000} MB</p>
            <p>Used today: {formatBytes(storageStats.daily)}</p>
            <p className="text-xs mt-2">Daily limit resets every 24 hours</p>
            </div>
            </div>
          </div>

      {/* Recent Activity Card */}
      <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-black mb-4">Recent Activity</h2>
          <div className="space-y-2">
              {recentActivity.length === 0 ? (
                  <p className="text-gray-500">No recent activity</p>
              ) : (
                  recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className="flex-shrink-0">
                              {activity.type === 'upload' && '⬆️'}
                              {activity.type === 'download' && '⬇️'}
                              {activity.type === 'share' && '🔗'}
                          </span>
                          <span className="flex-1 truncate">
                              {activity.filename}
                          </span>
                          <span className="flex-shrink-0 text-xs text-gray-400">
                              {new Date(activity.timestamp).toLocaleString()}
                          </span>
                      </div>
                  ))
                        )}
                    </div>
                </div>
        </div>

        {/* File Upload Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-black">Upload Files</h2>
          <FileUploadSection onUploadComplete={refreshStorageStats}/>
        </div>
      </main>
    </div>
  );
}