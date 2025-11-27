"use client"

import {
    Dialog,
    Portal,
    Field,
    Input,
    CloseButton,
    Button,
    VStack,
    HStack,
    Progress,
    Text,
    InputGroup,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toaster } from "@/components/ui/toaster"
import { type ChangePasswordFormData, changePasswordSchema } from "../../../schemas/profile.schema"
import { authApi } from "@/api/auth.api"

interface ChangePasswordDialogProps {
    isOpen: boolean
    onClose: () => void
}
import { useState } from "react"
import { IconButton } from "@chakra-ui/react"
import { Eye, EyeSlash } from "iconsax-reactjs"
import { delay } from "@/utils/helpers"

export const ChangePasswordDialog = ({ isOpen, onClose }: ChangePasswordDialogProps) => {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
    })

    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const onSubmit = async (data: ChangePasswordFormData) => {
        try {
            const payload = {
                current_password: data.currentPassword,
                new_password: data.newPassword,
                confirm_new_password: data.confirmPassword,
            }
            await authApi.changePassword(payload)
            toaster.success({
                title: "Password updated",
                description: "Your password has been changed successfully",
                duration: 3000,
            })
            await delay(1000);
            onClose()
            reset()
        } catch {
            toaster.error({
                title: "Update failed",
                description: "Failed to change password. Please try again.",
                duration: 3000,
            })

            await delay(1000)
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
            role="alertdialog"
            open={isOpen}
            onOpenChange={(e) => !e.open && handleClose()}
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="2xl" maxW="md">
                        <Dialog.Header>
                            <Dialog.Title>Change Password</Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <form id="change-password-form" onSubmit={handleSubmit(onSubmit)}>
                                <VStack gap="4">
                                    <Field.Root required invalid={!!errors.currentPassword}>
                                        <Field.Label>Current Password</Field.Label>
                                        <InputGroup
                                            endElement={
                                                <IconButton
                                                    aria-label="Toggle current password visibility"
                                                    variant="ghost"
                                                    size="sm"
                                                    position="absolute"
                                                    right="2"
                                                    top="50%"
                                                    transform="translateY(-50%)"
                                                    onClick={() => setShowCurrent((v) => !v)}
                                                >
                                                    {showCurrent ? <EyeSlash /> : <Eye />}
                                                </IconButton>
                                            }
                                        >
                                            <Input
                                                rounded="lg"
                                                type={showCurrent ? 'text' : 'password'}
                                                placeholder="Enter current password"
                                                pr="10"
                                                {...register('currentPassword')}
                                            />
                                        </InputGroup>

                                        <Field.ErrorText>{errors.currentPassword?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.newPassword}>
                                        <Field.Label>New Password</Field.Label>
                                        <InputGroup
                                            endElement={
                                                <IconButton
                                                    aria-label="Toggle new password visibility"
                                                    variant="ghost"
                                                    size="sm"
                                                    position="absolute"
                                                    right="2"
                                                    top="50%"
                                                    transform="translateY(-50%)"
                                                    onClick={() => setShowNew((v) => !v)}
                                                >
                                                    {showNew ? <EyeSlash /> : <Eye />}
                                                </IconButton>
                                            }
                                        >
                                            <Input
                                                rounded="lg"
                                                type={showNew ? 'text' : 'password'}
                                                placeholder="Enter new password"
                                                pr="10"
                                                {...register('newPassword')}
                                            />
                                        </InputGroup>

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
                                        <InputGroup
                                            endElement={
                                                <IconButton
                                                    aria-label="Toggle confirm password visibility"
                                                    variant="ghost"
                                                    size="sm"
                                                    position="absolute"
                                                    right="2"
                                                    top="50%"
                                                    transform="translateY(-50%)"
                                                    onClick={() => setShowConfirm((v) => !v)}
                                                >
                                                    {showConfirm ? <EyeSlash /> : <Eye />}
                                                </IconButton>
                                            }
                                        >
                                            <Input
                                                rounded="lg"
                                                type={showConfirm ? 'text' : 'password'}
                                                placeholder="Confirm new password"
                                                pr="10"
                                                {...register('confirmPassword')}
                                            />
                                        </InputGroup>
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