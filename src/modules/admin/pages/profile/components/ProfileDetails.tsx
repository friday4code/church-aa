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
import { useAuthStore } from "@/store/auth.store"
import { useAdminProfileStore } from "../../../stores/profile.store"

interface ProfileDetailsProps {
    onLogout: () => void
}

export const ProfileDetails = ({ onLogout }: ProfileDetailsProps) => {
    const { user } = useAuthStore()
    const { profile } = useAdminProfileStore()

    const getAccessLevelLabel = () => {
        if (!user) return 'User';

        switch (user.access_level) {
            case 'admin':
                return 'System Administrator';
            case 'regional_admin':
                return 'Regional Administrator';
            case 'state_admin':
                return 'State Administrator';
            case 'district_admin':
                return 'District Administrator';
            default:
                return 'User';
        }
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
        <VStack gap="6" align="stretch">
            {/* Personal Information */}
            <Card.Root rounded="2xl">
                <Card.Header>
                    <Heading size="lg">Personal Information</Heading>
                    <Text color="gray.600">Your personal details and contact information</Text>
                </Card.Header>
                <Card.Body>
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="6">
                        <VStack gap="4" align="start">
                            <VStack gap="1" align="start">
                                <Text fontSize="sm" color="gray.600" fontWeight="medium">Full Name</Text>
                                <Text fontSize="lg" fontWeight="semibold">
                                    {user?.name || `${profile.firstName} ${profile.lastName}`}
                                </Text>
                            </VStack>

                            <VStack gap="1" align="start">
                                <Text fontSize="sm" color="gray.600" fontWeight="medium">Email Address</Text>
                                <HStack gap="2">
                                    <Sms size="16" />
                                    <Text fontSize="lg">{user?.email}</Text>
                                </HStack>
                            </VStack>

                            <VStack gap="1" align="start">
                                <Text fontSize="sm" color="gray.600" fontWeight="medium">Phone Number</Text>
                                <HStack gap="2">
                                    <CallCalling size="16" />
                                    <Text fontSize="lg">{user?.phone || 'Not provided'}</Text>
                                </HStack>
                            </VStack>
                        </VStack>

                        <VStack gap="4" align="start">
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
                        {profile.bio}
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