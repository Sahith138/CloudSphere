import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../api/authApi";
import { Bell, Check, RefreshCw } from "lucide-react";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const res = await API.get("/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      const token = sessionStorage.getItem("token");
      await API.put("/notifications/mark-read", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <Bell className="text-blue-500" /> Notifications
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-semibold">
                  {unreadCount} Unread
                </span>
              )}
            </h1>

            {unreadCount > 0 && (
              <button 
                onClick={markAllRead}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <Check size={18} /> Mark All Read
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center mt-20">
              <RefreshCw className="animate-spin text-blue-500" size={32} />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center mt-20 p-10">
              <Bell className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-500 text-lg">You have no notifications.</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-xl shadow-sm border flex items-start gap-4 transition ${
                    !item.isRead 
                      ? 'bg-blue-50 border-blue-200 dark:bg-slate-800 dark:border-blue-900/50' 
                      : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800'
                  }`}
                >
                  <div className={`mt-1 ${!item.isRead ? 'text-blue-600' : 'text-slate-400'}`}>
                    <Bell size={20} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-lg ${!item.isRead ? 'font-semibold text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                      {item.message}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded uppercase">
                        {item.type.replace("_", " ")}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {!item.isRead && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Notifications;