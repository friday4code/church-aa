"use client"

import {
    Dialog,
    Portal,
    Field,
    CloseButton,
    Button,
    VStack,
    Input,
    InputGroup,
    IconButton,
    Text,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { Eye, EyeSlash } from "iconsax-reactjs"
import { userSchema, type UserFormData } from "@/modules/admin/schemas/users.schema"
import { useAuthStore } from "@/store/auth.store"

interface UserDialogProps {
    isLoading?: boolean
    isOpen: boolean
    user?: any
    mode: 'add' | 'edit'
    onClose: () => void
    onSave: (data: UserFormData) => void
}

const UserDialog = ({ isLoading, isOpen, user, mode, onClose, onSave }: UserDialogProps) => {
    const [showPassword, setShowPassword] = useState(false)
    const authUser = useAuthStore((state) => state.user)

    // Determine effective IDs (prefer the user being edited, fallback to auth user's IDs)
    const effectiveStateId = (user && (user.state_id ?? undefined)) ?? authUser?.state_id
    const effectiveRegionId = (user && (user.region_id ?? undefined)) ?? authUser?.region_id
    const effectiveDistrictId = (user && (user.district_id ?? undefined)) ?? authUser?.district_id

    // If any of these are missing, Zod validation (which requires min(1)) will fail silently
    // when submitting hidden fields. Disable submit and show a helpful message instead.
    const canSubmit = !!effectiveStateId && !!effectiveRegionId && !!effectiveDistrictId

    const { register, handleSubmit, formState: { errors }, reset } = useForm<UserFormData>({
        resolver: zodResolver(userSchema(mode)),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            password: '',
            state_id: user?.state_id || authUser?.state_id || 0,
            region_id: user?.region_id || authUser?.region_id || 0,
            district_id: user?.district_id || authUser?.district_id || 0,
            roles: user?.roles || [1]
        }
    })

    const onSubmit = (data: UserFormData) => {
        console.log("payload",data);
        
        onSave(data)
        reset()
    }

    const handleClose = () => {
        onClose()
        reset()
        setShowPassword(false)
    }

    // Reset form when dialog opens with user data
    useEffect(() => {
        if (isOpen && user) {
            reset({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                password: '',
                state_id: user.state_id || authUser?.state_id || 0,
                region_id: user.region_id || authUser?.region_id || 0,
                district_id: user.district_id || authUser?.district_id || 0,
                roles: user.roles || [1]
            })
        } else if (isOpen && !user) {
            // For add mode, set defaults from auth user
            reset({
                name: '',
                email: '',
                phone: '',
                password: '',
                state_id: authUser?.state_id || 0,
                region_id: authUser?.region_id || 0,
                district_id: authUser?.district_id || 0,
                roles: [1]
            })
        }
    }, [isOpen, user, authUser, reset])

    return (
        <Dialog.Root
            open={isOpen}
            onOpenChange={(e) => {
                if (!e.open) {
                    handleClose()
                }
            }}
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl" maxW="2xl">
                        <Dialog.Header>
                            <Dialog.Title>
                                {mode === 'add' ? 'Add New User' : 'Update User'}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <form noValidate id="user-form" onSubmit={handleSubmit(onSubmit)}>
                                <VStack gap="4" colorPalette={"accent"}>
                                    {!canSubmit && mode === 'add' && (
                                        <Text color="red.500" fontSize="sm">
                                            Your account does not have a valid State / Region / District assigned. Please update your profile or contact an administrator before adding users.
                                        </Text>
                                    )}
                                    <Field.Root required invalid={!!errors.name}>
                                        <Field.Label>Full Name
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter full name"
                                            {...register('name')}
                                        />
                                        <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.email}>
                                        <Field.Label>Email
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter email address"
                                            {...register('email')}
                                        />
                                        <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.phone}>
                                        <Field.Label>Phone
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter phone number"
                                            {...register('phone')}
                                        />
                                        <Field.ErrorText>{errors.phone?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required={mode === 'add'} invalid={!!errors.password}>
                                        <Field.Label>Password
                                            {mode === 'add' && <Field.RequiredIndicator />}
                                        </Field.Label>
                                        <InputGroup
                                            endElement={
                                                <IconButton
                                                    variant="ghost"
                                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <EyeSlash /> : <Eye />}
                                                </IconButton>
                                            }
                                        >
                                            <Input
                                                rounded="lg"
                                                type={showPassword ? "text" : "password"}
                                                placeholder={mode === 'add' ? "Enter password" : "Enter new password (leave blank to keep current)"}
                                                {...register('password')}
                                            />
                                        </InputGroup>
                                        {mode === 'edit' && (
                                            <Field.HelperText>Leave blank to keep current password</Field.HelperText>
                                        )}
                                        <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
                                    </Field.Root>

                                    {/* Hidden fields for API compatibility */}
                                    <input type="hidden" {...register('state_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('region_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('district_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('roles')} />
                                </VStack>
                            </form>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button rounded="xl" variant="outline">Cancel</Button>
                            </Dialog.ActionTrigger>

                            <Button
                                rounded="xl"
                                type="submit"
                                form="user-form"
                                colorPalette="accent"
                                loading={isLoading}
                                loadingText={mode === 'add' ? 'Adding User' : 'Updating User'}
                                disabled={isLoading || (mode === 'add' && !canSubmit)}
                            >
                                {mode === 'add' ? 'Add User' : 'Update User'}
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

export default UserDialog;