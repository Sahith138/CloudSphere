import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/authApi";
import { RefreshCw, Upload, Users, Activity, FileText, UserPlus, Settings, Star } from "lucide-react";

function GroupWorkspace() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("files");
  const [groupDetails, setGroupDetails] = useState(null);
  const [files, setFiles] = useState([]);
  const [members, setMembers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRole, setMyRole] = useState("VIEWER");
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewFileObj, setPreviewFileObj] = useState(null);

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      
      const groupsRes = await API.get("/groups/my-groups", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const currentGroup = groupsRes.data.groups.find(g => g.id === Number(groupId));
      
      if (!currentGroup) {
        navigate("/groups");
        return;
      }
      
      setGroupDetails(currentGroup);
      setMyRole(currentGroup.myRole);

      await fetchFiles();
      await fetchMembers();
      await fetchActivity();
      
    } catch (error) {
      console.error("Error fetching group data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    const token = sessionStorage.getItem("token");
    const res = await API.get(`/groups/${groupId}/files`, { headers: { Authorization: `Bearer ${token}` } });
    setFiles(res.data.files);
  };

  const fetchMembers = async () => {
    const token = sessionStorage.getItem("token");
    const res = await API.get(`/groups/${groupId}/members`, { headers: { Authorization: `Bearer ${token}` } });
    setMembers(res.data.members);
  };

  const fetchActivity = async () => {
    const token = sessionStorage.getItem("token");
    const res = await API.get(`/groups/${groupId}/activity`, { headers: { Authorization: `Bearer ${token}` } });
    setActivities(res.data.activities);
  };

  const handleInvite = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await API.post(`/groups/${groupId}/invite`, { email: inviteEmail }, { headers: { Authorization: `Bearer ${token}` } });
      alert(response.data.message || "Invitation sent successfully");
      setShowInviteModal(false);
      setInviteEmail("");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send invitation");
    }
  };

  const changeRole = async (memberId, newRole) => {
    try {
      const token = sessionStorage.getItem("token");
      await API.put(`/groups/${groupId}/members/${memberId}/role`, { role: newRole }, { headers: { Authorization: `Bearer ${token}` } });
      fetchMembers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to change role");
    }
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    try {
      const token = sessionStorage.getItem("token");
      
      const fileMetadata = selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type }));
      
      const presignedRes = await API.post(
        "/files/upload-presigned-urls",
        { files: fileMetadata },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { presignedUrls } = presignedRes.data;

      const uploadPromises = selectedFiles.map(async (file, index) => {
        const { uploadUrl, fileUrl } = presignedUrls[index];
        const res = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
        });
        if (!res.ok) throw new Error("S3 Upload Failed");
        return {
          name: file.name,
          size: file.size,
          fileUrl: fileUrl
        };
      });

      const uploadedFilesMetadata = await Promise.all(uploadPromises);

      await API.post(
        "/files/upload-confirm",
        {
          files: uploadedFilesMetadata,
          groupId: groupId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedFiles([]);
      fetchFiles();
      fetchActivity();
      toast.success("Files uploaded directly successfully ⚡");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to upload files");
    } finally {
      setUploading(false);
    }
  };

  const downloadFile = async (id, fileName) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await API.get(`/files/download/${id}`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Download failed");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center h-full">
        <RefreshCw className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                {groupDetails?.name}
                <span className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  My Role: {myRole}
                </span>
              </h1>
              <p className="text-slate-500 mt-2">{groupDetails?.description}</p>
            </div>
            
            {myRole === "OWNER" && (
              <button 
                onClick={() => setShowInviteModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <UserPlus size={18} /> Invite Member
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 pb-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <button 
              onClick={() => setActiveTab("files")} 
              className={`px-4 py-2 font-medium rounded-t-lg flex items-center gap-2 transition ${activeTab === "files" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-slate-800" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
            >
              <FileText size={18} /> Files
            </button>
            <button 
              onClick={() => setActiveTab("members")} 
              className={`px-4 py-2 font-medium rounded-t-lg flex items-center gap-2 transition ${activeTab === "members" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-slate-800" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
            >
              <Users size={18} /> Members
            </button>
            <button 
              onClick={() => setActiveTab("activity")} 
              className={`px-4 py-2 font-medium rounded-t-lg flex items-center gap-2 transition ${activeTab === "activity" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-slate-800" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
            >
              <Activity size={18} /> Activity
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            
            {activeTab === "files" && (
              <div>
                {(myRole === "OWNER" || myRole === "EDITOR") && (
                  <div 
                    className={`border-2 border-dashed ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 dark:border-slate-700'} p-8 text-center rounded-xl mb-8 transition-colors`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      setSelectedFiles(Array.from(e.dataTransfer.files));
                    }}
                  >
                    <Upload size={32} className="mx-auto text-slate-400 mb-3" />
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      id="group-file-upload"
                      onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                    />
                    <label htmlFor="group-file-upload" className="cursor-pointer text-blue-600 font-semibold hover:underline">
                      Click to browse
                    </label>
                    <span className="text-slate-500 dark:text-slate-400"> or drag and drop files to group workspace</span>

                    {selectedFiles.length > 0 && (
                      <div className="mt-4 flex flex-col items-center">
                        <p className="text-sm font-medium mb-2">{selectedFiles.length} file(s) selected</p>
                        <button 
                          onClick={uploadFiles} 
                          disabled={uploading}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition"
                        >
                          {uploading ? "Uploading..." : "Upload Files"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Workspace Files</h3>
                {files.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No files in this workspace yet.</p>
                ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="px-4 py-3 text-slate-600 dark:text-slate-300">Name</th>
                        <th className="px-4 py-3 text-slate-600 dark:text-slate-300">Size</th>
                        <th className="px-4 py-3 text-slate-600 dark:text-slate-300 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {files.map(file => (
                        <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-3 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                            <FileText size={16} className="text-blue-500" />
                            {file.name}
                          </td>
                          <td className="px-4 py-3 text-slate-500">{(Number(file.size)/1024/1024).toFixed(2)} MB</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => setPreviewFileObj(file)} className="text-green-600 hover:text-green-800 font-medium text-sm transition mr-4">Preview</button>
                            <button 
                              onClick={() => downloadFile(file.id, file.name)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm transition"
                            >
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
              </div>
            )}

            {activeTab === "members" && (
              <div>
                <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-slate-600 dark:text-slate-300">Name</th>
                      <th className="px-4 py-3 text-slate-600 dark:text-slate-300">Role</th>
                      {myRole === "OWNER" && <th className="px-4 py-3 text-slate-600 dark:text-slate-300 text-right">Change Role</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {members.map(member => (
                      <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-4 text-slate-800 dark:text-slate-200 font-medium">
                          {member.user.name} <span className="text-slate-400 text-sm ml-2 font-normal">({member.user.email})</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            member.role === 'OWNER' ? 'bg-purple-100 text-purple-700' :
                            member.role === 'EDITOR' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {member.role}
                          </span>
                        </td>
                        {myRole === "OWNER" && (
                          <td className="px-4 py-4 text-right">
                            {member.role !== "OWNER" && (
                              <select 
                                value={member.role}
                                onChange={(e) => changeRole(member.id, e.target.value)}
                                className="border border-slate-300 rounded px-2 py-1 text-sm bg-white cursor-pointer hover:border-blue-500 transition"
                              >
                                <option value="EDITOR">Editor</option>
                                <option value="VIEWER">Viewer</option>
                              </select>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No activity recorded yet.</p>
                ) : (
                  activities.map(act => (
                    <div key={act.id} className="flex gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/30">
                      <div className="mt-1">
                        <Activity className="text-blue-500" size={20} />
                      </div>
                      <div>
                        <p className="text-slate-800 dark:text-slate-200 font-medium">{act.user.name} <span className="text-slate-500 font-normal">{act.details}</span></p>
                        <p className="text-slate-400 text-xs mt-1">{new Date(act.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        {previewFileObj && <PreviewModal file={previewFileObj} onClose={() => setPreviewFileObj(null)} />}
        {showInviteModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Invite Member</h2>
              
              <input
                type="email"
                placeholder="User Email Address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 p-3 rounded-lg mb-6 bg-slate-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg disabled:opacity-50 transition"
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
}

export default GroupWorkspace;