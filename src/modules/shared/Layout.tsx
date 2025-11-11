import React, { useEffect, useRef } from "react";
import { Box, Container, Flex, ScrollArea, useScrollArea } from "@chakra-ui/react";
import { useScrollStore, useSidebarStore } from "@/store/ui.store";

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

    return (
        <Flex
            minH="vh"
            alignItems={"stretch"}
            bg="accent.50/30"
            _dark={{ bg: "gray.900" }}
            overflow="hidden"
            pl="2"
            gap="6"
        >
            {/* Sidebar column */}
            <ScrollArea.Root
                as="aside"
                pos="relative"
                zIndex={1}
                transition={"all"}
                transitionDuration={"slow"}
                w={{ base: "full", md: isCollapsed ? "80px" : "200px" }}
                maxW="lg">
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


            {/* Main content column */}
            <Box
                h="vh"
                as="main"
                flex="1"
                p={{ base: 4, md: 2 }}
                ml="-6"
                overflowY="auto"
                pos="relative"
                backdropFilter={"blur(1px)"}
                zIndex={1}
            >

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
            </Box>


            {/* blurs */}
            <Box bg="accent.300" filter={"blur(60px)"} rounded="full" boxSize={40} pos="absolute" top={0} left={0} zIndex={0} />
            <Box bg="red.300" filter={"blur(60px)"} rounded="full" boxSize={40} pos="absolute" top={0} right={0} zIndex={0} />
            <Box bg="red.300" filter={"blur(60px)"} rounded="full" boxSize={40} pos="absolute" bottom={0} left={20} zIndex={0} />
            <Box bg="accent.300" filter={"blur(60px)"} rounded="full" boxSize={40} pos="absolute" bottom={"50%"} transform={"translateY(50%)"} left={"50%"} zIndex={0} />

        </Flex>
    );
};

export default Layout;
