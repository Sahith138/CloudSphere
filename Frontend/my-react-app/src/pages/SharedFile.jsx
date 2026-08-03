import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/authApi";

function SharedFile() {
  const { token } = useParams();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSharedFile();
  }, []);

  const fetchSharedFile = async () => {
    try {
      const res = await API.get(`/files/shared/${token}`);

      setFile(res.data.file);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl">
        Loading...
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl text-red-600">
        File not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center">

      <div className="bg-white p-8 rounded-xl shadow-xl w-[700px]">

        <h1 className="text-3xl font-bold mb-6">
          Shared File
        </h1>

        <p className="mb-3">
          <b>Name:</b> {file.name}
        </p>

        <p className="mb-5">
          <b>Size:</b>{" "}
          {(Number(file.size) / 1024 / 1024).toFixed(2)} MB
        </p>

        <iframe
          src={`http://localhost:5000/${file.fileUrl}`}
          title="Preview"
          className="w-full h-[400px] border rounded"
        />

        <div className="mt-6">

          <a
            href={`http://localhost:5000/${file.fileUrl}`}
            download={file.name}
            className="bg-blue-600 text-white px-5 py-2 rounded"
          >
            Download File
          </a>

        </div>

      </div>

    </div>
  );
}

export default SharedFile;