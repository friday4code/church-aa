"use client"

import {
    VStack,
    Field,
    Input,
    Button,
    Text,
    InputGroup,
    IconButton,
    Select,
    createListCollection,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useMemo } from "react"
import { Eye, EyeSlash } from "iconsax-reactjs"
import { userSchema, type UserFormData } from "@/modules/admin/schemas/users.schema"
import { useMe } from "@/hooks/useMe"
import { useRoles } from "@/modules/admin/hooks/useRoles" // Import the roles hook
import type { User } from "@/types/users.type"

interface UserEditFormProps {
    user: User
    onUpdate: (data: Partial<UserFormData>) => void
}

const UserEditForm = ({ user, onUpdate }: UserEditFormProps) => {
    const [showPassword, setShowPassword] = useState(false)
    const { user: authUser } = useMe();
    const { roles: availableRoles = [], isLoading: rolesLoading } = useRoles();

    // Create roles collection from API data
    const rolesCollection = useMemo(() => {
        const items = availableRoles.length 
            ? availableRoles.map(role => ({
                label: role.name,
                value: String(role.id)
              }))
            : [];
        
        return createListCollection({
            items: items
        });
    }, [availableRoles]);

    // Extract role IDs from user's roles
    const userRoleIds = useMemo(() => {
        if (!user?.roles) return [];
        return user.roles.map(role => role.id).filter(id => id > 0);
    }, [user]);

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<UserFormData>({
        resolver: zodResolver(userSchema("edit")) as any,
        defaultValues: {
            name: user.name,
            email: user.email,
            phone: user.phone as string,
            password: '', // Don't pre-fill password for security
            state_id: user.state_id || authUser?.state_id || 0,
            region_id: user.region_id || authUser?.region_id || 0,
            district_id: user.district_id || authUser?.district_id || 0,
            group_id: user.group_id || 0,
            old_group_id: user.old_group_id || 0,
            role_ids: userRoleIds, // Use role_ids, not roles
        }
    });

    const onSubmit = (data: UserFormData) => {
        onUpdate(data);
    };

    const roleIdsValue = ((watch('role_ids') ?? []) as number[]).map((v) => String(v));
    const rolesErrorMessage = (errors.role_ids as unknown as { message?: string } | undefined)?.message;

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

                    <Field.Root invalid={!!errors.role_ids}>
                        <Field.Label>Roles</Field.Label>
                        {rolesLoading ? (
                            <Text>Loading roles...</Text>
                        ) : (
                            <Select.Root
                                collection={rolesCollection}
                                size="sm"
                                value={roleIdsValue}
                                onValueChange={(val) => {
                                    const selectedIds = (val.value || []).map((v) => parseInt(v, 10));
                                    setValue('role_ids', selectedIds, { shouldValidate: true });
                                }}
                                multiple
                            >
                                <Select.HiddenSelect />
                                <Select.Control>
                                    <Select.Trigger rounded="lg">
                                        <Select.ValueText placeholder="Select roles" />
                                    </Select.Trigger>
                                    <Select.IndicatorGroup>
                                        <Select.Indicator />
                                    </Select.IndicatorGroup>
                                </Select.Control>
                                <Select.Positioner>
                                    <Select.Content>
                                        {rolesCollection.items.map((item: { label: string; value: string }) => (
                                            <Select.Item item={item} key={item.value}>
                                                {item.label}
                                                <Select.ItemIndicator />
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Select.Root>
                        )}
                        <Field.ErrorText>{rolesErrorMessage}</Field.ErrorText>
                    </Field.Root>

                    {/* Hidden fields for API compatibility */}
                    <input type="hidden" {...register('state_id', { valueAsNumber: true })} />
                    <input type="hidden" {...register('region_id', { valueAsNumber: true })} />
                    <input type="hidden" {...register('district_id', { valueAsNumber: true })} />
                    <input type="hidden" {...register('group_id', { valueAsNumber: true })} />
                    <input type="hidden" {...register('old_group_id', { valueAsNumber: true })} />
                    <input type="hidden" {...register('role_ids')} />
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
    );
};

export default UserEditForm;










// "use client"

// import {
//     VStack,
//     Field,
//     Input,
//     Button,
//     Text,
//     InputGroup,
//     IconButton,
//     Select,
//     createListCollection,
// } from "@chakra-ui/react"
// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useState } from "react"
// import { Eye, EyeSlash } from "iconsax-reactjs"
// import { userSchema, type UserFormData } from "@/modules/admin/schemas/users.schema"
// import { useMe } from "@/hooks/useMe"
// import type { User } from "@/types/users.type"

// interface UserEditFormProps {
//     user: User
//     onUpdate: (data: Partial<UserFormData>) => void
// }

// const UserEditForm = ({ user, onUpdate }: UserEditFormProps) => {
//     const [showPassword, setShowPassword] = useState(false)
//     const { user: authUser } = useMe();

//     const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<UserFormData>({
//         resolver: zodResolver(userSchema("edit")) as any,
//         defaultValues: {
//             name: user.name,
//             email: user.email,
//             phone: user.phone as string,
//             password: '', // Don't pre-fill password for security
//             state_id: user.state_id || authUser?.state_id || 0,
//             region_id: user.region_id || authUser?.region_id || 0,
//             district_id: user.district_id || authUser?.district_id || 0,
//             roles: Array.isArray(user.roles)
//                 ? (user.roles as string[]).map((r) => {
//                     const t = String(r).trim().toLowerCase()
//                     if (t === 'super admin') return 2
//                     if (t === 'state admin') return 3
//                     if (t === 'region admin') return 4
//                     if (t === 'district admin') return 5
//                     if (t === 'group admin') return 6
//                     if (t === 'viewer') return 7
//                     if (t === 'admin') return 1
//                     return 1
//                 })
//                 : [1]
//         }
//     })

//     const onSubmit = (data: UserFormData) => {
//         onUpdate(data)
//     }

//     const rolesCollection = createListCollection({
//         items: [
//             { label: 'Super Admin', value: '2' },
//             { label: 'State Admin', value: '3' },
//             { label: 'Region Admin', value: '4' },
//             { label: 'Group Admin', value: '6' },
//             { label: 'District Admin', value: '5' },
//             { label: 'Viewer', value: '7' },
//             { label: ' Admin', value: '1' },
//         ]
//     })
//     const rolesValue = ((watch('roles') ?? []) as (number | string)[]).map((v) => String(v))
//     const rolesErrorMessage = (errors.roles as unknown as { message?: string } | undefined)?.message

//     return (
//         <VStack gap="4" align="stretch">
//             <Text fontSize="sm" color="gray.600" mb="2">
//                 Editing: <strong>{user.name}</strong>
//             </Text>

//             <form id={`user-form-${user.id}`} onSubmit={handleSubmit(onSubmit)}>
//                 <VStack gap="4" colorPalette={"accent"}>
//                     <Field.Root required invalid={!!errors.name}>
//                         <Field.Label>Full Name
//                             <Field.RequiredIndicator />
//                         </Field.Label>
//                         <Input
//                             rounded="lg"
//                             placeholder="Enter full name"
//                             {...register('name')}
//                         />
//                         <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
//                     </Field.Root>

//                     <Field.Root required invalid={!!errors.email}>
//                         <Field.Label>Email
//                             <Field.RequiredIndicator />
//                         </Field.Label>
//                         <Input
//                             rounded="lg"
//                             placeholder="Enter email address"
//                             {...register('email')}
//                         />
//                         <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
//                     </Field.Root>

//                     <Field.Root required invalid={!!errors.phone}>
//                         <Field.Label>Phone
//                             <Field.RequiredIndicator />
//                         </Field.Label>
//                         <Input
//                             rounded="lg"
//                             placeholder="Enter phone number"
//                             {...register('phone')}
//                         />
//                         <Field.ErrorText>{errors.phone?.message}</Field.ErrorText>
//                     </Field.Root>

//                     <Field.Root invalid={!!errors.password}>
//                         <Field.Label>Password</Field.Label>
//                         <InputGroup
//                             endElement={
//                                 <IconButton
//                                     variant="ghost"
//                                     aria-label={showPassword ? "Hide password" : "Show password"}
//                                     onClick={() => setShowPassword(!showPassword)}
//                                 >
//                                     {showPassword ? <EyeSlash /> : <Eye />}
//                                 </IconButton>
//                             }
//                         >
//                             <Input
//                                 rounded="lg"
//                                 type={showPassword ? "text" : "password"}
//                                 placeholder="Enter new password (leave blank to keep current)"
//                                 {...register('password')}
//                             />
//                         </InputGroup>
//                         <Field.HelperText>Leave blank to keep current password</Field.HelperText>
//                         <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
//                     </Field.Root>

//                     <Field.Root invalid={!!errors.roles}>
//                         <Field.Label>Roles</Field.Label>
//                         <Select.Root
//                             collection={rolesCollection}
//                             size="sm"
//                             value={rolesValue}
//                             onValueChange={(val) => setValue('roles', (val.value || []).map((v) => parseInt(v, 10)), { shouldValidate: true })}
//                         >
//                             <Select.HiddenSelect multiple />
//                             <Select.Control>
//                                 <Select.Trigger rounded="lg">
//                                     <Select.ValueText placeholder="Select roles" />
//                                 </Select.Trigger>
//                                 <Select.IndicatorGroup>
//                                     <Select.Indicator />
//                                 </Select.IndicatorGroup>
//                             </Select.Control>
//                         <Select.Positioner>
//                             <Select.Content>
//                                     {rolesCollection.items.map((item) => (
//                                         <Select.Item item={item} key={item.value}>
//                                             {item.label}
//                                             <Select.ItemIndicator />
//                                         </Select.Item>
//                                     ))}
//                             </Select.Content>
//                         </Select.Positioner>
//                         </Select.Root>
//                         <Field.ErrorText>{rolesErrorMessage}</Field.ErrorText>
//                     </Field.Root>

//                     {/* Hidden fields for API compatibility */}
//                     <input type="hidden" {...register('state_id')} />
//                     <input type="hidden" {...register('region_id')} />
//                     <input type="hidden" {...register('district_id')} />
//                     <input type="hidden" {...register('roles')} />
//                 </VStack>
//             </form>

//             <Button
//                 rounded="xl"
//                 colorPalette="accent"
//                 type="submit"
//                 form={`user-form-${user.id}`}
//             >
//                 Update & Close
//             </Button>
//         </VStack>
//     )
// }

// export default UserEditForm;