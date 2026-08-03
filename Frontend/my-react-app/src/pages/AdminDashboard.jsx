import { useState, useEffect } from "react";
import API from "../api/authApi";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGroups: 0,
    totalFiles: 0,
    storageUsed: "0 GB",
    recentActivity: []
  });
  const [users, setUsers] = useState([]);
  const [updatingQuota, setUpdatingQuota] = useState(null);

  useEffect(() => {
    fetchAdminStats();
    fetchUsers();
  }, []);

  const fetchAdminStats = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await API.get("/dashboard/admin", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setStats(res.data);
        }
    } catch (error) {
      console.error("Failed to load admin stats", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await API.get("/dashboard/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (error) {
      console.error("Failed to load users", error);
    }
  };

  const handleQuotaChange = async (userId, newQuotaGB) => {
    try {
      setUpdatingQuota(userId);
      const token = sessionStorage.getItem("token");
      const quotaBytes = newQuotaGB * 1024 * 1024 * 1024;
      await API.put(`/dashboard/admin/users/${userId}/quota`, { quotaBytes }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error("Failed to update quota", error);
    } finally {
      setUpdatingQuota(null);
    }
  };
  return (
    <>
          <h1 className="text-3xl font-bold mb-8 text-slate-800 dark:text-white">
            Admin Dashboard
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Total Users</h3>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.totalUsers}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Total Groups</h3>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.totalGroups}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Total Files</h3>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.totalFiles}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Storage Used</h3>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.storageUsed}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-4xl">
            <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">
              Recent Activity
            </h2>

            <div className="space-y-4">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                    <p className="text-slate-800 dark:text-slate-200">
                      <span className="font-medium text-blue-600 dark:text-blue-400">{activity.user?.name || "System"}</span> {activity.details.toLowerCase()}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(activity.createdAt).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 dark:text-slate-400 p-4">No recent activity.</p>
              )}
            </div>
          </div>

          {/* User Management Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mt-8 max-w-4xl">
            <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">
              User Management
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4 font-medium">User</th>
                    <th className="py-3 px-4 font-medium">Email</th>
                    <th className="py-3 px-4 font-medium">Storage Used</th>
                    <th className="py-3 px-4 font-medium">Storage Quota</th>
                    <th className="py-3 px-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="py-4 px-4 text-slate-800 dark:text-slate-200 font-medium">{u.name}</td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{u.usedMB} MB</td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                        {(u.storageQuota / 1024 / 1024 / 1024).toFixed(0)} GB
                      </td>
                      <td className="py-4 px-4">
                        <select 
                          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded px-3 py-1 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          disabled={updatingQuota === u.id}
                          value={(u.storageQuota / 1024 / 1024 / 1024).toFixed(0)}
                          onChange={(e) => handleQuotaChange(u.id, Number(e.target.value))}
                        >
                          <option value="1">1 GB (Basic)</option>
                          <option value="5">5 GB (Pro)</option>
                          <option value="10">10 GB (Team)</option>
                          <option value="50">50 GB (Enterprise)</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-4 text-center text-slate-500">Loading users...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

    </>
  );
}

export default AdminDashboard;