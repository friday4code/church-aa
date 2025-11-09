import ErrorFallback from "@/components/ErrorFallback";
import { ENV } from "@/config/env";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { Grid, Stat, Card, Heading, Box, HStack, Text } from "@chakra-ui/react"
import { Location, Map, Box1, Layer, Map1, Profile2User, User } from "iconsax-reactjs"

export const Dashboard: React.FC = () => {
    const { reset } = useQueryErrorResetBoundary();

    return (
        <>
            <title>Dashboard | {ENV.APP_NAME}</title>
            <meta
                name="description"
                content="track your dashboard"
            />
            <ErrorBoundary
                onReset={reset}
                fallbackRender={({ resetErrorBoundary, error }) => (
                    <ErrorFallback {...{ resetErrorBoundary, error }} />
                )}
            >
                <Content />
            </ErrorBoundary>
        </>
    );
};

export default Dashboard;

// comp

const Content = () => {
    const statsData = [
        {
            label: "Total States",
            value: "6",
            icon: <Location variant="Bulk" size="24" />,
            color: "blue",
            description: "Summary"
        },
        {
            label: "Total Regions",
            value: "214",
            icon: <Map variant="Bulk" size="24" />,
            color: "green",
            description: "Summary"
        },
        {
            label: "Total Old Groups",
            value: "414",
            icon: <Box1 variant="Bulk" size="24" />,
            color: "purple",
            description: "Summary"
        },
        {
            label: "Total Groups",
            value: "118",
            icon: <Layer variant="Bulk" size="24" />,
            color: "orange",
            description: "Summary"
        },
        {
            label: "Total Districts",
            value: "644",
            icon: <Map1 variant="Bulk" size="24" />,
            color: "red",
            description: "Summary"
        },
        {
            label: "Total Youth Attendance",
            value: "389",
            icon: <Profile2User variant="Bulk" size="24" />,
            color: "teal",
            description: "Summary"
        },
        {
            label: "Total Administrators",
            value: "123",
            icon: <User variant="Bulk" size="24" />,
            color: "cyan",
            description: "Summary"
        }
    ]

    return (
        <Box >
            <Heading size="3xl" mb="6" color="gray.700">
                Dashboard
            </Heading>

            <Grid
                templateColumns={{
                    base: "repeat(1, 1fr)",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                    xl: "repeat(4, 1fr)"
                }}
                gap="5"
            >
                {statsData.map((stat, index) => (
                    <Card.Root
                        key={index}
                        height="fit-content"
                        variant="outline"
                        rounded="xl"
                        bg="bg.subtle"
                        _hover={{
                            transform: "translateY(-2px)",
                            shadow: "md"
                        }}
                        transition="all 0.2s"
                    >
                        <Card.Body>
                            <HStack justify="space-between" align="flex-start">
                                <Stat.Root>
                                    <Stat.ValueText
                                        fontSize="2xl"
                                        fontWeight="bold"
                                        color="gray.800"
                                    >
                                        {stat.value}
                                    </Stat.ValueText>
                                    <Stat.Label
                                        fontSize="sm"
                                        color="gray.600"
                                        mt="1"
                                    >
                                        {stat.label}
                                    </Stat.Label>
                                    <Text fontSize="xs" color="gray.500" mt="1">
                                        {stat.description}
                                    </Text>
                                </Stat.Root>

                                <Box
                                    p="2"
                                    borderRadius="md"
                                    bg={`${stat.color}.50`}
                                    color={`${stat.color}.600`}
                                    flexShrink={0}
                                >
                                    {stat.icon}
                                </Box>
                            </HStack>
                        </Card.Body>
                    </Card.Root>
                ))}
            </Grid>
        </Box>
    )
}


/* Loader Component */
