import Layout from "@/modules/shared/Layout";
import { Outlet } from "react-router";
import AdminSidebar from "../components/AdminSidebar";
import ScrollRest from "@/components/ScrollRest";

const AdminLayout: React.FC = () => {
    return (
        <Layout sidebar={<AdminSidebar />}>
            <Outlet />
            <ScrollRest />
        </Layout>
    );
};

export default AdminLayout;