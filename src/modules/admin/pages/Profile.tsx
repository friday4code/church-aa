// components/admin-profile/AdminProfilePage.tsx
"use client"

import { useState, useRef } from "react"
import {
    Box,
    Heading,
    HStack,
    VStack,
    Button,
    Card,
    Flex,
    Text,
    Badge,
    Avatar,
    IconButton,
    Grid,
    Progress,
    Separator,
    Portal,
    Dialog,
    Field,
    Input,
    Textarea,
    CloseButton,
    Spinner,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Edit,
    Shield,
    User,
    Calendar,
    CallCalling,
    Sms,
    Building,
    Briefcase,
    Camera,
    Key,
    TickCircle,
    Activity,
    Logout
} from "iconsax-reactjs"
import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import { ENV } from "@/config/env"
import { ErrorBoundary } from "react-error-boundary"
import ErrorFallback from "@/components/ErrorFallback"
import { Toaster, toaster } from "@/components/ui/toaster"
import { type AdminProfileFormData, adminProfileSchema, type ChangePasswordFormData, changePasswordSchema } from "../schemas/profile.schema"
import { useAuthStore } from "@/store/auth.store"




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
    const { user, logout } = useAuthStore()
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Transform auth user to profile format
    const profile = {
        id: user?.id?.toString() || '1',
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone_number || '',
        role: user?.role || 'user',
        department: 'Administration', // You might want to add this to your User type
        bio: 'System administrator with full access to all features and settings.',
        avatar: user?.avatar_url || '/api/placeholder/150/150',
        joinDate: new Date('2023-01-15'), // You might want to add this to your User type
        lastLogin: new Date(), // You might want to add this to your User type
        isActive: true
    }

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
            // Simulate upload - you'll want to replace this with actual API call
            await new Promise(resolve => setTimeout(resolve, 1500))
            toaster.success({
                title: "Avatar updated",
                description: "Your profile picture has been updated successfully",
                duration: 3000,
            })
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

    const updateProfile = (data: AdminProfileFormData) => {
        // In a real app, you'd make an API call here
        toaster.success({
            title: "Profile updated",
            description: "Your profile has been updated successfully",
            closable: true
        })
        console.log('Profile update data:', data)
    }

    return (
        <>
            <VStack gap="6" align="stretch" pos="relative">
                {/* Header */}
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
                            onClick={() => setIsPasswordDialogOpen(true)}
                        >
                            <Key />
                            Change Password
                        </Button>
                        <Button
                            colorPalette="accent"
                            rounded="xl"
                            onClick={() => setIsEditDialogOpen(true)}
                        >
                            <Edit />
                            Edit Profile
                        </Button>
                    </HStack>
                </Flex>

                <Grid templateColumns={{ base: "1fr", lg: "1fr 2fr" }} gap="6">
                    {/* Sidebar - Profile Overview */}
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
                                            onClick={handleAvatarClick}
                                            disabled={isUploading}
                                        >
                                            {isUploading ? <Spinner size="xs" /> : <Camera />}
                                        </IconButton>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleAvatarChange}
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                        />
                                    </Box>

                                    <VStack gap="1">
                                        <Heading size="xl" color="white">
                                            {profile.firstName} {profile.lastName}
                                        </Heading>
                                        <Text opacity={0.9} fontSize="lg">
                                            {user?.role === 'admin' ? 'Administrator' : 'User'}
                                        </Text>
                                        <Badge colorPalette="green" rounded="full" px="3" py="1">
                                            <TickCircle size="12" />
                                            Active
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
                                        <HStack justify="space-between" w="full">
                                            <Text fontSize="sm" color="gray.600">Profile Completion</Text>
                                            <Text fontSize="sm" fontWeight="semibold">85%</Text>
                                        </HStack>
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
                                            <Text fontSize="sm">System access level: <strong>{user?.role === "admin" ? 'Full' : 'Limited'}</strong></Text>
                                        </HStack>

                                        <HStack gap="3">
                                            <Shield />
                                            <Text fontSize="sm">Security: <strong>Enabled</strong></Text>
                                        </HStack>

                                        <HStack gap="3">
                                            <User />
                                            <Text fontSize="sm">Role: <strong>{user?.role}</strong></Text>
                                        </HStack>
                                    </VStack>
                                </VStack>
                            </Card.Body>
                        </Card.Root>
                    </VStack>

                    {/* Main Content - Profile Details */}
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
                                                {user?.full_name || `${profile.firstName} ${profile.lastName}`}
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
                                                <Text fontSize="lg">{user?.phone_number || 'Not provided'}</Text>
                                            </HStack>
                                        </VStack>
                                    </VStack>

                                    <VStack gap="4" align="start">
                                        <VStack gap="1" align="start">
                                            <Text fontSize="sm" color="gray.600" fontWeight="medium">Role</Text>
                                            <HStack gap="2">
                                                <Briefcase size="16" />
                                                <Text fontSize="lg" textTransform="capitalize">
                                                    {user?.role}
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
                                            <Text fontSize="sm" color="gray.600" fontWeight="medium">Member Since</Text>
                                            <HStack gap="2">
                                                <Calendar size="16" />
                                                <Text fontSize="lg">
                                                    {profile.joinDate.toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
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
                                            <Text fontWeight="semibold">Two-Factor Authentication</Text>
                                            <Text fontSize="sm" color="gray.600">Add an extra layer of security to your account</Text>
                                        </VStack>
                                        <Badge colorPalette="orange" rounded="full">Not Enabled</Badge>
                                    </HStack>

                                    <Separator />

                                    <HStack justify="space-between">
                                        <VStack gap="1" align="start">
                                            <Text fontWeight="semibold">Login Notifications</Text>
                                            <Text fontSize="sm" color="gray.600">Get notified of new sign-ins</Text>
                                        </VStack>
                                        <Badge colorPalette="green" rounded="full">Enabled</Badge>
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
                                            onClick={handleLogout}
                                        >
                                            <Logout />
                                            Sign Out
                                        </Button>
                                    </HStack>
                                </VStack>
                            </Card.Body>
                        </Card.Root>
                    </VStack>
                </Grid >
            </VStack >


            <Toaster />

            {/* Edit Profile Dialog */}
            <EditProfileDialog
                isOpen={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                onSave={updateProfile}
                profile={profile}
            />

            {/* Change Password Dialog */}
            <ChangePasswordDialog
                isOpen={isPasswordDialogOpen}
                onClose={() => setIsPasswordDialogOpen(false)}
            />
        </>
    )
}

// Edit Profile Dialog Component
interface EditProfileDialogProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: AdminProfileFormData) => void
    profile: any
}

const EditProfileDialog = ({ isOpen, onClose, onSave, profile }: EditProfileDialogProps) => {
    const { watch, register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<AdminProfileFormData>({
        resolver: zodResolver(adminProfileSchema),
        defaultValues: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            phone: profile.phone,
            role: profile.role,
            department: profile.department,
            bio: profile.bio,
        }
    })

    const onSubmit = (data: AdminProfileFormData) => {
        onSave(data)
        onClose()
        reset(data)
    }

    const handleClose = () => {
        onClose()
        reset()
    }

    return (
        <Dialog.Root
            open={isOpen}
            onOpenChange={(e) => !e.open && handleClose()}
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="2xl" maxW="2xl">
                        <Dialog.Header>
                            <Dialog.Title>Edit Profile</Dialog.Title>
                            <Text color="gray.600">Update your personal information</Text>
                        </Dialog.Header>

                        <Dialog.Body>
                            <form id="edit-profile-form" onSubmit={handleSubmit(onSubmit)}>
                                <VStack gap="4">
                                    <Grid templateColumns="1fr 1fr" gap="4" w="full">
                                        <Field.Root required invalid={!!errors.firstName}>
                                            <Field.Label>First Name</Field.Label>
                                            <Input
                                                rounded="lg"
                                                placeholder="Enter first name"
                                                {...register('firstName')}
                                            />
                                            <Field.ErrorText>{errors.firstName?.message}</Field.ErrorText>
                                        </Field.Root>

                                        <Field.Root required invalid={!!errors.lastName}>
                                            <Field.Label>Last Name</Field.Label>
                                            <Input
                                                rounded="lg"
                                                placeholder="Enter last name"
                                                {...register('lastName')}
                                            />
                                            <Field.ErrorText>{errors.lastName?.message}</Field.ErrorText>
                                        </Field.Root>
                                    </Grid>

                                    <Field.Root required invalid={!!errors.email}>
                                        <Field.Label>Email Address</Field.Label>
                                        <Input
                                            rounded="lg"
                                            type="email"
                                            placeholder="Enter email address"
                                            {...register('email')}
                                        />
                                        <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root invalid={!!errors.phone}>
                                        <Field.Label>Phone Number</Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter phone number"
                                            {...register('phone')}
                                        />
                                        <Field.ErrorText>{errors.phone?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.role}>
                                        <Field.Label>Role</Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter your role"
                                            {...register('role')}
                                            disabled
                                        />
                                        <Field.HelperText>Role cannot be changed</Field.HelperText>
                                        <Field.ErrorText>{errors.role?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root invalid={!!errors.department}>
                                        <Field.Label>Department</Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter department"
                                            {...register('department')}
                                        />
                                        <Field.ErrorText>{errors.department?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root invalid={!!errors.bio}>
                                        <Field.Label>Bio</Field.Label>
                                        <Textarea
                                            rounded="lg"
                                            placeholder="Tell us about yourself..."
                                            rows={4}
                                            {...register('bio')}
                                        />
                                        <Field.HelperText>
                                            {watch('bio')?.length || 0}/500 characters
                                        </Field.HelperText>
                                        <Field.ErrorText>{errors.bio?.message}</Field.ErrorText>
                                    </Field.Root>
                                </VStack>
                            </form>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline" rounded="xl" onClick={handleClose}>
                                    Cancel
                                </Button>
                            </Dialog.ActionTrigger>
                            <Button
                                type="submit"
                                form="edit-profile-form"
                                colorPalette="accent"
                                rounded="xl"
                                loading={isSubmitting}
                            >
                                Save Changes
                            </Button>
                        </Dialog.Footer>

                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

// Change Password Dialog Component
interface ChangePasswordDialogProps {
    isOpen: boolean
    onClose: () => void
}

const ChangePasswordDialog = ({ isOpen, onClose }: ChangePasswordDialogProps) => {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
    })

    const onSubmit = async (data: ChangePasswordFormData) => {
        try {
            // Simulate API call - replace with actual password change API
            await new Promise(resolve => setTimeout(resolve, 1500))
            toaster.success({
                title: "Password updated",
                description: "Your password has been changed successfully",
                duration: 3000,
            })
            onClose()
            reset()
        } catch (error) {
            toaster.error({
                title: "Update failed",
                description: "Failed to change password. Please try again.",
                duration: 3000,
            })
        }
    }

    const handleClose = () => {
        onClose()
        reset()
    }

    const newPassword = watch('newPassword')

    const getPasswordStrength = (password: string) => {
        if (!password) return { strength: 0, color: 'gray', label: '' }

        let strength = 0
        if (password.length >= 8) strength += 25
        if (/[a-z]/.test(password)) strength += 25
        if (/[A-Z]/.test(password)) strength += 25
        if (/[@$!%*?&]/.test(password)) strength += 25

        const colors = {
            25: 'red',
            50: 'orange',
            75: 'yellow',
            100: 'green'
        }

        const labels = {
            25: 'Weak',
            50: 'Fair',
            75: 'Good',
            100: 'Strong'
        }

        return {
            strength,
            color: colors[Math.ceil(strength / 25) * 25] as 'red' | 'orange' | 'yellow' | 'green',
            label: labels[Math.ceil(strength / 25) * 25] as string
        }
    }

    const passwordStrength = getPasswordStrength(newPassword || '')

    return (
        <Dialog.Root
            open={isOpen}
            onOpenChange={(e) => !e.open && handleClose()}
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="2xl" maxW="md">
                        <Dialog.Header>
                            <Dialog.Title>Change Password</Dialog.Title>
                            <Text color="gray.600">Update your account password</Text>
                        </Dialog.Header>

                        <Dialog.Body>
                            <form id="change-password-form" onSubmit={handleSubmit(onSubmit)}>
                                <VStack gap="4">
                                    <Field.Root required invalid={!!errors.currentPassword}>
                                        <Field.Label>Current Password</Field.Label>
                                        <Input
                                            rounded="lg"
                                            type="password"
                                            placeholder="Enter current password"
                                            {...register('currentPassword')}
                                        />
                                        <Field.ErrorText>{errors.currentPassword?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.newPassword}>
                                        <Field.Label>New Password</Field.Label>
                                        <Input
                                            rounded="lg"
                                            type="password"
                                            placeholder="Enter new password"
                                            {...register('newPassword')}
                                        />
                                        {newPassword && (
                                            <VStack gap="2" align="start" w="full" mt="2">
                                                <HStack justify="space-between" w="full">
                                                    <Text fontSize="sm">Password Strength</Text>
                                                    <Text fontSize="sm" fontWeight="semibold" color={`${passwordStrength.color}.500`}>
                                                        {passwordStrength.label}
                                                    </Text>
                                                </HStack>
                                                <Progress.Root value={passwordStrength.strength} size="sm" rounded="full" w="full">
                                                    <Progress.Track bg="gray.100" rounded="full">
                                                        <Progress.Range bg={`${passwordStrength.color}.500`} rounded="full" />
                                                    </Progress.Track>
                                                </Progress.Root>
                                            </VStack>
                                        )}
                                        <Field.ErrorText>{errors.newPassword?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.confirmPassword}>
                                        <Field.Label>Confirm New Password</Field.Label>
                                        <Input
                                            rounded="lg"
                                            type="password"
                                            placeholder="Confirm new password"
                                            {...register('confirmPassword')}
                                        />
                                        <Field.ErrorText>{errors.confirmPassword?.message}</Field.ErrorText>
                                    </Field.Root>
                                </VStack>
                            </form>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline" rounded="xl" onClick={handleClose}>
                                    Cancel
                                </Button>
                            </Dialog.ActionTrigger>
                            <Button
                                type="submit"
                                form="change-password-form"
                                colorPalette="accent"
                                rounded="xl"
                                loading={isSubmitting}
                            >
                                Update Password
                            </Button>
                        </Dialog.Footer>

                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}