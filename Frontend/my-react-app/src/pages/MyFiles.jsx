import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { Star, Sparkles, Eye, Download, Trash2, Share2, Edit2, FolderInput, FileText, Image as ImageIcon, FileQuestion, FileBadge2, Video } from "lucide-react";
import API from "../api/authApi";
import PreviewModal from "../components/PreviewModal";
import AIModal from "../components/AIModal";

function MyFiles() {
  const [showUpload, setShowUpload] = useState(false);
  const [folders, setFolders] = useState([]);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("createdAt_desc");
  const [type, setType] = useState("all");
  const [previewFileObj, setPreviewFileObj] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameFileId, setRenameFileId] = useState(null);
  const [newFileName, setNewFileName] = useState("");
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiSelectedFile, setAiSelectedFile] = useState(null);
  const [showRenameFolderModal, setShowRenameFolderModal] = useState(false);
  const [renameFolderId, setRenameFolderId] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
  fetchFolders();
  fetchFiles();
}, [sort, type]);

  const fetchFolders = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const res = await API.get(`/folders/my-folders?sort=${sort}&type=${type}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFolders(res.data.folders);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchFiles = async () => {
  try {
    const token = sessionStorage.getItem("token");

    const res = await API.get(`/files/my-files?sort=${sort}&type=${type}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setFiles(res.data.files);
  } catch (error) {
    console.log(error);
  }
};

  const createFolder = async () => {
    try {
      if (!folderName.trim()) {
        toast.success("Please enter folder name");
        return;
      }

      const token = sessionStorage.getItem("token");

      await API.post(
        "/folders/create",
        {
          name: folderName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFolderName("");
      setShowFolderModal(false);

      fetchFolders();
    } catch (error) {
      console.log(error);
      toast.error("Failed to create folder");
    }
  };
  const deleteFolder = async (id) => {
  try {
    const token = sessionStorage.getItem("token");

    await API.delete(
      `/folders/delete/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    fetchFolders();
  } catch (error) {
    console.log(error);
    toast.error("Failed to delete folder");
  }
};
  const uploadFile = async () => {
    try {
      if (!selectedFiles || selectedFiles.length === 0) {
        toast.success("Please select at least one file");
        return;
      }

      const token = sessionStorage.getItem("token");

      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append("files", file);
      });
      formData.append(
        "folderId",
        selectedFolder ? selectedFolder.id : ""
      );

      const res = await API.post(
        "/files/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(res.data);

      toast.success("Files uploaded successfully");
      fetchFiles();

      setSelectedFiles([]);
      setShowUpload(false);
    } catch (error) {
      console.log(error);
      toast.error("Upload failed");
    }
  };

  const toggleFavoriteFolder = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      await API.put(`/favorites/folder/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFolders();
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
      fetchFiles();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };
const openFolder = async (folder) => {
  try {
    const token = sessionStorage.getItem("token");

    const res = await API.get(
      `/files/folder/${folder.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setFiles(res.data.files);
    setSelectedFolder(folder);
  } catch (error) {
    console.log(error);
  }
};
const downloadFile = async (id, fileName) => {
  try {
    const token = sessionStorage.getItem("token");

    const response = await API.get(
      `/files/download/${id}`,
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

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
    console.log(error);
    toast.error("Download failed");
  }
};
const deleteFile = async (id) => {
  try {
    const token = sessionStorage.getItem("token");

    await API.delete(
      `/files/delete/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success("File deleted");

    fetchFiles();

  } catch (error) {
    console.log(error);
    toast.error("Delete failed");
  }
};
const moveFile = async (fileId, folderId) => {
  try {
    const token = sessionStorage.getItem("token");

    await API.put(
      `/files/move/${fileId}`,
      {
        folderId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success("File moved successfully");

    fetchFiles();

  } catch (error) {
    console.log(error);
    toast.error("Failed to move file");
  }
};
const searchFiles = async (value) => {
  setSearch(value);

  try {
    const token = sessionStorage.getItem("token");

    if (value === "") {
      fetchFiles();
      return;
    }

    const res = await API.get(
      `/files/search?name=${value}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setFiles(res.data.files);

  } catch (error) {
    console.log(error);
  }
};
const previewFile = (file) => { setPreviewFileObj(file); };
const shareFile = async (id) => {

  try {

    const token = sessionStorage.getItem("token");

    const res = await API.put(
      `/files/share/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    navigator.clipboard.writeText(res.data.link);

    toast.success("Share link copied!");

  } catch (error) {
    console.log(error);
  }

};
const renameFile = async () => {
  try {

    const token = sessionStorage.getItem("token");

    await API.put(
      `/files/rename/${renameFileId}`,
      {
        name: newFileName,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success("File renamed successfully");

    setShowRenameModal(false);
    setNewFileName("");
    fetchFiles();

  } catch (error) {

    console.log(error);
    toast.error("Rename failed");

  }
};
const renameFolder = async () => {
  try {

    const token = sessionStorage.getItem("token");

    await API.put(
      `/folders/rename/${renameFolderId}`,
      {
        name: newFolderName,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success("Folder renamed successfully");

    setShowRenameFolderModal(false);

    setNewFolderName("");

    fetchFolders();

  } catch (error) {

    console.log(error);

    toast.error("Rename failed");

  }
};
  return (
    <>

      {/* Header */}

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
          My Files
        </h1>
        {selectedFolder && (
        <h2 className="text-2xl font-bold mb-4">
        📁 {selectedFolder.name}
        </h2>
      )}
      {selectedFolder && (
  <button
    onClick={() => {
      setSelectedFolder(null);
      fetchFiles();
    }}
    className="mb-4 bg-gray-700 text-white px-4 py-2 rounded"
  >
    ← Show All Files
  </button>
)}

        <div className="flex gap-3">
          <button
            onClick={() => setShowFolderModal(true)}
            className="bg-green-600 text-white px-5 py-2 rounded-lg transition hover:bg-green-700"
          >
            Create Folder
          </button>

          <button
            onClick={() => setShowUpload(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg transition hover:bg-blue-700"
          >
            Upload File
          </button>
        </div>
      </div>

      {/* Folder Section */}

      <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">
        My Folders
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {folders.length > 0 ? (
          folders.map((folder) => (
  <div
    key={folder.id}
    onClick={() => openFolder(folder)}
    className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between cursor-pointer hover:shadow-md hover:scale-[1.02] transition"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">📁</span>
        <span className="font-medium text-slate-800 dark:text-slate-200">{folder.name}</span>
      </div>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          toggleFavoriteFolder(folder.id);
        }}
        className="text-yellow-500 p-1 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-full transition"
      >
        <Star size={20} className={folder.isFavorite ? "fill-yellow-500" : ""} />
      </button>
    </div>

    <div className="flex gap-2 mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setRenameFolderId(folder.id);
          setNewFolderName(folder.name);
          setShowRenameFolderModal(true);
        }}
        className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 py-1.5 rounded-lg text-sm font-medium transition"
      >
        Rename
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteFolder(folder.id);
        }}
        className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 py-1.5 rounded-lg text-sm font-medium transition"
      >
        Delete
      </button>
    </div>
  </div>
    ))
  ) : (
    <p>No folders found</p>
  )}
  </div>

      {/* Files Table */}
      <div className="mb-6">
  <input
    type="text"
    placeholder="🔍 Search files..."
    value={search}
    onChange={(e) => searchFiles(e.target.value)}
    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
  />
</div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
            Recent Files
          </h2>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="flex-1 sm:flex-none border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:text-white"
            >
              <option value="createdAt_desc">Date (Newest)</option>
              <option value="createdAt_asc">Date (Oldest)</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="size_desc">Size (Largest)</option>
              <option value="size_asc">Size (Smallest)</option>
            </select>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="flex-1 sm:flex-none border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="pdf">PDFs</option>
              <option value="doc">Documents</option>
              <option value="video">Videos</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
        <table className="w-full text-left text-slate-800 dark:text-slate-200 min-w-[800px]">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
              <th className="py-4 px-4 font-semibold">Name</th>
              <th className="py-4 px-4 font-semibold">Size</th>
              <th className="py-4 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {files.length > 0 ? (
              files.map((file) => {
                const ext = file.name.split('.').pop().toLowerCase();
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                const isVideo = ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
                const FileIcon = isImage ? ImageIcon : isVideo ? Video : ['pdf', 'doc', 'docx', 'txt'].includes(ext) ? FileText : FileQuestion;

                return (
                  <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition group">
                    <td className="py-4 px-4 flex items-center gap-3 font-medium text-slate-800 dark:text-slate-200">
                      <button onClick={() => toggleFavoriteFile(file.id)} className="text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 p-1.5 rounded-full transition outline-none focus:ring-2 focus:ring-yellow-500">
                        <Star size={18} className={file.isFavorite ? "fill-yellow-500" : ""} />
                      </button>
                      <div className="p-2 bg-blue-50 dark:bg-slate-800 rounded-lg text-blue-500">
                        <FileIcon size={20} />
                      </div>
                      <span className="truncate max-w-[200px] sm:max-w-xs">{file.name}</span>
                      <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 uppercase">
                        {ext}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-medium">
                      {(Number(file.size) / 1024 / 1024).toFixed(2)} MB
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => previewFile(file)} title="Preview" className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition outline-none">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => downloadFile(file.id, file.name)} title="Download" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition outline-none">
                          <Download size={18} />
                        </button>
                        <button onClick={() => shareFile(file.id)} title="Share" className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition outline-none">
                          <Share2 size={18} />
                        </button>
                        <button onClick={() => { setRenameFileId(file.id); setNewFileName(file.name); setShowRenameModal(true); }} title="Rename" className="p-2 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition outline-none">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => { setAiSelectedFile(file); setShowAIModal(true); }} title="AI Insights" className="p-2 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition outline-none flex items-center gap-1">
                          <Sparkles size={18} />
                        </button>
                        
                        <div className="relative ml-2 flex items-center">
                          <select
                            className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-1.5 pl-3 pr-8 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            defaultValue=""
                            onChange={(e) => moveFile(file.id, e.target.value)}
                            title="Move to Folder"
                          >
                            <option value="" disabled>Move...</option>
                            {folders.map((folder) => (
                              <option key={folder.id} value={folder.id}>{folder.name}</option>
                            ))}
                          </select>
                          <FolderInput size={14} className="absolute right-2.5 pointer-events-none text-slate-400" />
                        </div>

                        <button onClick={() => deleteFile(file.id)} title="Delete" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition outline-none ml-2">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <FileQuestion size={48} className="text-slate-300 mb-4" />
                    <p className="text-lg font-medium text-slate-700 dark:text-slate-300">No files found</p>
                    <p className="text-sm">Upload some files or change your search filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Upload Modal */}

      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">

          <div className="bg-white p-8 rounded-xl w-96">

            <h2 className="text-2xl font-bold mb-4">
              Upload File
            </h2>
            <div 
              className={`border-2 border-dashed ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} p-8 text-center rounded-lg`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                setSelectedFiles(Array.from(e.dataTransfer.files));
              }}
            >
              <input
                type="file"
                multiple
                className="hidden"
                id="file-upload"
                onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
              />
              <label htmlFor="file-upload" className="cursor-pointer text-blue-500 font-semibold hover:underline">
                Click to browse
              </label>
              <span className="text-gray-500"> or drag and drop files here</span>

              {selectedFiles.length > 0 && (
                <div className="mt-4 text-left max-h-32 overflow-y-auto">
                  <p className="font-semibold mb-2">Selected files ({selectedFiles.length}):</p>
                  <ul className="text-sm text-green-600 list-disc pl-5">
                    {selectedFiles.map((f, i) => (
                      <li key={i}>{f.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
           
            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => setShowUpload(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
  onClick={uploadFile}
  className="bg-blue-600 text-white px-4 py-2 rounded"
>
  Upload
</button>

            </div>

          </div>

        </div>
      )}

      {/* Create Folder Modal */}

      {showFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">

          <div className="bg-white p-8 rounded-xl w-96">

            <h2 className="text-2xl font-bold mb-4">
              Create Folder
            </h2>

            <input
              type="text"
              placeholder="Folder Name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full border p-3 rounded mb-4"
            />

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setShowFolderModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={createFolder}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Create
              </button>

            </div>

          </div>

        </div>
      )}
      {previewFileObj && <PreviewModal file={previewFileObj} onClose={() => setPreviewFileObj(null)} />}
{showRenameModal && (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-center">

    <div className="bg-white p-8 rounded-xl w-96">

      <h2 className="text-2xl font-bold mb-4">
        Rename File
      </h2>

      <input
        type="text"
        value={newFileName}
        onChange={(e) => setNewFileName(e.target.value)}
        className="w-full border p-3 rounded"
      />

      <div className="flex justify-end gap-3 mt-6">

        <button
          onClick={() => setShowRenameModal(false)}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>

        <button
          onClick={renameFile}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save
        </button>

      </div>

    </div>

  </div>
)}
{showRenameFolderModal && (

<div className="fixed inset-0 bg-black/50 flex justify-center items-center">

<div className="bg-white p-8 rounded-xl w-96">

<h2 className="text-2xl font-bold mb-4">

Rename Folder

</h2>

<input
type="text"
value={newFolderName}
onChange={(e)=>setNewFolderName(e.target.value)}
className="w-full border p-3 rounded"
/>

<div className="flex justify-end gap-3 mt-6">

<button
onClick={()=>setShowRenameFolderModal(false)}
className="bg-gray-400 text-white px-4 py-2 rounded"
>

Cancel

</button>

<button
onClick={renameFolder}
className="bg-green-600 text-white px-4 py-2 rounded"
>

Save

</button>

</div>

</div>

</div>

)}

{showAIModal && aiSelectedFile && (
  <AIModal 
    file={aiSelectedFile} 
    onClose={() => {
      setShowAIModal(false);
      setAiSelectedFile(null);
    }} 
  />
)}

    </>
  );
}

export default MyFiles;