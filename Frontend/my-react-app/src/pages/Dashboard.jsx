import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/authApi";

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalFiles: 0,
    totalFolders: 0,
    storageUsed: 0,
  });

  const [storage, setStorage] = useState({});

  useEffect(() => {
    fetchStats();
    fetchStorage();
  }, []);

  const fetchStats = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await API.get("/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats({
        totalFiles: res.data.totalFiles,
        totalFolders: res.data.totalFolders,
        storageUsed: res.data.storageUsed,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const fetchStorage = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await API.get("/dashboard/storage", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStorage(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-8 text-slate-800 dark:text-white">
        Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Total Files</h2>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.totalFiles}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Total Folders</h2>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.totalFolders}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Storage Used</h2>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.storageUsed} MB</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8 max-w-2xl">
        <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">Storage Usage</h2>
        
        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
          <span>{storage.usedMB || 0} MB Used</span>
          <span>{storage.totalMB || 1024} MB Total</span>
        </div>

        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 mb-4 overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${storage.percentage || 0}%` }}
          ></div>
        </div>

        <p className="text-slate-600 dark:text-slate-400 font-medium">
          {storage.percentage || 0}% Used ({storage.remainingMB || 1024} MB remaining)
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => navigate("/files")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition font-medium shadow-sm"
        >
          My Files
        </button>
        <button
          onClick={() => navigate("/profile")}
          className="bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-lg transition font-medium shadow-sm"
        >
          Profile
        </button>
        <button
          onClick={() => navigate("/groups")}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg transition font-medium shadow-sm"
        >
          Groups
        </button>
      </div>
    </>
  );
}

export default Dashboard;