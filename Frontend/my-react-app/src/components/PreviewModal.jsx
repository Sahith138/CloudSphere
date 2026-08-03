import { X } from "lucide-react";

function PreviewModal({ file, onClose }) {
  if (!file) return null;

  const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isVideo = file.name.match(/\.(mp4|webm|ogg)$/i);
  const normalizedPath = encodeURI(file.fileUrl.replace(/\\/g, "/"));
  const fileUrl = normalizedPath.startsWith("http") ? normalizedPath : `http://localhost:5000/${normalizedPath}`;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="relative bg-slate-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-700">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/50">
          <h3 className="text-white font-medium truncate pr-4">{file.name}</h3>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-black/50 min-h-[300px]">
          {isImage ? (
            <img 
              src={fileUrl} 
              alt={file.name} 
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          ) : isVideo ? (
            <video 
              src={fileUrl} 
              controls 
              autoPlay
              className="max-w-full max-h-[70vh] rounded-lg"
            />
          ) : (
            <div className="text-center text-slate-400">
              <p className="text-xl mb-4">Preview not available for this file type.</p>
              <a 
                href={fileUrl} 
                download={file.name}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PreviewModal;
