import React, { useEffect, useRef } from "react";
import { Box, Container, Flex, ScrollArea, useScrollArea } from "@chakra-ui/react";
import { useScrollStore } from "@/store/ui.store";

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

    useEffect(() => {
        if (!isScrollAreaSet.current) {
            setScrollArea(scrollArea);
            isScrollAreaSet.current = true;
        }
    }, [scrollArea, setScrollArea]);

    return (
        <Flex
            minH="vh"
            bg="accent.50/30"
            _dark={{ bg: "gray.900" }}
            overflow="hidden"
        >
            {/* Sidebar column */}
            <ScrollArea.Root
                as="aside"
                w={{ base: "full", md: "200px" }}
                flexShrink={0}
                height="full"
                maxW="lg">
                <ScrollArea.Viewport>
                    <ScrollArea.Content>
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
                p={{ base: 4, md: 6 }}
                ml="-6"
                overflowY="auto"
            >

                <ScrollArea.RootProvider bg="bg" value={scrollArea} h="full" size={"xs"} shadow={"sm"} rounded={10}>
                    <ScrollArea.Viewport>
                        <ScrollArea.Content bg="bg" rounded={6}>
                            <Container pos="relative" maxW={"7xl"} p={{ md: "0" }} bg="bg">
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

        </Flex>
    );
};

export default Layout;
