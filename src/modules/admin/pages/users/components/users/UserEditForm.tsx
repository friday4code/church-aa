"use client"

import {
    VStack,
    Field,
    Input,
    Button,
    Text,
    InputGroup,
    IconButton,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Eye, EyeSlash } from "iconsax-reactjs"
import { userSchema, type UserFormData } from "@/modules/admin/schemas/users.schema"

interface UserEditFormProps {
    user: any
    onUpdate: (data: Partial<UserFormData>) => void
    onCancel: () => void
}

const UserEditForm = ({ user, onUpdate, onCancel }: UserEditFormProps) => {
    const [showPassword, setShowPassword] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<UserFormData>({
        resolver: zodResolver(userSchema("edit")),
        defaultValues: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            password: '', // Don't pre-fill password for security
            state_id: user.state_id || 0,
            region_id: user.region_id || 0,
            district_id: user.district_id || 0,
            roles: user.roles || ['user']
        }
    })

    const onSubmit = (data: UserFormData) => {
        onUpdate(data)
    }

    return (
        <VStack gap="4" align="stretch">
            <Text fontSize="sm" color="gray.600" mb="2">
                Editing: <strong>{user.name}</strong>
            </Text>

            <form id={`user-form-${user.id}`} onSubmit={handleSubmit(onSubmit)}>
                <VStack gap="4" colorPalette={"accent"}>
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

                    <Field.Root invalid={!!errors.password}>
                        <Field.Label>Password</Field.Label>
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
                                placeholder="Enter new password (leave blank to keep current)"
                                {...register('password')}
                            />
                        </InputGroup>
                        <Field.HelperText>Leave blank to keep current password</Field.HelperText>
                        <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
                    </Field.Root>

                    {/* Hidden fields for API compatibility */}
                    <input type="hidden" {...register('state_id')} />
                    <input type="hidden" {...register('region_id')} />
                    <input type="hidden" {...register('district_id')} />
                    <input type="hidden" {...register('roles')} />
                </VStack>
            </form>

            <Button
                rounded="xl"
                colorPalette="accent"
                type="submit"
                form={`user-form-${user.id}`}
            >
                Update & Close
            </Button>
        </VStack>
    )
}

export default UserEditForm;