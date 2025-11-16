// components/admin-profile/AdminProfilePage.tsx
"use client"

import { useState, useRef } from "react"
import {
    VStack,
    Grid,
} from "@chakra-ui/react"
import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import { ENV } from "@/config/env"
import { ErrorBoundary } from "react-error-boundary"
import ErrorFallback from "@/components/ErrorFallback"
import { Toaster, toaster } from "@/components/ui/toaster"
import { useAuth } from "@/hooks/useAuth"
import { useMe } from "@/hooks/useMe"

// Import components
import { EditProfileDialog } from "./components/EditProfileDialog"
import { ChangePasswordDialog } from "./components/ChangePasswordDialog"
import { ProfileHeader } from "./components/ProfileHeader"
import { ProfileSidebar } from "./components/ProfileSidebar"
import { ProfileDetails } from "./components/ProfileDetails"

export const AdminProfilePage: React.FC = () => {
    const { reset } = useQueryErrorResetBoundary();

    return (
        <>
            <title>Admin Profile | {ENV.APP_NAME}</title>
            <meta
                name="description"
                content="Manage your admin profile and settings"
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

export default AdminProfilePage;

const Content = () => {
    const { logout } = useAuth()
    const { refetch } = useMe()
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toaster.error({
                title: "Invalid file type",
                description: "Please select an image file",
                duration: 3000,
            })
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toaster.error({
                title: "File too large",
                description: "Please select an image smaller than 5MB",
                duration: 3000,
            })
            return
        }

        setIsUploading(true)
        try {
            // TODO: Implement actual avatar upload API call
            // For now, just create a local URL (will be replaced with actual API call)
            URL.createObjectURL(file)
            toaster.success({
                title: "Avatar updated",
                description: "Your profile picture has been updated successfully",
                duration: 3000,
            })
            // Refresh user data after upload
            await refetch()
        } catch (error) {
            toaster.error({
                title: "Upload failed",
                description: "Failed to update profile picture",
                duration: 3000,
            })
        } finally {
            setIsUploading(false)
            // Clear the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleLogout = () => {
        logout()
        toaster.info({
            title: "Logged out",
            description: "You have been successfully logged out",
            duration: 3000,
        })
    }

    return (
        <>
            <VStack gap="6" align="stretch" pos="relative">
                {/* Header */}
                <ProfileHeader
                    onEditProfile={() => setIsEditDialogOpen(true)}
                    onChangePassword={() => setIsPasswordDialogOpen(true)}
                />

                <Grid templateColumns={{ base: "1fr", lg: "1fr 2fr" }} gap="6">
                    {/* Sidebar - Profile Overview */}
                    <ProfileSidebar
                        onAvatarClick={handleAvatarClick}
                        isUploading={isUploading}
                    />

                    {/* Main Content - Profile Details */}
                    <ProfileDetails onLogout={handleLogout} />
                </Grid>

                {/* Hidden file input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                />
            </VStack>

            <Toaster />

            {/* Edit Profile Dialog */}
            <EditProfileDialog
                isOpen={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
            />

            {/* Change Password Dialog */}
            <ChangePasswordDialog
                isOpen={isPasswordDialogOpen}
                onClose={() => setIsPasswordDialogOpen(false)}
            />
        </>
    )
}