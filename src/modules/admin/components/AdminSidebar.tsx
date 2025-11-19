import React from "react";
import {
    Box, HStack, Separator, Stack,
    ScrollArea,
    IconButton,
    Menu,
    Avatar,
    Portal,
    Center
} from "@chakra-ui/react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { Box1, Chart1, Chart2, House, Layer, Location, Logout, Map, Map1, NoteText, Notepad, People, Profile, SidebarLeft, SidebarRight } from "iconsax-reactjs";
import { useSidebarStore } from "@/store/ui.store";
import { useAuth } from "@/hooks/useAuth";
import { ColorModeButton } from "@/components/ui/color-mode";
import { Tooltip } from "@/components/ui/tooltip";


const AdminSidebar: React.FC = () => {
    const { isCollapsed, toggle } = useSidebarStore();
    const location = useLocation();
    const { hasRole } = useAuth();

    const isLinkActive = (href: string): boolean => {
        return location.pathname.includes(href);
    };

    // Determine if a link should be visible based on user role
    const isLinkVisible = React.useCallback((href: string): boolean => {
        // Super Admin sees everything
        if (hasRole('Super Admin')) {
            return true;
        }

        // State Admin sees everything
        if (hasRole('State Admin')) {
            return true;
        }

        // Region Admin - hide States
        if (hasRole('Region Admin')) {
            const hiddenLinks = ['/admin/states'];
            return !hiddenLinks.some(hidden => href.includes(hidden));
        }

        // Group Admin - hide States and Regions
        if (hasRole('Group Admin')) {
            const hiddenLinks = ['/admin/states', '/admin/regions'];
            return !hiddenLinks.some(hidden => href.includes(hidden));
        }

        // District Admin - hide States, Regions, Groups, and Old Groups
        if (hasRole('District Admin')) {
            const hiddenLinks = ['/admin/states', '/admin/regions', '/admin/groups', '/admin/old_groups', '/admin/old-groups'];
            return !hiddenLinks.some(hidden => href.includes(hidden));
        }

        // Viewer - minimal access (only dashboard and attendance maybe)
        if (hasRole('Viewer')) {
            const visibleLinks = ['/admin/dashboard', '/admin/attendance'];
            return visibleLinks.some(visible => href.includes(visible));
        }

        // Default: no access
        return false;
    }, [hasRole]);

    const allLinks = [
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
        // { name: "Profile", href: "/admin/profile", icon: <User variant="Bulk" /> },
    ];

    // Filter links based on user role
    const links = React.useMemo(() => {
        return allLinks.filter(link => isLinkVisible(link.href));
    }, [allLinks, isLinkVisible]);


    return <ScrollArea.Root bg="accent/70" backdropFilter={"blur(10px)"} rounded="xl" h="full" size={"xs"}>
        <ScrollArea.Viewport>
            <ScrollArea.Content h="full">
                <Stack rounded="xl" p='4' w="full" h="full">
                    {links?.map((link, i) => (
                        <NavLink key={i} to={link.href}>
                            <Tooltip openDelay={0} positioning={{ placement: "right" }}
                                contentProps={{
                                    bg: "bg",
                                    p: "3",
                                    color:"black",
                                    _dark: {
                                        color: "white"
                                    }
                                }}
                                content={link.name}>
                                <HStack
                                    color="white"
                                    rounded="lg"
                                    p="2"
                                    w={isCollapsed ? "fit" : "full"}
                                    fontSize={"sm"}
                                    fontWeight={"semibold"}
                                    bg={{
                                        _light: isLinkActive(link.href) ? "accent" : "transparent",
                                        _dark: isLinkActive(link.href) ? "accent.900" : "transparent",
                                    }}
                                    _hover={{
                                        bg: {
                                            _light: isLinkActive(link.href) ? "accent.600" : "accent.50/20",
                                            _dark: isLinkActive(link.href) ? "accent.900" : "accent.50/20"
                                        }
                                    }}
                                >
                                    <Center>
                                        {link.icon}
                                    </Center>

                                    {!isCollapsed && <Box lineClamp={1}>
                                        {link.name}
                                    </Box>}
                                </HStack>
                            </Tooltip>
                        </NavLink>
                    ))}
                    <Separator />
                </Stack>

                <HStack
                    pos="absolute"
                    bottom={4}
                    w="full"
                    left={0}
                    right={0}
                    px={isCollapsed ? "5" : 6}
                    justify={isCollapsed ? "start" : "space-between"}
                >
                    {/* {!isCollapsed && <Image src="/logo.png" w="10" />} */}

                    <IconButton
                        // bg={"white"}
                        color="white"
                        _hover={{ color: "accent" }}
                        size='sm'
                        rounded="xl"
                        variant={"ghost"}
                        onClick={toggle}
                    >
                        {isCollapsed ? <SidebarRight /> : <SidebarLeft />}
                    </IconButton>

                    {!isCollapsed && <ColorModeButton bg={{ base: "whiteAlpha.900", _dark: "transparent" }} rounded='lg' size="xs" />}

                    {!isCollapsed && <ProfileAvatar />}

                </HStack>
            </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar>
            <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner />
    </ScrollArea.Root >

}

export default AdminSidebar;


const ProfileAvatar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <Menu.Root positioning={{ placement: "right-end" }}>
            <Menu.Trigger cursor="pointer" rounded="full" focusRing="outside">
                <Avatar.Root size="sm">
                    <Avatar.Fallback name={user?.name} />
                    <Avatar.Image src={undefined} />
                </Avatar.Root>
            </Menu.Trigger>
            <Portal>
                <Menu.Positioner>
                    <Menu.Content>
                        <Menu.Item value="account" onClick={() => navigate("/admin/profile")}>
                            <Profile variant="Bulk" /> Profile
                        </Menu.Item>
                        <Menu.Item onSelect={logout} color="red" value="logout">
                            <Logout /> Logout
                        </Menu.Item>
                    </Menu.Content>
                </Menu.Positioner>
            </Portal>
        </Menu.Root>
    )
}
