import Layout from "@/modules/shared/Layout";
import { Outlet } from "react-router";
import AdminSidebar from "../components/AdminSidebar";
import ScrollRest from "@/components/ScrollRest";
import DismissToasts from "@/components/DismissToasts";

const AdminLayout: React.FC = () => {
    return (
        <Layout sidebar={<AdminSidebar />}>
            <Outlet />
            <ScrollRest />
            <DismissToasts />
        </Layout>
    );
};

export default AdminLayout;