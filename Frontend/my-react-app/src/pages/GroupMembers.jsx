import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function GroupMembers() {

  const members = [
    {
      id: 1,
      name: "Rahul",
      role: "Owner",
    },
    {
      id: 2,
      name: "Sahith",
      role: "Editor",
    },
    {
      id: 3,
      name: "Anitha",
      role: "Viewer",
    },
  ];

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 bg-slate-100 min-h-screen">
        <Navbar />

        <div className="p-8">

          <h1 className="text-3xl font-bold mb-6">
            Group Members
          </h1>

          <div className="bg-white rounded-xl shadow p-6">

            <table className="w-full">

              <thead>
                <tr>
                  <th className="text-left">Name</th>
                  <th className="text-left">Role</th>
                  <th className="text-left">Actions</th>
                </tr>
              </thead>

              <tbody>

                {members.map((member) => (
                  <tr key={member.id} className="border-t">

                    <td className="py-4">
                      {member.name}
                    </td>

                    <td>
                      {member.role}
                    </td>

                    <td className="space-x-3">

                      <button className="bg-blue-600 text-white px-3 py-1 rounded">
                        Change Role
                      </button>

                      <button className="bg-red-600 text-white px-3 py-1 rounded">
                        Remove
                      </button>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupMembers;