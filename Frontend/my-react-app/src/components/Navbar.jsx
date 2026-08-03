import { Bell, Search, Check, Menu } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import API from "../api/authApi";

function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  const user = JSON.parse(localStorage.getItem("user")) || {};

  // Live Search States
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await API.get("/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, searchRef]);

  // Live Search Effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (search.trim()) {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await API.get(`/files/search?name=${search}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            setSearchResults(res.data.files);
            setShowSearchDropdown(true);
          }
        } catch (error) {
          console.error("Live search failed:", error);
        }
      }, 300); // Debounce 300ms
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
    
    return () => clearTimeout(searchTimeoutRef.current);
  }, [search]);

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
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
    <div className="bg-white dark:bg-slate-900 shadow h-16 flex items-center justify-between px-4 md:px-6 relative z-10 border-b border-slate-200 dark:border-slate-800">
      
      <div className="flex items-center gap-2 sm:gap-3 flex-1 md:flex-none md:w-auto">
        {/* Hamburger Menu (Mobile Only) */}
        <button 
          onClick={toggleSidebar}
          className="md:hidden text-slate-600 dark:text-slate-300 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <Menu size={24} />
        </button>

        <div className="relative flex-1 md:w-80 min-w-[120px]" ref={searchRef}>
        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus-within:ring-2 focus-within:ring-blue-500 transition">
          <button onClick={() => { search && navigate(`/search?q=${search}`); setShowSearchDropdown(false); }} className="text-slate-400 hover:text-blue-500 transition focus:outline-none">
            <Search size={18} />
          </button>
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => { if(search.trim()) setShowSearchDropdown(true); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && search) {
                setShowSearchDropdown(false);
                navigate(`/search?q=${search}`);
              }
            }}
            className="ml-2 outline-none w-full bg-transparent placeholder-slate-400"
          />
        </div>

        {/* Live Search Dropdown */}
        {showSearchDropdown && search.trim() !== "" && (
          <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden transform origin-top transition-all max-h-80 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                  Files
                </div>
                {searchResults.slice(0, 5).map(file => (
                  <Link 
                    key={file.id} 
                    to="/files" 
                    onClick={() => setShowSearchDropdown(false)}
                    className="flex flex-col px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0"
                  >
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{file.name}</span>
                    <span className="text-xs text-slate-400">{(Number(file.size) / 1024 / 1024).toFixed(2)} MB</span>
                  </Link>
                ))}
                {searchResults.length > 5 && (
                  <button
                    onClick={() => { setShowSearchDropdown(false); navigate(`/search?q=${search}`); }}
                    className="w-full text-center py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    View all {searchResults.length} results
                  </button>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                No files found for "{search}"
              </div>
            )}
          </div>
        )}
      </div>
      </div> {/* Closes the search + hamburger wrapper */}

      <div className="flex items-center gap-2 md:gap-4 ml-2">
        
        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-white dark:border-slate-900">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden transform origin-top-right transition-all">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-semibold text-slate-800 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-medium flex items-center gap-1 transition">
                    <Check size={14} /> Mark all read
                  </button>
                )}
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm">
                    No new notifications
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {notifications.map(item => (
                      <div key={item.id} className={`p-4 transition ${!item.isRead ? 'bg-blue-50/50 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-sm ${!item.isRead ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>
                            {item.message}
                          </p>
                          {!item.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1 ml-2"></span>}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded uppercase">
                            {item.type.replace("_", " ")}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <ThemeToggle />

        <Link to="/profile">
          <img
            src={`https://ui-avatars.com/api/?name=${user.name || "User"}&background=2563eb&color=fff&rounded=true&size=40`}
            alt="avatar"
            className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 cursor-pointer hover:ring-2 hover:ring-blue-500 transition"
          />
        </Link>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;