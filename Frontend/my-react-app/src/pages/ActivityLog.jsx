import { useState, useEffect } from "react";
import API from "../api/authApi";
import { Activity, RefreshCw, Clock } from "lucide-react";

function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await API.get("/activity", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data.logs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <>
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Activity className="text-blue-500" /> Activity Log
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Track all recent actions in your workspace.</p>
            </div>

            {loading ? (
              <div className="flex justify-center mt-20">
                <RefreshCw className="animate-spin text-blue-500" size={32} />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center mt-20 text-slate-500 dark:text-slate-400">
                <Clock size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">No activity recorded yet.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                  {logs.map((log) => (
                    <li key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mt-1">
                          <Activity size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-800 dark:text-slate-200 font-medium">
                            {log.details}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 dark:text-slate-400">
                            <span className="font-semibold">{log.action}</span>
                            <span>•</span>
                            <time dateTime={log.createdAt}>
                              {new Date(log.createdAt).toLocaleString()}
                            </time>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
  );
}

export default ActivityLog;
