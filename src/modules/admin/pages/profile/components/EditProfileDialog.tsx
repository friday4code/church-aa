"use client"

import {
    Dialog,
    Portal,
    Field,
    Input,
    Textarea,
    CloseButton,
    Button,
    VStack,
    Grid,
    Text,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toaster } from "@/components/ui/toaster"
import { type AdminProfileFormData, adminProfileSchema } from "../../../schemas/profile.schema"
import { useMe } from "@/hooks/useMe"
import { authApi } from "@/api/auth.api"

interface EditProfileDialogProps {
    isOpen: boolean
    onClose: () => void
}

export const EditProfileDialog = ({ isOpen, onClose }: EditProfileDialogProps) => {
    const { user, refetch } = useMe()

    // Helper to extract first and last name from full name
    const extractNames = (fullName: string) => {
        const names = fullName.split(' ')
        return {
            firstName: names[0] || '',
            lastName: names.slice(1).join(' ') || ''
        }
    }

    const { firstName, lastName } = user?.name ? extractNames(user.name) : { firstName: '', lastName: '' }

    const { watch, register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<AdminProfileFormData>({
        resolver: zodResolver(adminProfileSchema),
        defaultValues: {
            firstName,
            lastName,
            email: user?.email || '',
            phone: user?.phone || '',
            role: user?.access_level || '',
            department: '',
            bio: '',
        }
    })

    const onSubmit = async (data: AdminProfileFormData) => {
        try {
            const payload = {
                first_name: data.firstName,
                last_name: data.lastName,
                email: data.email,
                phone: data.phone,
                role: data.role,
                department: data.department,
                bio: data.bio,
            }
            await authApi.updateProfile(payload)
            toaster.success({
                title: "Profile updated",
                description: "Your profile has been updated successfully",
                closable: true
            })
            await refetch()
            onClose()
            reset(data)
        } catch {
            toaster.error({
                title: "Update failed",
                description: "Failed to update profile",
                duration: 3000,
            })
        }
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
                    <Dialog.Content rounded="2xl" maxW={{ base: "xs", sm: "sm", md: "md", lg: "2xl" }}>
                        <Dialog.Header>
                            <Dialog.Title>Edit Profile</Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <Text mb="6" color="gray.600">Update your personal information</Text>
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