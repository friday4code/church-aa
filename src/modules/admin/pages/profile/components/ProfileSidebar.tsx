"use client"

import {
    Box,
    VStack,
    Card,
    Avatar,
    IconButton,
    Badge,
    HStack,
    Text,
    Heading,
    Progress,
    Separator,
    Spinner,
    Flex,
} from "@chakra-ui/react"
import { Camera, TickCircle, Activity, Shield, User } from "iconsax-reactjs"
import { useAuthStore } from "@/store/auth.store"
import { useAdminProfileStore } from "../../../stores/profile.store"

interface ProfileSidebarProps {
    onAvatarClick: () => void
    isUploading: boolean
}

export const ProfileSidebar = ({ onAvatarClick, isUploading }: ProfileSidebarProps) => {
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

    const getAccessLevelDescription = () => {
        if (!user) return 'Limited access';

        switch (user.access_level) {
            case 'admin':
                return 'Full system access';
            case 'regional_admin':
                return `Regional access (Region ${user.region_id})`;
            case 'state_admin':
                return `State access (State ${user.state_id})`;
            case 'district_admin':
                return `District access (District ${user.district_id})`;
            default:
                return 'Limited access';
        }
    };

    return (
        <VStack gap="6" align="stretch">
            {/* Profile Card */}
            <Card.Root rounded="2xl" bg="linear-gradient(135deg, {colors.accent.500} 0%, {colors.red.700} 140%)" color="white">
                <Card.Body p="6">
                    <VStack gap="4" align="center" textAlign="center">
                        <Box position="relative">
                            <Avatar.Root boxSize={"24"}>
                                <Avatar.Image
                                    src={profile.avatar}
                                    alt={`${profile.firstName} ${profile.lastName}`}
                                />
                                <Avatar.Fallback
                                    name={`${profile.firstName} ${profile.lastName}`}
                                />
                            </Avatar.Root>
                            <IconButton
                                position="absolute"
                                bottom="-2"
                                right="0"
                                border="sm"
                                borderColor={"bg"}
                                size="sm"
                                rounded="full"
                                bg="accent.500"
                                color="white"
                                _hover={{ bg: "accent.600" }}
                                onClick={onAvatarClick}
                                disabled={isUploading}
                            >
                                {isUploading ? <Spinner size="xs" /> : <Camera />}
                            </IconButton>
                        </Box>

                        <VStack gap="1">
                            <Heading size="xl" color="white">
                                {profile.firstName} {profile.lastName}
                            </Heading>
                            <Text opacity={0.9} fontSize="lg">
                                {getAccessLevelLabel()}
                            </Text>
                            <Badge
                                colorPalette={user?.is_active ? "green" : "red"}
                                rounded="full"
                                px="3"
                                py="1"
                            >
                                <TickCircle size="12" />
                                {user?.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </VStack>

                        <HStack gap="4" justify="center" wrap="wrap">
                            <VStack gap="0">
                                <Text fontSize="sm" opacity={0.8}>Member Since</Text>
                                <Text fontWeight="semibold">
                                    {profile.joinDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </Text>
                            </VStack>

                            <VStack gap="0">
                                <Text fontSize="sm" opacity={0.8}>Last Login</Text>
                                <Text fontWeight="semibold">
                                    {profile.lastLogin.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </Text>
                            </VStack>
                        </HStack>
                    </VStack>
                </Card.Body>
            </Card.Root>

            {/* Quick Stats */}
            <Card.Root rounded="2xl">
                <Card.Header>
                    <Heading size="lg">Quick Stats</Heading>
                </Card.Header>
                <Card.Body>
                    <VStack gap="4" align="stretch">
                        <VStack gap="2" align="start">
                            <Flex justify="space-between" w="full">
                                <Text fontSize="sm" color="gray.600">Profile Completion</Text>
                                <Text fontSize="sm" fontWeight="semibold">85%</Text>
                            </Flex>
                            <Progress.Root value={85} size="sm" rounded="full" w="full">
                                <Progress.Track bg="gray.100" rounded="full">
                                    <Progress.Range bg="accent.500" rounded="full" />
                                </Progress.Track>
                            </Progress.Root>
                        </VStack>

                        <Separator />

                        <VStack gap="3" align="start">
                            <HStack gap="3">
                                <Activity />
                                <Text fontSize="sm">Access Level: <strong>{getAccessLevelDescription()}</strong></Text>
                            </HStack>

                            <HStack gap="3">
                                <Shield />
                                <Text fontSize="sm">Security: <strong>{user?.is_active ? 'Enabled' : 'Disabled'}</strong></Text>
                            </HStack>

                            <HStack gap="3">
                                <User />
                                <Text fontSize="sm">Roles: <strong>{user?.roles.join(', ') || 'None'}</strong></Text>
                            </HStack>
                        </VStack>
                    </VStack>
                </Card.Body>
            </Card.Root>
        </VStack>
    )
}