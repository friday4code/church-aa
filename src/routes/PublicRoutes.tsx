import { Routes, Route } from "react-router";
// import Landing from "@/modules/public/pages/Landing";
import Login from "@/modules/auth/pages/Login";
// import Register from "@/modules/auth/pages/Register";
// import PublicLayout from "@/modules/public/layout/PublicLayout";
// import AboutUs from "@/modules/public/pages/About";
// import Navbar from "@/modules/public/components/Navbar";
// import ContactUs from "@/modules/public/pages/Contact";
// import ForgotPasswordPage from "@/modules/auth/pages/ForgotPassword";
// import RefereeForm from "@/modules/auth/pages/RefereeForm";
// import EmailVerification from "@/modules/public/pages/EmailVerification";

export default function PublicRoutes() {
  return (
    <Routes>
      {/* Marketing pages */}
      {/* <Route path="/" element={
        <>
          <Navbar />
          <PublicLayout />
        </>
      }>
        <Route index element={<Landing />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
      </Route> */}


      {/* Auth pages */}
      <Route path="/login" element={<Login />} />
      {/* <Route path="/signup" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-user" element={<EmailVerification />} />
      <Route path="/referee-report" element={<RefereeForm />} /> */}
    </Routes >
  );
}
