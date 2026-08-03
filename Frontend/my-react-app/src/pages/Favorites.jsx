import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import axios from "axios";
import { Star, RefreshCw, File as FileIcon, Folder as FolderIcon } from "lucide-react";
import API from "../api/authApi";

function Favorites() {
  const [favorites, setFavorites] = useState({ files: [], folders: [] });
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await API.get("/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites({ files: res.data.files, folders: res.data.folders });
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const toggleFavoriteFolder = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      await API.put(`/favorites/folder/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFavorites();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const toggleFavoriteFile = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      await API.put(`/favorites/file/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFavorites();
    } catch (error) {
      console.error("Error toggling favorite:", error);
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

  const hasItems = favorites.files.length > 0 || favorites.folders.length > 0;

  return (
    <>
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Star className="text-yellow-500 fill-yellow-500" /> Favorites
              </h1>
            </div>

            {loading ? (
              <div className="flex justify-center mt-20">
                <RefreshCw className="animate-spin text-blue-500" size={32} />
              </div>
            ) : !hasItems ? (
              <div className="text-center mt-20 text-slate-500 dark:text-slate-400">
                <Star size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">No favorites added yet.</p>
                <p className="text-sm mt-2">Star files and folders to see them here.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Name</th>
                      <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Type</th>
                      <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Created At</th>
                      <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {favorites.folders.map((folder) => (
                      <tr key={`folder-${folder.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4 flex items-center gap-3 text-slate-800 dark:text-slate-200">
                          <button onClick={() => toggleFavoriteFolder(folder.id)} className="text-yellow-500">
                            <Star size={18} className="fill-yellow-500" />
                          </button>
                          <FolderIcon className="text-blue-500" size={20} />
                          {folder.name}
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">Folder</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          {new Date(folder.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-slate-400 text-sm italic">N/A</span>
                        </td>
                      </tr>
                    ))}
                    {favorites.files.map((file) => (
                      <tr key={`file-${file.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4 flex items-center gap-3 text-slate-800 dark:text-slate-200">
                          <button onClick={() => toggleFavoriteFile(file.id)} className="text-yellow-500">
                            <Star size={18} className="fill-yellow-500" />
                          </button>
                          <FileIcon className="text-blue-400" size={20} />
                          {file.name}
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          {file.name.split('.').pop().toUpperCase()}
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          {new Date(file.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => downloadFile(file.id, file.name)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
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
        </>
  );
}

export default Favorites;
