"use client"

import {
    Heading,
    HStack,
    VStack,
    Button,
    Text,
    Flex,
} from "@chakra-ui/react"
import { Key, Edit } from "iconsax-reactjs"

interface ProfileHeaderProps {
    onEditProfile: () => void
    onChangePassword: () => void
}

export const ProfileHeader = ({ onEditProfile, onChangePassword }: ProfileHeaderProps) => {
    return (
        <VStack align="stretch" gap={{ base: 3, md: 4 }}>
            {/* First row: Admin Profile title */}
            <Heading size="3xl">Admin Profile</Heading>

            {/* Second row: Subtitle */}
            <Text color="gray.600" fontSize="lg">
                Manage your account settings and preferences
            </Text>

            {/* Third row: Change Password and Edit Profile buttons */}
            <HStack gap={{ base: 3, md: 4 }} justify={{ base: "stretch", md: "flex-start" }}>
                <Button
                    variant="outline"
                    rounded="xl"
                    onClick={onChangePassword}
                    flex={{ base: 1, md: "initial" }}
                >
                    <Key />
                    Change Password
                </Button>
                <Button
                    colorPalette="accent"
                    rounded="xl"
                    onClick={onEditProfile}
                    flex={{ base: 1, md: "initial" }}
                >
                    <Edit />
                    Edit Profile
                </Button>
            </HStack>
        </VStack>
    )
}