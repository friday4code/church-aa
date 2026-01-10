import React, { useEffect, useRef } from "react";
import { Box, Container, Flex, ScrollArea, useScrollArea, Drawer, HStack, IconButton } from "@chakra-ui/react";
import { useBreakpointValue } from "@chakra-ui/react";
import { useScrollStore, useSidebarStore } from "@/store/ui.store";
import MobileNavbar from "@/components/MobileNavbar";
import MobileSidebar from "@/modules/admin/components/MobileSidebar";
import { CloseSquare } from "iconsax-reactjs";

interface LayoutProps {
    sidebar: React.ReactNode; // Left sidebar content
    children: React.ReactNode; // Main content
}

/**
 * A responsive 2-column layout.
 * Left: Sidebar (fixed width)
 * Right: Main content (flexible)
 */
const Layout: React.FC<LayoutProps> = ({ sidebar, children }) => {
    const scrollArea = useScrollArea();
    const { setScrollArea } = useScrollStore();
    const isScrollAreaSet = useRef<boolean>(false);
    const { isCollapsed } = useSidebarStore();

    useEffect(() => {
        if (!isScrollAreaSet.current) {
            setScrollArea(scrollArea);
            isScrollAreaSet.current = true;
        }
    }, [scrollArea, setScrollArea]);

    const isMobile = useBreakpointValue({ base: true, md: false });
    const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

    const navBarHeight = 16; // Chakra spacing units (~64px)

    return (
        <Flex
            minH={{ base: "100vh", md: "vh" }}
            alignItems={"stretch"}
            bg="accent.50/30"
            _dark={{ bg: "gray.900" }}
            overflow="hidden"
            pl={{ base: "unset", md: "2" }}
            gap="6"
        >
            {isMobile && (
                <MobileNavbar onMenuClick={() => setMobileNavOpen(true)} height={navBarHeight} />
            )}
            {/* Sidebar column (desktop) / Drawer (mobile) */}
            {isMobile ? (
                <Drawer.Root
                    open={mobileNavOpen}
                    onOpenChange={(e) => setMobileNavOpen(e.open)}
                    placement="start"
                    aria-label="Mobile navigation menu"
                >
                    <Drawer.Backdrop />
                    <Drawer.Positioner>
                        <Drawer.Content roundedEnd="xl" zIndex={4}>
                            <Drawer.Header>
                                <HStack justify="space-between" align="center" px="2">
                                    <Drawer.Title>Menu</Drawer.Title>
                                    <Drawer.CloseTrigger asChild>
                                        <IconButton
                                            aria-label="Close navigation"
                                            variant="ghost"
                                            rounded="xl"
                                        >
                                            <CloseSquare />
                                        </IconButton>
                                    </Drawer.CloseTrigger>
                                </HStack>
                            </Drawer.Header>
                            <Drawer.Body>
                                <MobileSidebar />
                            </Drawer.Body>
                            <Drawer.CloseTrigger aria-label="Close navigation" />
                        </Drawer.Content>
                    </Drawer.Positioner>
                </Drawer.Root>
            ) : (
                <ScrollArea.Root
                    hideBelow="md"
                    as="aside"
                    pos="relative"
                    zIndex={1}
                    transition="all"
                    transitionDuration="slow"
                    w={{ base: "full", md: isCollapsed ? "90px" : "200px" }}
                    maxW="lg"
                >
                    <ScrollArea.Viewport>
                        <ScrollArea.Content h="vh" py="2">
                            {sidebar}
                        </ScrollArea.Content>
                    </ScrollArea.Viewport>
                    <ScrollArea.Scrollbar>
                        <ScrollArea.Thumb />
                    </ScrollArea.Scrollbar>
                    <ScrollArea.Corner />
                </ScrollArea.Root>
            )}


            {/* Main content column */}
            <Box
                h="vh"
                as="main"
                flex="1"
                p={{ base: 0, md: 2 }}
                ml={{ base: "auto", md: "-6" }}
                overflowY="auto"
                pos="relative"
                backdropFilter={{ base: "none", md: "blur(1px)" }}
                zIndex={1}
                pt={{ base: navBarHeight, md: 0 }}
            >
                {isMobile ? (
                    <Container pos="relative" maxW={"5xl"} py="6">
                        {children}
                    </Container>
                ) : (
                    <ScrollArea.RootProvider
                        bgGradient="to-br"
                        gradientFrom={{ base: "accent.100/90", _dark: "blackAlpha.500" }}
                        gradientTo={{ base: "red.50/90", _dark: "black" }}
                        value={scrollArea}
                        h="full"
                        size={"xs"}
                        shadow={"sm"}
                        rounded={10}
                    >
                        <ScrollArea.Viewport>
                            <ScrollArea.Content rounded={6}>
                                <Container pos="relative" maxW={"7xl"} py="6">
                                    {children}
                                </Container>
                            </ScrollArea.Content>
                        </ScrollArea.Viewport>
                        <ScrollArea.Scrollbar>
                            <ScrollArea.Thumb />
                        </ScrollArea.Scrollbar>
                        <ScrollArea.Corner />
                    </ScrollArea.RootProvider>
                )}
            </Box>


            {/* blurs (desktop only) */}
            <Box display={{ base: "none", md: "block" }} bg="accent.300" filter={"blur(60px)"} rounded="full" boxSize={40} pos="absolute" top={0} left={0} zIndex={0} />
            <Box display={{ base: "none", md: "block" }} bg="red.300" filter={"blur(60px)"} rounded="full" boxSize={40} pos="absolute" top={0} right={0} zIndex={0} />
            <Box display={{ base: "none", md: "block" }} bg="red.300" filter={"blur(60px)"} rounded="full" boxSize={40} pos="absolute" bottom={0} left={20} zIndex={0} />
            <Box display={{ base: "none", md: "block" }} bg="accent.300" filter={"blur(60px)"} rounded="full" boxSize={40} pos="absolute" bottom={"50%"} transform={"translateY(50%)"} left={"50%"} zIndex={0} />

        </Flex >
    );
};

export default Layout;
