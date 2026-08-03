import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import API from "../api/authApi";
import { Check, X, RefreshCw } from "lucide-react";

function Invitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvitations = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/groups/invitations", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvitations(res.data.invitations);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleInvitation = async (id, action) => {
    try {
      const token = localStorage.getItem("token");
      await API.put(`/groups/invitations/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchInvitations();
    } catch (error) {
      console.error(`Error ${action}ing invitation:`, error);
      toast.error(`Failed to ${action} invitation`);
    }
  };

  return (
    <>
          <h1 className="text-3xl font-bold mb-8 text-slate-800 dark:text-white">Group Invitations</h1>

          {loading ? (
            <div className="flex justify-center mt-20">
              <RefreshCw className="animate-spin text-blue-500" size={32} />
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center mt-20 bg-white dark:bg-slate-900 p-10 rounded-xl shadow-sm max-w-md mx-auto">
              <p className="text-slate-500 text-lg">No pending invitations.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {invitations.map((inv) => (
                <div key={inv.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                  <h2 className="text-xl font-semibold mb-2 text-slate-800 dark:text-white">
                    {inv.group.name}
                  </h2>
                  <p className="text-slate-500 text-sm mb-6">
                    Invited by User ID: {inv.inviterId}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleInvitation(inv.id, 'accept')}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition"
                    >
                      <Check size={18} /> Accept
                    </button>
                    <button
                      onClick={() => handleInvitation(inv.id, 'reject')}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-red-600 transition"
                    >
                      <X size={18} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
  );
}

export default Invitations;