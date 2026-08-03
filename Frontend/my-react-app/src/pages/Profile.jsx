import { useEffect, useState } from "react";
import API from "../api/authApi";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const res = await API.get("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data.user);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
          <h1 className="text-3xl font-bold mb-8 text-slate-800 dark:text-white">
            My Profile
          </h1>

          {user && (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 w-[500px]">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-slate-500 dark:text-slate-400">ID</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{user.id}</span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-slate-500 dark:text-slate-400">Name</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{user.name}</span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-slate-500 dark:text-slate-400">Email</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{user.email}</span>
                </div>

                <div className="flex justify-between items-center pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Joined</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
  );
}

export default Profile;