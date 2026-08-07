import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyFiles from "./pages/MyFiles";
import Groups from "./pages/Groups";
import Profile from "./pages/Profile";
import GroupWorkspace from "./pages/GroupWorkspace";
import Notifications from "./pages/Notifications";
import Invitations from "./pages/Invitations";
import StorageAnalytics from "./pages/StorageAnalytics";
import AdminDashboard from "./pages/AdminDashboard";
import Trash from "./pages/Trash";
import ActivityLog from "./pages/ActivityLog";
import Favorites from "./pages/Favorites";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Layout from "./components/Layout";
import SharedFile from "./pages/SharedFile";
import Search from "./pages/Search";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/shared/:token" element={<SharedFile />} />

        {/* Protected Routes Wrapped in Layout */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/files" element={<MyFiles />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/group-workspace/:groupId" element={<GroupWorkspace />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/invitations" element={<Invitations />} />
          <Route path="/storage" element={<StorageAnalytics />} />
          
          {/* Admin Protected Route */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          
          <Route path="/trash" element={<Trash />} />
          <Route path="/activity" element={<ActivityLog />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/search" element={<Search />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;