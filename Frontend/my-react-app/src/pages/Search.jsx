import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import API from "../api/authApi";
import { FileText, Download, Sparkles } from "lucide-react";

function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [query, setQuery] = useState(q);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (q) {
      setQuery(q);
      executeSearch(q);
    }
  }, [q]);

  const executeSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const res = await API.get(`/files/search?name=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setResults(res.data.files);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${query}`);
    }
  };

  return (
    <>
          <h1 className="text-3xl font-bold mb-6 text-slate-800 dark:text-white">
            Search Results
          </h1>

          <form onSubmit={handleManualSearch} className="mb-8">
            <input
              type="text"
              placeholder="Search files by name or AI keywords..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full max-w-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </form>

          {loading ? (
            <div className="text-slate-500 dark:text-slate-400">Searching...</div>
          ) : (
            <div className="space-y-4 max-w-3xl">
              {results.length > 0 ? (
                results.map((file) => (
                  <div
                    key={file.id}
                    className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex justify-between items-center hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{file.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {(Number(file.size) / 1024 / 1024).toFixed(2)} MB • {new Date(file.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Link to="/files" className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition">
                      View in Files
                    </Link>
                  </div>
                ))
              ) : (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400">
                  <Sparkles size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No results found for "{q}"</p>
                  <p className="text-sm mt-1">Try searching by file name or semantic AI keywords.</p>
                </div>
              )}
            </div>
          )}
        </>
  );
}

export default Search;