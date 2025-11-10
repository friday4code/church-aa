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
        <Flex justify="space-between" align="center">
            <VStack align="start" gap="1">
                <Heading size="3xl">Admin Profile</Heading>
                <Text color="gray.600" fontSize="lg">
                    Manage your account settings and preferences
                </Text>
            </VStack>

            <HStack gap="3">
                <Button
                    variant="outline"
                    rounded="xl"
                    onClick={onChangePassword}
                >
                    <Key />
                    Change Password
                </Button>
                <Button
                    colorPalette="accent"
                    rounded="xl"
                    onClick={onEditProfile}
                >
                    <Edit />
                    Edit Profile
                </Button>
            </HStack>
        </Flex>
    )
}