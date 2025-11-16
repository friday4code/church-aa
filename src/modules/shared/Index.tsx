import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";

const Index: React.FC = () => {
    const { isAuthenticated, isAdmin } = useAuth();
    const location = useLocation();

    // Show loading state while checking authentication
    if (isAuthenticated === undefined) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div>Loading...</div>
            </div>
        );
    }

    // ✅ Redirect authenticated users to dashboard
    if (isAuthenticated()) {
        return <Navigate to={`/${isAdmin() ? "admin" : "user"}/dashboard`} state={{ from: location }} replace />;
    }

    // 🚫 Redirect unauthenticated users to login
    return <Navigate to="/login" state={{ from: location }} replace />;
};

export default Index;