"use client"

import {
    VStack,
    Card,
    Heading,
    Text,
    Grid,
    HStack,
    Separator,
    Button,
    Badge,
} from "@chakra-ui/react"
import {
    Sms,
    CallCalling,
    Briefcase,
    Building,
    Logout,
    Location,
} from "iconsax-reactjs"
import { useMe } from "@/hooks/useMe"
import { rolesToString } from "@/utils/role.utils";



interface ProfileDetailsProps {
    onLogout: () => void
}

export const ProfileDetails = ({ onLogout }: ProfileDetailsProps) => {
    const { user } = useMe()

    const getAccessLevelLabel = () => {
        const role_ = rolesToString(user?.roles || [])
        if (!user || !role_ || role_.length === 0) return 'User';

        // Map roles to display labels
        const roleLabels: Record<string, string> = {
            'Super Admin': 'Super Administrator',
            'admin': 'System Administrator',
            'State Admin': 'State Administrator',
            'Region Admin': 'Region Administrator',
            'District Admin': 'District Administrator',
            'Group Admin': 'Group Administrator',
            'Viewer': 'Viewer',
        };

        // Priority order for roles (highest to lowest)
        const rolePriority = ['Super Admin', 'admin', 'State Admin', 'Region Admin', 'District Admin', 'Group Admin', 'Viewer'];
        
        // Find the highest priority role the user has
        for (const role of rolePriority) {
            if (role_.includes(role as any)) {
                return roleLabels[role] || role;
            }
        }

        // If no known role found, return the first role or 'User'
        return role_[0] || 'User';
    };

    const getRegionInfo = () => {
        if (!user) return 'Not assigned';

        const parts: string[] = [];
        if (user.region_id) parts.push(`Region ${user.region_id}`);
        if (user.state_id) parts.push(`State ${user.state_id}`);
        if (user.district_id) parts.push(`District ${user.district_id}`);

        return parts.length > 0 ? parts.join(' • ') : 'All regions';
    };

    return (
        <VStack gap="6" align="stretch" minW="0">
            {/* Personal Information */}
            <Card.Root rounded="2xl">
                <Card.Header>
                    <Heading size="lg">Personal Information</Heading>
                    <Text color="gray.600">Your personal details and contact information</Text>
                </Card.Header>
                <Card.Body>
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="6" minW="0">
                        <VStack gap="4" align="start" minW="0">
                            <VStack gap="1" align="start" w="full">
                                <Text fontSize="sm" color="gray.600" fontWeight="medium">Full Name</Text>
                                <Text fontSize="lg" fontWeight="semibold" wordBreak="break-word">
                                    {user?.name || 'N/A'}
                                </Text>
                            </VStack>

                            <VStack gap="1" align="start" w="full">
                                <Text fontSize="sm" color="gray.600" fontWeight="medium">Email Address</Text>
                                <HStack gap="2" w="full">
                                    <Sms size="16" />
                                    <Text fontSize="lg" wordBreak="break-word">{user?.email}</Text>
                                </HStack>
                            </VStack>

                            <VStack gap="1" align="start" w="full">
                                <Text fontSize="sm" color="gray.600" fontWeight="medium">Phone Number</Text>
                                <HStack gap="2" w="full">
                                    <CallCalling size="16" />
                                    <Text fontSize="lg" wordBreak="break-word">{user?.phone || 'Not provided'}</Text>
                                </HStack>
                            </VStack>
                        </VStack>

                        <VStack gap="4" align="start" minW="0">
                            <VStack gap="1" align="start">
                                <Text fontSize="sm" color="gray.600" fontWeight="medium">Access Level</Text>
                                <HStack gap="2">
                                    <Briefcase size="16" />
                                    <Text fontSize="lg" textTransform="capitalize">
                                        {getAccessLevelLabel()}
                                    </Text>
                                </HStack>
                            </VStack>

                            <VStack gap="1" align="start">
                                <Text fontSize="sm" color="gray.600" fontWeight="medium">User ID</Text>
                                <HStack gap="2">
                                    <Building size="16" />
                                    <Text fontSize="lg">{user?.id}</Text>
                                </HStack>
                            </VStack>

                            <VStack gap="1" align="start">
                                <Text fontSize="sm" color="gray.600" fontWeight="medium">Assigned Region</Text>
                                <HStack gap="2">
                                    <Location size="16" />
                                    <Text fontSize="lg">
                                        {getRegionInfo()}
                                    </Text>
                                </HStack>
                            </VStack>
                        </VStack>
                    </Grid>
                </Card.Body>
            </Card.Root>

            {/* Bio Section */}
            <Card.Root rounded="2xl">
                <Card.Header>
                    <Heading size="lg">About Me</Heading>
                    <Text color="gray.600">Your professional bio and description</Text>
                </Card.Header>
                <Card.Body>
                    <Text fontSize="lg" lineHeight="1.6">
                        {user?.access_level ? `Access Level: ${user.access_level}` : 'No information available'}
                    </Text>
                </Card.Body>
            </Card.Root>

            {/* Security & Preferences */}
            <Card.Root rounded="2xl">
                <Card.Header>
                    <Heading size="lg">Security & Preferences</Heading>
                </Card.Header>
                <Card.Body>
                    <VStack gap="4" align="stretch">
                        <HStack justify="space-between">
                            <VStack gap="1" align="start">
                                <Text fontWeight="semibold">Account Status</Text>
                                <Text fontSize="sm" color="gray.600">Current activation status of your account</Text>
                            </VStack>
                            <Badge
                                colorPalette={user?.is_active ? "green" : "red"}
                                rounded="full"
                            >
                                {user?.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </HStack>

                        <Separator />

                        <HStack justify="space-between">
                            <VStack gap="1" align="start">
                                <Text fontWeight="semibold">Two-Factor Authentication</Text>
                                <Text fontSize="sm" color="gray.600">Add an extra layer of security to your account</Text>
                            </VStack>
                            <Badge colorPalette="orange" rounded="full">Not Enabled</Badge>
                        </HStack>

                        <Separator />

                        <HStack justify="space-between">
                            <VStack gap="1" align="start">
                                <Text fontWeight="semibold">Account Activity</Text>
                                <Text fontSize="sm" color="gray.600">Last password change: 2 months ago</Text>
                            </VStack>
                            <Button
                                variant="outline"
                                rounded="xl"
                                onClick={onLogout}
                            >
                                <Logout />
                                Sign Out
                            </Button>
                        </HStack>
                    </VStack>
                </Card.Body>
            </Card.Root>
        </VStack>
    )
}