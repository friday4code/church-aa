import { useParams } from "react-router"
import type { ServiceType } from "@/types/attendance.type";
import AttendancePage from "../pages/attendance/Attendance";

const AttendanceType = () => {
    const param = useParams();
    const type: ServiceType = param?.type as ServiceType;

    return <AttendancePage serviceType={type?.replaceAll("_", "-") as ServiceType} />
}

export default AttendanceType