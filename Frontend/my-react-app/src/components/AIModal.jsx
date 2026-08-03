import { useState } from "react";
import toast from 'react-hot-toast';
import API from "../api/authApi";
import { Bot, Send, X, FileText, Key, MessageSquare } from "lucide-react";

function AIModal({ file, onClose }) {
  const [activeTab, setActiveTab] = useState("summary");
  const [summary, setSummary] = useState(file?.summary || "");
  const [keywords, setKeywords] = useState(file?.keywords || []);
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.post(`/ai/summarize/${file.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(res.data.summary);
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  const fetchKeywords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.post(`/ai/extract-keywords/${file.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKeywords(res.data.keywords);
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to extract keywords");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const newHistory = [...chatHistory, { role: "user", text: message }];
    setChatHistory(newHistory);
    setMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await API.post(`/ai/chat/${file.id}`, { message, history: chatHistory }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setChatHistory([...newHistory, { role: "model", text: res.data.reply }]);
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-3xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 h-[80vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Bot size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">AI Insights</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">{file.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 pt-2">
          <button 
            onClick={() => setActiveTab("summary")}
            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'summary' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <FileText size={16} /> Summary
          </button>
          <button 
            onClick={() => setActiveTab("keywords")}
            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'keywords' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Key size={16} /> Keywords
          </button>
          <button 
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'chat' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <MessageSquare size={16} /> Chat
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-800/50">
          
          {/* Summary Tab */}
          {activeTab === "summary" && (
            <div className="flex flex-col h-full">
              {summary ? (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{summary}</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <Bot size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">No Summary Yet</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">Generate an AI summary to quickly understand the contents of this document.</p>
                  <button onClick={fetchSummary} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition flex items-center gap-2">
                    {loading ? "Generating..." : "Generate Summary"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Keywords Tab */}
          {activeTab === "keywords" && (
            <div className="flex flex-col h-full">
              {keywords && keywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800">
                      {kw}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <Key size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">Extract Key Concepts</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">Let AI identify the most important keywords and topics in this file.</p>
                  <button onClick={fetchKeywords} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition flex items-center gap-2">
                    {loading ? "Extracting..." : "Extract Keywords"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                    <MessageSquare size={40} className="mb-3 opacity-50" />
                    <p>Ask anything about this document.</p>
                  </div>
                ) : (
                  chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm border border-slate-100 dark:border-slate-600'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ))
                )}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-200 dark:bg-slate-700 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 items-center">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 relative">
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask a question..."
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition"
                />
                <button 
                  onClick={sendMessage}
                  disabled={loading || !message.trim()}
                  className="absolute right-2 top-2 bottom-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default AIModal;
