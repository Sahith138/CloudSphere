import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { Link } from "react-router-dom";
import API from "../api/authApi";

function Groups() {
  const [showModal, setShowModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/groups/my-groups", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(res.data.groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const createGroup = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.post("/groups/create", { name, description }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setName("");
      setDescription("");
      fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    }
  };

  return (
    <>
          <div className="flex justify-between mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Groups</h1>

            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Create Group
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Link
                to={`/group-workspace/${group.id}`}
                key={group.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 block hover:shadow-md hover:scale-[1.02] transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                    {group.name}
                  </h2>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    group.myRole === 'OWNER' ? 'bg-purple-100 text-purple-700' :
                    group.myRole === 'EDITOR' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {group.myRole}
                  </span>
                </div>

                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                  {group.description || "No description provided."}
                </p>

                <div className="flex justify-between text-xs text-slate-400">
                  <span>Created: {new Date(group.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
            
            {groups.length === 0 && (
              <div className="col-span-full text-center py-20">
                <p className="text-slate-500 text-lg">You haven't joined any groups yet.</p>
              </div>
            )}
          </div>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">
                Create New Group
              </h2>

              <input
                type="text"
                placeholder="Group Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 p-3 rounded-lg mb-4 bg-slate-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              />

              <textarea
                placeholder="Group Description (Optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 p-3 rounded-lg mb-6 bg-slate-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                rows="4"
              />

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createGroup}
                  disabled={!name.trim()}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Create Group
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
}

export default Groups;