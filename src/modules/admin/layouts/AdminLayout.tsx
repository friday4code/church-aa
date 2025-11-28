import Layout from "@/modules/shared/Layout";
import { Outlet } from "react-router";
import AdminSidebar from "../components/AdminSidebar";
import ScrollRest from "@/components/ScrollRest";
import DismissToasts from "@/components/DismissToasts";
import TitleGuard from "@/modules/shared/TitleGuard";

const AdminLayout: React.FC = () => {
    return (
        <Layout sidebar={<AdminSidebar />}>
            <TitleGuard />
            <Outlet />
            <ScrollRest />
            <DismissToasts />
        </Layout>
    );
};

export default AdminLayout;
