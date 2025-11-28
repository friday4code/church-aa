import React from "react"
import { VStack, HStack, Box, Drawer, Separator, Center, Button } from "@chakra-ui/react"
import { Box1, Chart1, Chart2, House, Layer, Location, Map, Map1, NoteText, Notepad, People, Logout } from "iconsax-reactjs"
import { useAuth } from "@/hooks/useAuth"
import { NavLink, useLocation } from "react-router"

interface LinkItem {
  name: string
  href: string
  icon: React.ReactNode
}

const allLinks: LinkItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: <Chart2 variant="Bulk" /> },
  { name: "States", href: "/admin/states", icon: <Location variant="Bulk" /> },
  { name: "Regions", href: "/admin/regions", icon: <Map variant="Bulk" /> },
  { name: "Old Group of Districts", href: "/admin/old_groups", icon: <Box1 variant="Bulk" /> },
  { name: "Groups", href: "/admin/groups", icon: <Layer variant="Bulk" /> },
  { name: "Districts", href: "/admin/districts", icon: <Map1 variant="Bulk" /> },
  { name: "Users and Rights", href: "/admin/users", icon: <People variant="Bulk" /> },
  { name: "Attendance", href: "/admin/attendance", icon: <NoteText variant="Bulk" /> },
  { name: "Attendance Logs", href: "/admin/attendance-logs", icon: <Notepad variant="Bulk" /> },
  { name: "Youth Ministry", href: "/admin/youth_ministry", icon: <House variant="Bulk" /> },
  { name: "Reports", href: "/admin/reports", icon: <Chart1 variant="Bulk" /> },
]

const MobileSidebar: React.FC = () => {
  const { hasRole, logout } = useAuth()
  const location = useLocation()

  const isLinkActive = (href: string): boolean => {
    if (location.pathname === href) return true
    if (!location.pathname.startsWith(href)) return false
    const nextChar = location.pathname.charAt(href.length)
    return nextChar === "/" || nextChar === ""
  }

  const isLinkVisible = React.useCallback((href: string): boolean => {
    if (hasRole('Super Admin')) return true
    if (hasRole('admin')) return true

    if (hasRole('State Admin')) {
      const allowed = ['/admin/dashboard', '/admin/regions', '/admin/old_groups', '/admin/groups', '/admin/districts', '/admin/attendance', '/admin/youth_ministry', '/admin/reports']
      return allowed.some(link => href.includes(link))
    }

    if (hasRole('Region Admin')) {
      const allowed = ['/admin/dashboard', '/admin/old_groups', '/admin/groups', '/admin/districts', '/admin/attendance', '/admin/youth_ministry', '/admin/reports']
      return allowed.some(link => href.includes(link))
    }

    if (hasRole('Group Admin')) {
      const allowed = ['/admin/dashboard', '/admin/districts', '/admin/attendance', '/admin/youth_ministry', '/admin/reports']
      return allowed.some(link => href.includes(link))
    }

    if (hasRole('District Admin')) {
      const allowed = ['/admin/dashboard', '/admin/attendance', '/admin/youth_ministry']
      return allowed.some(link => href.includes(link))
    }

    if (hasRole('Viewer')) {
      const allowed = ['/admin/dashboard']
      return allowed.some(link => href.includes(link))
    }

    return false
  }, [hasRole])

  const links = React.useMemo(() => {
    return allLinks
      .filter(link => link.href == "/admin/attendance-logs" && !hasRole("Super Admin") ? false : true)
      .filter(link => isLinkVisible(link.href))
  }, [isLinkVisible, hasRole])

  return (
    <VStack align="stretch" gap="3" py="3" role="menu" aria-label="Mobile navigation links" h="full">
      <Separator />

      {links.map((link, i) => (
        <Drawer.ActionTrigger key={i} asChild>
          <NavLink to={link.href} aria-label={`Go to ${link.name}`}>
            <HStack
              rounded="lg"
              p="3"
              role="menuitem"
              minH="11"
              bg={isLinkActive(link.href) ? "accent.100" : "transparent"}
              color={isLinkActive(link.href) ? "accent.700" : "inherit"}
              _dark={{
                bg: isLinkActive(link.href) ? "accent.900" : "transparent",
                color: isLinkActive(link.href) ? "accent.100" : "inherit"
              }}
              _hover={{ bg: "accent.50/20" }}
              transition="all 0.2s ease"
            >
              <Center color={isLinkActive(link.href) ? "accent.600" : "inherit"}>
                {link.icon}
              </Center>
              <Box fontWeight={isLinkActive(link.href) ? "semibold" : "normal"}>
                {link.name}
              </Box>
            </HStack>
          </NavLink>
        </Drawer.ActionTrigger>
      ))}

      <Box flex="1" />

      <Separator />

      <HStack justify="space-between" px="2" py="2">
        <Drawer.ActionTrigger asChild>

          <Button
            colorPalette={"red"}
            variant="outline"
            rounded="xl"
            onClick={() => logout()}
            w="full"
          >
            <Logout />
            Sign Out
          </Button>
        </Drawer.ActionTrigger>
      </HStack>
    </VStack>
  )
}

export default MobileSidebar
