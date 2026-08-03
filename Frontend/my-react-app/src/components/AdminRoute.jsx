import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/" />;
  }

  if (!user.isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

export default AdminRoute;
