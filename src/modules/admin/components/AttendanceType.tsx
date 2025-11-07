import { useParams } from "react-router"
import type { ServiceType } from "../stores/attendance.store";
import AttendancePage from "../pages/attendance/Attendance";

const AttendanceType = () => {
    const param = useParams();
    const type: ServiceType = param?.type as ServiceType;

    return <AttendancePage serviceType={type?.replaceAll("_", "-") as ServiceType} />
}

export default AttendanceType