import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function GroupTerms() {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 bg-slate-100 min-h-screen">
        <Navbar />

        <div className="p-8 max-w-4xl">

          <h1 className="text-3xl font-bold mb-6">
            Workspace Terms & Conditions
          </h1>

          <div className="bg-white p-8 rounded-xl shadow">

            <p className="font-semibold mb-4">
              Version 2.0
            </p>

            <ul className="list-disc ml-6 space-y-3">
              <li>Files are confidential.</li>
              <li>Activity is monitored and logged.</li>
              <li>Do not redistribute files externally.</li>
              <li>Terms updates require re-acceptance.</li>
            </ul>

            <div className="mt-8">
              <label className="flex items-center gap-3">
                <input type="checkbox" />
                I agree to workspace terms and file-sharing policies.
              </label>
            </div>

            <div className="flex gap-4 mt-8">
              <button className="bg-green-600 text-white px-5 py-2 rounded">
                Accept
              </button>

              <button className="bg-red-600 text-white px-5 py-2 rounded">
                Decline
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupTerms;