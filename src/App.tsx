import AppRoutes from "@/routes/AppRoutes";
import TitleGuard from "@/modules/shared/TitleGuard";
export default function App() {
    return <>
        <TitleGuard />
        <AppRoutes />
    </>
}
