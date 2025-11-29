import AppRoutes from "@/routes/AppRoutes";
import TitleGuard from "@/modules/shared/TitleGuard";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";

export default function App() {
    // Enable session timeout for authenticated users
    useSessionTimeout({
        timeoutMinutes: 30, // 30 minutes of inactivity
        warningMinutes: 5,  // Show warning 5 minutes before timeout
        enabled: true
    });

    return <>
        <TitleGuard />
        <AppRoutes />
    </>
}
