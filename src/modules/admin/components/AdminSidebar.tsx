import React from "react";
import {
    Box, HStack, Separator, Stack,
    ScrollArea,
    IconButton,
    Image
} from "@chakra-ui/react";
import { NavLink, useLocation } from "react-router";
import { Box1, Chart1, Chart2, House, Layer, Location, Map, Map1, NoteText, Profile2User, SidebarLeft, SidebarRight, User } from "iconsax-reactjs";
import { useSidebarStore } from "@/store/ui.store";


const AdminSidebar: React.FC = () => {
    const { isCollapsed, toggle } = useSidebarStore();
    const location = useLocation();

    const isLinkActive = (href: string): boolean => {
        return location.pathname.endsWith(href);
    };

    const links = [
        { name: "Dashboard", href: "/admin/dashboard", icon: <Chart2 variant="Bulk" /> },
        { name: "States", href: "/admin/states", icon: <Location variant="Bulk" /> },
        { name: "Regions", href: "/admin/regions", icon: <Map variant="Bulk" /> },
        { name: "Old Groups", href: "/admin/old_groups", icon: <Box1 variant="Bulk" /> },
        { name: "Groups", href: "/admin/groups", icon: <Layer variant="Bulk" /> },
        { name: "Districts", href: "/admin/districts", icon: <Map1 variant="Bulk" /> },
        { name: "Users and Rights", href: "/admin/users_and_rights", icon: <Profile2User variant="Bulk" /> },
        { name: "Attendance", href: "/admin/attendance", icon: <NoteText variant="Bulk" /> },
        { name: "Youth Ministry", href: "/admin/youth_ministry", icon: <House variant="Bulk" /> },
        { name: "Reports", href: "/admin/reports", icon: <Chart1 variant="Bulk" /> },
        { name: "Profile", href: "/admin/profile", icon: <User variant="Bulk" /> },
    ];


    return <ScrollArea.Root bg="accent/70" backdropFilter={"blur(10px)"} rounded="xl" h="full" size={"xs"}>
        <ScrollArea.Viewport>
            <ScrollArea.Content h="full">
                <Stack rounded="xl" p='4' h="full">
                    {links?.map((link, i) => (
                        <NavLink key={i} to={link.href}>
                            <HStack
                                color="white"
                                rounded="lg"
                                p="2"
                                fontSize={"sm"}
                                fontWeight={"semibold"}
                                bg={isLinkActive(link.href) ? "accent" : "transparent"}
                                _hover={{
                                    bg: isLinkActive(link.href) ? "accent.600" : "accent.50/20"
                                }}
                            >
                                <Box>
                                    {link.icon}
                                </Box>

                                <Box lineClamp={1}>
                                    {!isCollapsed && link.name}
                                </Box>
                            </HStack>
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
                    {!isCollapsed && <Image src="/logo.png" w="10" />}

                    <IconButton
                        bg={"white"}
                        color="accent"
                        rounded="xl"
                        variant={"ghost"}
                        onClick={toggle}
                    >
                        {isCollapsed ? <SidebarRight /> : <SidebarLeft />}
                    </IconButton>
                </HStack>
            </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar>
            <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner />
    </ScrollArea.Root>

}

export default AdminSidebar;