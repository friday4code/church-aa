import Layout from "@/modules/shared/Layout";
import { Outlet } from "react-router";
import AdminSidebar from "../components/AdminSidebar";
import ScrollRest from "@/components/ScrollRest";
import DismissToasts from "@/components/DismissToasts";
import { Toaster } from "@/components/ui/toaster";
// import TitleGuard from "@/modules/shared/TitleGuard";

const AdminLayout: React.FC = () => {
    return (
        <Layout sidebar={<AdminSidebar />}>
            {/* <TitleGuard /> */}
            <Outlet />
            <ScrollRest />
            <DismissToasts />
            <Toaster />
        </Layout>
    );
};

export default AdminLayout;
