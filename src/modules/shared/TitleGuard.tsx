import React from "react"
import { useLocation } from "react-router"
import { titleManager } from "./title.service"

const defaults = {
  "/": "Home",
  "/login": "Login",
  "/forgot-password": "Forgot Password",
  "/unauthorized": "Unauthorized",
  "/admin/dashboard": "Dashboard",
  "/admin/states": "States",
  "/admin/regions": "Regions",
  "/admin/old_groups": "Old Groups",
  "/admin/groups": "Groups",
  "/admin/districts": "Districts",
  "/admin/users": "Users",
  "/admin/attendance": "Attendance",
  "/admin/youth_ministry": "Youth Ministry",
  "/admin/reports": "Reports",
  "/admin/profile": "Profile",
}

export default function TitleGuard() {
  const location = useLocation()
  React.useEffect(() => {
    titleManager.setDefaults(defaults)
    titleManager.setTitleForPath(location.pathname)
  }, [location.pathname])
  return null
}
