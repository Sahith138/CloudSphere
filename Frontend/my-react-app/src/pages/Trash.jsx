import { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, RefreshCw, File as FileIcon, Folder as FolderIcon, AlertCircle } from "lucide-react";

function Trash() {
  const [trashedItems, setTrashedItems] = useState({ files: [], folders: [] });
  const [loading, setLoading] = useState(true);

  const fetchTrash = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/trash", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrashedItems({ files: res.data.files, folders: res.data.folders });
    } catch (error) {
      console.error("Error fetching trash:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id, type) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/trash/restore",
        { id, type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTrash();
    } catch (error) {
      console.error("Error restoring item:", error);
    }
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm("Are you sure you want to permanently delete all items in the trash? This cannot be undone.")) return;
    
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete("http://localhost:5000/api/trash/empty", {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTrash();
    } catch (error) {
      console.error("Error emptying trash:", error);
    }
  };

  const hasItems = trashedItems.files.length > 0 || trashedItems.folders.length > 0;

  return (
    <>
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Trash2 className="text-slate-500" /> Trash
              </h1>
              {hasItems && (
                <button
                  onClick={handleEmptyTrash}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <AlertCircle size={18} /> Empty Trash
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center mt-20">
                <RefreshCw className="animate-spin text-blue-500" size={32} />
              </div>
            ) : !hasItems ? (
              <div className="text-center mt-20 text-slate-500 dark:text-slate-400">
                <Trash2 size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Trash is empty</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Name</th>
                      <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Type</th>
                      <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Deleted At</th>
                      <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {trashedItems.folders.map((folder) => (
                      <tr key={`folder-${folder.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4 flex items-center gap-3 text-slate-800 dark:text-slate-200">
                          <FolderIcon className="text-blue-500" size={20} />
                          {folder.name}
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">Folder</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          {new Date(folder.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleRestore(folder.id, 'folder')}
                            className="text-blue-500 hover:text-blue-600 font-medium"
                          >
                            Restore
                          </button>
                        </td>
                      </tr>
                    ))}
                    {trashedItems.files.map((file) => (
                      <tr key={`file-${file.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4 flex items-center gap-3 text-slate-800 dark:text-slate-200">
                          <FileIcon className="text-blue-400" size={20} />
                          {file.name}
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">File</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          {new Date(file.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleRestore(file.id, 'file')}
                            className="text-blue-500 hover:text-blue-600 font-medium"
                          >
                            Restore
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </div>
    </>
  );
}

export default Trash;
