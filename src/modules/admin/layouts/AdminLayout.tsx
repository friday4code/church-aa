import Layout from "@/modules/shared/Layout";
import { Outlet } from "react-router";
import AdminSidebar from "../components/AdminSidebar";

const AdminLayout: React.FC = () => {
    return (
        <Layout sidebar={<AdminSidebar />}>
            <Outlet />
        </Layout>
    );
};

export default AdminLayout;