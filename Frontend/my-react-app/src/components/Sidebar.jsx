import { Home, Folder, Users, Bell, User, Trash2, Activity, Star, X } from "lucide-react";
import { Link } from "react-router-dom";

function Sidebar({ closeMobileMenu }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  return (
    <div className="w-64 h-full bg-slate-900 text-white p-5 flex flex-col shadow-2xl md:shadow-none">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-bold">CloudSphere</h1>
        {/* Mobile Close Button */}
        <button 
          onClick={closeMobileMenu} 
          className="md:hidden text-slate-400 hover:text-white transition p-1"
        >
          <X size={24} />
        </button>
      </div>

      <ul className="space-y-6 flex-1 overflow-y-auto">
        <li>
          <Link to="/dashboard" className="flex items-center gap-3 cursor-pointer hover:text-blue-400">
            <Home size={20} /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/files" className="flex items-center gap-3 cursor-pointer hover:text-blue-400">
            <Folder size={20} />My Files
          </Link>
        </li>
        <li>
          <Link to="/favorites" className="flex items-center gap-3 cursor-pointer hover:text-blue-400">
            <Star size={20} className="text-yellow-500 fill-yellow-500" /> Favorites
          </Link>
        </li>
        <li>
          <Link to="/groups" className="flex items-center gap-3 cursor-pointer hover:text-blue-400">
            <Users size={20} /> Groups
          </Link>
        </li>
        <li>
          <Link to="/profile" className="flex items-center gap-3 cursor-pointer hover:text-blue-400">
            <User size={20} /> Profile
          </Link>
          </li>
          <li>
          <Link to="/invitations">
            Invitations
          </Link>
          </li>
          <li>
          <Link to="/storage">
            Storage
          </Link>
          </li>
          
          {user?.isAdmin && (
            <li>
              <Link to="/admin" className="flex items-center gap-3 cursor-pointer hover:text-blue-400">
                Admin
              </Link>
            </li>
          )}

        <li>
          <Link to="/trash" className="flex items-center gap-3 cursor-pointer hover:text-blue-400">
            <Trash2 size={20} /> Trash
          </Link>
        </li>
        <li>
          <Link to="/activity" className="flex items-center gap-3 cursor-pointer hover:text-blue-400">
            <Activity size={20} /> Activity Log
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;