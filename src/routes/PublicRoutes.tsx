import { Routes, Route } from "react-router";
import Login from "@/modules/auth/pages/Login";
import ForgotPassword from "@/modules/auth/pages/ForgotPassword";


export default function PublicRoutes() {
  return (
    <Routes>
      {/* Auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes >
  );
}
