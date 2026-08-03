import { useState, useEffect } from "react";
import API from "../api/authApi";

function StorageAnalytics() {
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalFolders: 0,
    storageUsed: 0,
    largestFile: "N/A",
    groupsJoined: 0
  });
  
  const [storageDetails, setStorageDetails] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await API.get("/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
        
        const storageRes = await API.get("/dashboard/storage", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStorageDetails(storageRes.data);
      } catch (error) {
        console.error("Failed to load stats", error);
      }
    };
    fetchStats();
  }, []);
  return (
    <>
          <h1 className="text-3xl font-bold mb-8 text-slate-800 dark:text-white">
            Storage Analytics
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Total Files</h3>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.totalFiles}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Storage Used</h3>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.storageUsed} MB</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Largest File</h3>
              <p className="text-xl font-semibold text-slate-800 dark:text-slate-100 mt-2 truncate" title={stats.largestFile}>{stats.largestFile}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Groups Joined</h3>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.groupsJoined}</p>
            </div>
          </div>

          {/* Storage Progress Bar */}
          {storageDetails && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-4xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Storage Quota</h2>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {storageDetails.usedMB} MB / {(storageDetails.totalMB / 1024).toFixed(2)} GB
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 mb-2 overflow-hidden border border-slate-200 dark:border-slate-700">
                <div
                  className={`h-4 rounded-full transition-all duration-500 ${Number(storageDetails.percentage) > 90 ? 'bg-red-500' : 'bg-blue-600 dark:bg-blue-500'}`}
                  style={{ width: `${Math.min(storageDetails.percentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {storageDetails.percentage}% used. You have {storageDetails.remainingMB} MB remaining.
              </p>
            </div>
          )}
        </>
  );
}

export default StorageAnalytics;