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
    Select,
    createListCollection,
    Spinner,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState, useMemo, useCallback } from "react"
import { Eye, EyeSlash } from "iconsax-reactjs"
import { userSchema, type UserFormData } from "@/modules/admin/schemas/users.schema"
import { useMe } from "@/hooks/useMe"
import StateIdCombobox from "@/modules/admin/components/StateIdCombobox"
import RegionIdCombobox from "@/modules/admin/components/RegionIdCombobox"
import DistrictIdCombobox from "@/modules/admin/components/DistrictIdCombobox"
import GroupIdCombobox from "@/modules/admin/components/GroupIdCombobox"
import OldGroupIdCombobox from "@/modules/admin/components/OldGroupIdCombobox"
import { useStates } from "@/modules/admin/hooks/useState"
import { useRegions } from "@/modules/admin/hooks/useRegion"
import { useDistricts } from "@/modules/admin/hooks/useDistrict"
import { useGroups } from "@/modules/admin/hooks/useGroup"
import { useOldGroups } from "@/modules/admin/hooks/useOldGroup"
import { toaster } from "@/components/ui/toaster"
// import { useRoles } from "@/hooks/useRoles"
import { useRoles } from "@/modules/admin/hooks/useRoles"


import type { User as UsersType, Role } from "@/types/users.type"

interface UserDialogProps {
    isLoading?: boolean
    isOpen: boolean
    user?: Partial<UsersType> & { group_id?: number | null; old_group_id?: number | null }
    mode: 'add' | 'edit'
    onClose: () => void
    onSave: (data: UserFormData) => void
}

const UserDialog = ({ isLoading, isOpen, user, mode, onClose, onSave }: UserDialogProps) => {
    const [showPassword, setShowPassword] = useState(false)
    const { user: authUser } = useMe();
    const { states = [] } = useStates()
    const { regions = [] } = useRegions()
    const { districts = [] } = useDistricts()
    const { groups = [] } = useGroups()
    const { oldGroups = [] } = useOldGroups()
    const { roles: availableRoles = [], isLoading: rolesLoading } = useRoles()

    // Check if current user is super admin
    // const isSuperAdmin = (authUser?.roles || []).some((r) => {
    //     const roleName = typeof r === 'object' && r !== null ? r.name : String(r)
    //     return roleName.toLowerCase().includes('super admin') || 
    //            roleName.toLowerCase().includes('superadmin')
    // })

    // // Determine effective IDs (prefer the user being edited, fallback to auth user's IDs)
    // const effectiveStateId = (user && (user.state_id ?? undefined)) ?? authUser?.state_id
    // const effectiveRegionId = (user && (user.region_id ?? undefined)) ?? authUser?.region_id
    // const effectiveDistrictId = (user && (user.district_id ?? undefined)) ?? authUser?.district_id

    // // If any of these are missing, Zod validation (which requires min(1)) will fail silently
    // // when submitting hidden fields. Disable submit and show a helpful message instead.
    // const canSubmit = !!effectiveStateId && !!effectiveRegionId


    // Check if current user is super admin
const isSuperAdmin = (authUser?.roles || []).some((r) => {
    const roleName = typeof r === 'object' && r !== null ? r.name : String(r)
    return roleName.toLowerCase().includes('super admin') || 
           roleName.toLowerCase().includes('superadmin')
})

// Determine effective IDs (prefer the user being edited, fallback to auth user's IDs)
const effectiveStateId = (user && (user.state_id ?? undefined)) ?? authUser?.state_id
const effectiveRegionId = (user && (user.region_id ?? undefined)) ?? authUser?.region_id
const effectiveDistrictId = (user && (user.district_id ?? undefined)) ?? authUser?.district_id

// Watch roles to conditionally hide hierarchy fields
// const selectedRoleIds = watch('role_ids') || []
// const hasSuperAdminRole = selectedRoleIds.some(roleId => {
//     const role = availableRoles.find(r => r.id === roleId)
//     return role?.name.toLowerCase().includes('super admin') || 
//            role?.name.toLowerCase().includes('superadmin')
// })

// // For non-Super Admin users, we need hierarchy fields
// const needsHierarchyFields = !hasSuperAdminRole
// const canSubmit = hasSuperAdminRole || (!!effectiveStateId && !!effectiveRegionId)


    // Create roles collection from API data - always return the same type
    const rolesCollection = useMemo(() => {
        const items = availableRoles.length 
            ? availableRoles.map(role => ({
                label: role.name,
                value: String(role.id)
              }))
            : [] // Return empty array instead of creating empty collection
        
        return createListCollection({
            items: items
        })
    }, [availableRoles])

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch, trigger } = useForm<UserFormData>({
        resolver: zodResolver(userSchema(mode) as any),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            password: '',
            state_id: user?.state_id || authUser?.state_id || 0,
            region_id: user?.region_id || authUser?.region_id || 0,
            district_id: user?.district_id || authUser?.district_id || 0,
            group_id:
                (user && 'group_id' in user ? (user.group_id ?? 0) : ((authUser as { group_id?: number | null } | null)?.group_id ?? 0)) || 0,
            old_group_id:
                (user && 'old_group_id' in user ? (user.old_group_id ?? 0) : ((authUser as { old_group_id?: number | null } | null)?.old_group_id ?? 0)) || 0,
            role_ids: Array.isArray(user?.roles)
                ? (user!.roles as any[]).map(r => {
                    // Handle both string roles and role objects
                    if (typeof r === 'object' && r !== null && 'id' in r) {
                        return r.id
                    }
                    // Try to match role by name to get the ID
                    const roleName = typeof r === 'string' ? r : String(r)
                    const matchedRole = availableRoles.find(role => 
                        role.name.toLowerCase() === roleName.toLowerCase() ||
                        role.name.toLowerCase().includes(roleName.toLowerCase())
                    )
                    return matchedRole?.id || 0
                }).filter(id => id > 0)
                : []
        }
    })


const onSubmit = (data: UserFormData) => {
    const hasSuperAdminRole = (data.role_ids || []).some(roleId => {
        const role = availableRoles.find(r => r.id === roleId)
        return role?.name.toLowerCase().includes('super admin') || 
               role?.name.toLowerCase().includes('superadmin')
    })

    // Create payload as any to bypass type checking
    const payload: any = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role_id: Number(data.role_ids[0]),
    }

    if (data.password) {
        payload.password = data.password
    }

    if (!hasSuperAdminRole) {
        if (data.state_id && data.state_id > 0) {
            payload.state_id = Number(data.state_id)
        }
        if (data.region_id && data.region_id > 0) {
            payload.region_id = Number(data.region_id)
        }
        if (data.district_id && data.district_id > 0) {
            payload.district_id = Number(data.district_id)
        }
        if (data.group_id && data.group_id > 0) {
            payload.group_id = Number(data.group_id)
        }
        if (data.old_group_id && data.old_group_id > 0) {
            payload.old_group_id = Number(data.old_group_id)
        }
    }

    console.log("Sending payload to backend:", payload);
    onSave(payload)
}


// Temporary simplified onSubmit for testing
// const onSubmit = (data: UserFormData) => {
//     // Hardcoded test payload
//     const testPayload = {
//         name: "Test User",
//         email: "test@example.com",
//         phone: "1234567890",
//         password: "password123",
//         role_id: 1
//     };
    
//     console.log("Sending test payload:", testPayload);
//     onSave(testPayload as any);
// }



    const onInvalid = (errors: any) => {
    // Check if the errors are only for hidden fields and user is Super Admin
    const hasSuperAdminRole = selectedRoleIds.some(roleId => {
        const role = availableRoles.find(r => r.id === roleId)
        return role?.name.toLowerCase().includes('super admin') || 
               role?.name.toLowerCase().includes('superadmin')
    })

    if (hasSuperAdminRole) {
        // If Super Admin, try to submit directly
        const formData = watch()
        onSubmit(formData)
    } else {
        toaster.create({ 
            title: 'Please fix validation errors', 
            type: 'error' 
        })
    }
}

    const handleClose = () => {
        onClose()
        reset()
        setShowPassword(false)
    }

    // Reset form when dialog opens with user data
    useEffect(() => {
        if (isOpen && user && availableRoles.length) {
            reset({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                password: '',
                state_id: user.state_id || authUser?.state_id || undefined,
                region_id: user.region_id || authUser?.region_id || undefined,
                district_id: user.district_id || authUser?.district_id || undefined,
                group_id:
                    (user && 'group_id' in user ? (user.group_id ?? 0) : ((authUser as { group_id?: number | null } | null)?.group_id ?? 0)) || undefined,
                old_group_id:
                    (user && 'old_group_id' in user ? (user.old_group_id ?? 0) : ((authUser as { old_group_id?: number | null } | null)?.old_group_id ?? 0)) || 0,
                role_ids: Array.isArray(user.roles)
                    ? (user.roles as any[]).map(r => {
                        if (typeof r === 'object' && r !== null && 'id' in r) {
                            return r.id
                        }
                        const roleName = typeof r === 'string' ? r : String(r)
                        const matchedRole = availableRoles.find(role => 
                            role.name.toLowerCase() === roleName.toLowerCase() ||
                            role.name.toLowerCase().includes(roleName.toLowerCase())
                        )
                        return matchedRole?.id || 0
                    }).filter(id => id > 0)
                    : []
            })
        } else if (isOpen && !user && availableRoles.length) {
            // For add mode, set defaults from auth user
            reset({
                name: '',
                email: '',
                phone: '',
                password: '',
                state_id: authUser?.state_id || 0,
                region_id: authUser?.region_id || 0,
                district_id: authUser?.district_id || 0,
                group_id: ((authUser as { group_id?: number | null } | null)?.group_id ?? 0) || 0,
                old_group_id: ((authUser as { old_group_id?: number | null } | null)?.old_group_id ?? 0) || 0,
                role_ids: []
            })
        }
    }, [isOpen, user, authUser, reset, availableRoles])

    const roleIdsValue = ((watch('role_ids') ?? []) as number[]).map((v) => String(v))
    const rolesErrorMessage = (errors.role_ids as unknown as { message?: string } | undefined)?.message

    // Watch roles to conditionally hide hierarchy fields
    const selectedRoleIds = watch('role_ids') || []
    const hasSuperAdminRole = selectedRoleIds.some(roleId => {
        const role = availableRoles.find(r => r.id === roleId)
        return role?.name.toLowerCase().includes('super admin') || 
               role?.name.toLowerCase().includes('superadmin')
    })

    // For non-Super Admin users, we need hierarchy fields
const needsHierarchyFields = !hasSuperAdminRole
const canSubmit = hasSuperAdminRole || (!!effectiveStateId && !!effectiveRegionId)


    const watchedStateId = watch('state_id')
    const watchedRegionId = watch('region_id')
    const watchedDistrictId = watch('district_id')
    const watchedGroupId = watch('group_id')
    const watchedOldGroupId = watch('old_group_id')

    const currentStateName = useMemo(() => {
        const match = states.find(s => s.id === watchedStateId)
        return match?.name || ''
    }, [states, watchedStateId])

    const currentRegionName = useMemo(() => {
        const match = regions.find(r => r.id === watchedRegionId)
        return match?.name || ''
    }, [regions, watchedRegionId])

    const currentDistrictName = useMemo(() => {
        const match = districts.find(d => d.id === watchedDistrictId)
        return match?.name || ''
    }, [districts, watchedDistrictId])

    const currentGroupName = useMemo(() => {
        const match = groups.find(g => g.id === watchedGroupId)
        return match?.name || ''
    }, [groups, watchedGroupId])

    const currentOldGroupName = useMemo(() => {
        const match = oldGroups.find(og => og.id === watchedOldGroupId)
        return match?.name || ''
    }, [oldGroups, watchedOldGroupId])

    const filteredGroups = useMemo(() => {
        if (!currentOldGroupName || !oldGroups || !groups) {
            return []
        }

        const selectedOldGroup = oldGroups.find(og => og.name === currentOldGroupName)

        if (!selectedOldGroup) {
            return []
        }

        return groups.filter(group => group.old_group === selectedOldGroup.name)
    }, [currentOldGroupName, oldGroups, groups])

    const filteredRegions = useMemo(() => {
        if (!regions || regions.length === 0 || !watchedStateId) {
            return []
        }
        return regions.filter((region) => {
            if (region.state_id != null && watchedStateId) {
                return Number(region.state_id) === Number(watchedStateId)
            }
            if (currentStateName && region.state) {
                return region.state.toLowerCase() === currentStateName.toLowerCase()
            }
            return false
        })
    }, [regions, watchedStateId, currentStateName])

    const filteredDistricts = useMemo(() => {
        if (!districts || districts.length === 0 || (!currentRegionName && !currentStateName)) {
            return []
        }
        return districts.filter((d) => {
            if (currentRegionName && currentStateName) {
                return d.region.toLowerCase() === currentRegionName.toLowerCase() && d.state.toLowerCase() === currentStateName.toLowerCase()
            }

            return false
        })
    }, [districts, currentStateName, currentRegionName])

    const clearBelowRegion = () => {
        setValue('region_id', 0, { shouldValidate: false })
        trigger('region_id')
        setValue('old_group_id', 0, { shouldValidate: false })
        trigger('old_group_id')
        setValue('group_id', 0, { shouldValidate: false })
        trigger('group_id')
        setValue('district_id', 0, { shouldValidate: false })
        trigger('district_id')
    }

    const clearBelowOldGroup = () => {
        setValue('old_group_id', 0, { shouldValidate: false })
        trigger('old_group_id')
        setValue('group_id', 0, { shouldValidate: false })
        trigger('group_id')
        setValue('district_id', 0, { shouldValidate: false })
        trigger('district_id')
    }

    const clearBelowGroup = () => {
        setValue('group_id', 0, { shouldValidate: false })
        trigger('group_id')
        setValue('district_id', 0, { shouldValidate: false })
        trigger('district_id')
    }

    const onStateChange = useCallback((name: string) => {
        const id = states.find(s => s.name.toLowerCase() === name.toLowerCase())?.id || 0
        setValue('state_id', id, { shouldValidate: false })
        trigger('state_id')
        clearBelowRegion()
    }, [states, setValue, trigger])

    const onRegionChange = useCallback((name: string) => {
        const id = regions.find(r => r.name.toLowerCase() === name.toLowerCase())?.id || 0
        setValue('region_id', id, { shouldValidate: false })
        trigger('region_id')
        clearBelowOldGroup()
    }, [regions, setValue, trigger])

    const onDistrictChange = useCallback((name: string) => {
        const id = districts.find(d => d.name.toLowerCase() === name.toLowerCase())?.id || 0
        setValue('district_id', id, { shouldValidate: false })
        trigger('district_id')
    }, [districts, setValue, trigger])

    const onGroupChange = useCallback((name: string) => {
        const id = groups.find(g => g.name.toLowerCase() === name.toLowerCase())?.id || 0
        setValue('group_id', id, { shouldValidate: false })
        trigger('group_id')
        setValue('district_id', 0, { shouldValidate: false })
        trigger('district_id')
    }, [groups, setValue, trigger])

    const onOldGroupChange = useCallback((name: string) => {
        const id = oldGroups.find(og => og.name.toLowerCase() === name.toLowerCase())?.id || 0
        setValue('old_group_id', id, { shouldValidate: false })
        trigger('old_group_id')
        clearBelowGroup()
    }, [oldGroups, setValue, trigger])

    const onRolesChange = useCallback((val: { value: string[] }) => {
        // Convert string values back to numbers (role IDs)
        const selectedIds = (val.value || []).map((v) => parseInt(v, 10)).filter(id => !isNaN(id))
        setValue('role_ids', selectedIds, { shouldValidate: true })
        
        // If Super Admin is selected, clear all hierarchy fields
        const hasSuperAdmin = selectedIds.some(roleId => {
            const role = availableRoles.find(r => r.id === roleId)
            return role?.name.toLowerCase().includes('super admin') || 
                   role?.name.toLowerCase().includes('superadmin')
        })
        
        if (hasSuperAdmin) {
            setValue('state_id', 0, { shouldValidate: false })
            setValue('region_id', 0, { shouldValidate: false })
            setValue('district_id', 0, { shouldValidate: false })
            setValue('group_id', 0, { shouldValidate: false })
            setValue('old_group_id', 0, { shouldValidate: false })
        }
    }, [setValue, availableRoles])

    return (
        <Dialog.Root
            role="alertdialog"
            open={isOpen}
            onOpenChange={(e) => {
                if (!e.open) {
                    handleClose()
                }
            }}
            size="md"
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content rounded="xl" maxW={{ base: "sm", md: "md", lg: "3xl" }}>
                        <Dialog.Header>
                            <Dialog.Title>
                                {mode === 'add' ? 'Add New User' : 'Update User'}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <form noValidate id="user-form" onSubmit={handleSubmit(onSubmit, onInvalid)}>
                                <VStack gap="4" colorPalette={"accent"}>
                                    {!canSubmit && mode === 'add' && !isSuperAdmin && (
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

                                    <Field.Root invalid={!!errors.role_ids}>
                                        <Field.Label>Roles</Field.Label>
                                        {rolesLoading ? (
                                            <Spinner size="sm" />
                                        ) : (
                                            <Select.Root
                                                collection={rolesCollection}
                                                size="sm"
                                                value={roleIdsValue}
                                                onValueChange={onRolesChange}
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
                                                        {rolesCollection.items.map((item) => (
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

                                    {/* Hierarchy fields - hidden if Super Admin is selected */}
                                    {!hasSuperAdminRole && (
                                        <>
                                            <Field.Root required invalid={!!errors.state_id}>
                                                <StateIdCombobox
                                                    value={currentStateName}
                                                    onChange={onStateChange}
                                                    required
                                                    invalid={!!errors.state_id}
                                                />
                                                <Field.ErrorText>{errors.state_id?.message}</Field.ErrorText>
                                            </Field.Root>

                                            <Field.Root required invalid={!!errors.region_id}>
                                                <RegionIdCombobox
                                                    value={watchedRegionId}
                                                    onChange={(id) => {
                                                        const name = regions.find(r => r.id === (id || 0))?.name || ''
                                                        onRegionChange(name)
                                                    }}
                                                    required
                                                    invalid={!!errors.region_id}
                                                    stateId={isSuperAdmin ? watchedStateId : authUser?.state_id as number}
                                                    disabled={isSuperAdmin ? !watchedStateId : !authUser?.state_id}
                                                />
                                                <Field.ErrorText>{errors.region_id?.message}</Field.ErrorText>
                                            </Field.Root>

                                            <Field.Root>
                                                <OldGroupIdCombobox
                                                    value={watchedOldGroupId as number}
                                                    onChange={(id) => {
                                                        const name = oldGroups.find(og => og.id === (id || 0))?.name || ''
                                                        onOldGroupChange(name)
                                                    }}
                                                    stateId={authUser?.state_id as number}
                                                    regionId={isSuperAdmin ? watchedRegionId : authUser?.region_id as number}
                                                    isRegionAdmin={(authUser?.roles || []).some(r => {
                                                        const roleName = typeof r === 'object' && r !== null ? r.name : String(r)
                                                        return roleName.toLowerCase().includes('region admin')
                                                    })}
                                                />
                                            </Field.Root>

                                            <Field.Root>
                                                <GroupIdCombobox
                                                    value={watchedGroupId}
                                                    onChange={(id) => {
                                                        const name = groups.find(g => g.id === (id || 0))?.name || ''
                                                        onGroupChange(name)
                                                    }}
                                                    oldGroupId={watchedOldGroupId as number}
                                                    disabled={!watchedOldGroupId}
                                                />
                                            </Field.Root>

                                            <Field.Root invalid={!!errors.district_id}>
                                                <DistrictIdCombobox
                                                    value={watchedDistrictId}
                                                    onChange={(id) => {
                                                        const name = districts.find(d => d.id === (id || 0))?.name || ''
                                                        onDistrictChange(name)
                                                    }}
                                                    invalid={!!errors.district_id}
                                                    disabled={!watchedGroupId}
                                                    stateId={effectiveStateId as number}
                                                    regionId={effectiveRegionId as number}
                                                    oldGroupId={authUser?.old_group_id ?? undefined}
                                                    groupId={watchedGroupId || (authUser?.group_id as number | undefined)}
                                                    isGroupAdmin={(authUser?.roles || []).some(r => {
                                                        const roleName = typeof r === 'object' && r !== null ? r.name : String(r)
                                                        return roleName.toLowerCase().includes('group admin')
                                                    })}
                                                />
                                                <Field.ErrorText>{errors.district_id?.message}</Field.ErrorText>
                                            </Field.Root>
                                        </>
                                    )}

                                    {/* Hidden fields for API compatibility */}
                                    <input type="hidden" {...register('state_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('region_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('district_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('group_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('old_group_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('role_ids')} />
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
                                disabled={isLoading || (mode === 'add' && !hasSuperAdminRole && !canSubmit)}
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

export default UserDialog


















// "use client"

// import {
//     Dialog,
//     Portal,
//     Field,
//     CloseButton,
//     Button,
//     VStack,
//     Input,
//     InputGroup,
//     IconButton,
//     Text,
//     Select,
//     createListCollection,
//     Spinner,
// } from "@chakra-ui/react"
// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useEffect, useState, useMemo, useCallback } from "react"
// import { Eye, EyeSlash } from "iconsax-reactjs"
// import { userSchema, type UserFormData } from "@/modules/admin/schemas/users.schema"
// import { useMe } from "@/hooks/useMe"
// import StateIdCombobox from "@/modules/admin/components/StateIdCombobox"
// import RegionIdCombobox from "@/modules/admin/components/RegionIdCombobox"
// import DistrictIdCombobox from "@/modules/admin/components/DistrictIdCombobox"
// import GroupIdCombobox from "@/modules/admin/components/GroupIdCombobox"
// import OldGroupIdCombobox from "@/modules/admin/components/OldGroupIdCombobox"
// import { useStates } from "@/modules/admin/hooks/useState"
// import { useRegions } from "@/modules/admin/hooks/useRegion"
// import { useDistricts } from "@/modules/admin/hooks/useDistrict"
// import { useGroups } from "@/modules/admin/hooks/useGroup"
// import { useOldGroups } from "@/modules/admin/hooks/useOldGroup"
// import { toaster } from "@/components/ui/toaster"
// import { useRoles } from "@/modules/admin/hooks/useRoles"

// import type { User as UsersType } from "@/types/users.type"

// interface UserDialogProps {
//     isLoading?: boolean
//     isOpen: boolean
//     user?: Partial<UsersType> & { group_id?: number | null; old_group_id?: number | null }
//     mode: 'add' | 'edit'
//     onClose: () => void
//     onSave: (data: UserFormData) => void
// }

// const UserDialog = ({ isLoading, isOpen, user, mode, onClose, onSave }: UserDialogProps) => {
//     const [showPassword, setShowPassword] = useState(false)
//     const { user: authUser } = useMe();
//     const { states = [] } = useStates()
//     const { regions = [] } = useRegions()
//     const { districts = [] } = useDistricts()
//     const { groups = [] } = useGroups()
//     const { oldGroups = [] } = useOldGroups()
//     const { roles: availableRoles = [], isLoading: rolesLoading } = useRoles()

//     // Check if current user is super admin
//     const isSuperAdmin = (authUser?.roles || []).some((r) => {
//         const roleStr = typeof r === 'string' ? r : String(r)
//         return roleStr.toLowerCase().includes('super admin') || 
//                roleStr.toLowerCase().includes('superadmin')
//     })

//     // Determine effective IDs (prefer the user being edited, fallback to auth user's IDs)
//     const effectiveStateId = (user && (user.state_id ?? undefined)) ?? authUser?.state_id
//     const effectiveRegionId = (user && (user.region_id ?? undefined)) ?? authUser?.region_id
//     const effectiveDistrictId = (user && (user.district_id ?? undefined)) ?? authUser?.district_id

//     // If any of these are missing, Zod validation (which requires min(1)) will fail silently
//     // when submitting hidden fields. Disable submit and show a helpful message instead.
//     const canSubmit = !!effectiveStateId && !!effectiveRegionId

//     // Create roles collection from API data
//     const rolesCollection = useMemo(() => {
//         if (!availableRoles.length) {
//             return createListCollection({ items: [] })
//         }
        
//         return createListCollection({
//             items: availableRoles.map(role => ({
//                 label: role.name,
//                 value: String(role.id) // Store the ID as string for selection
//             }))
//         })
//     }, [availableRoles])

//     const { register, handleSubmit, formState: { errors }, reset, setValue, watch, trigger } = useForm<UserFormData>({
//         resolver: zodResolver(userSchema(mode) as any),
//         defaultValues: {
//             name: user?.name || '',
//             email: user?.email || '',
//             phone: user?.phone || '',
//             password: '',
//             state_id: user?.state_id || authUser?.state_id || 0,
//             region_id: user?.region_id || authUser?.region_id || 0,
//             district_id: user?.district_id || authUser?.district_id || 0,
//             group_id:
//                 (user && 'group_id' in user ? (user.group_id ?? 0) : ((authUser as { group_id?: number | null } | null)?.group_id ?? 0)) || 0,
//             old_group_id:
//                 (user && 'old_group_id' in user ? (user.old_group_id ?? 0) : ((authUser as { old_group_id?: number | null } | null)?.old_group_id ?? 0)) || 0,
//             role_ids: Array.isArray(user?.roles)
//                 ? (user!.roles as any[]).map(r => {
//                     // Try to match role by name to get the ID
//                     const roleName = typeof r === 'string' ? r : r.name || String(r)
//                     const matchedRole = availableRoles.find(role => 
//                         role.name.toLowerCase() === roleName.toLowerCase() ||
//                         role.name.toLowerCase().includes(roleName.toLowerCase())
//                     )
//                     return matchedRole?.id || 0
//                 }).filter(id => id > 0)
//                 : []
//         }
//     })

//     const onSubmit = (data: UserFormData) => {
//         const payload = { ...data }

//         // Remove district_id if it's 0 or empty (not selected)
//         if (!payload.district_id || payload.district_id === 0) {
//             delete payload.district_id
//         }

//         // Check if Super Admin is selected (by matching role IDs)
//         const hasSuperAdminRole = (payload.role_ids || []).some(roleId => {
//             const role = availableRoles.find(r => r.id === roleId)
//             return role?.name.toLowerCase().includes('super admin') || 
//                    role?.name.toLowerCase().includes('superadmin')
//         })

//         if (hasSuperAdminRole) {
//             payload.state_id = 0
//             payload.region_id = 0
//             payload.district_id = 0
//             payload.group_id = 0
//             payload.old_group_id = 0
//         }

//         console.log("payload", payload);
//         onSave(payload)
//     }

//     const onInvalid = () => {
//         toaster.create({ title: 'Please fix validation errors', type: 'error' })
//     }

//     const handleClose = () => {
//         onClose()
//         reset()
//         setShowPassword(false)
//     }

//     // Reset form when dialog opens with user data
//     useEffect(() => {
//         if (isOpen && user && availableRoles.length) {
//             reset({
//                 name: user.name || '',
//                 email: user.email || '',
//                 phone: user.phone || '',
//                 password: '',
//                 state_id: user.state_id || authUser?.state_id || undefined,
//                 region_id: user.region_id || authUser?.region_id || undefined,
//                 district_id: user.district_id || authUser?.district_id || undefined,
//                 group_id:
//                     (user && 'group_id' in user ? (user.group_id ?? 0) : ((authUser as { group_id?: number | null } | null)?.group_id ?? 0)) || undefined,
//                 old_group_id:
//                     (user && 'old_group_id' in user ? (user.old_group_id ?? 0) : ((authUser as { old_group_id?: number | null } | null)?.old_group_id ?? 0)) || 0,
//                 role_ids: Array.isArray(user.roles)
//                     ? (user.roles as any[]).map(r => {
//                         const roleName = typeof r === 'string' ? r : r.name || String(r)
//                         const matchedRole = availableRoles.find(role => 
//                             role.name.toLowerCase() === roleName.toLowerCase() ||
//                             role.name.toLowerCase().includes(roleName.toLowerCase())
//                         )
//                         return matchedRole?.id || 0
//                     }).filter(id => id > 0)
//                     : []
//             })
//         } else if (isOpen && !user && availableRoles.length) {
//             // For add mode, set defaults from auth user
//             reset({
//                 name: '',
//                 email: '',
//                 phone: '',
//                 password: '',
//                 state_id: authUser?.state_id || 0,
//                 region_id: authUser?.region_id || 0,
//                 district_id: authUser?.district_id || 0,
//                 group_id: ((authUser as { group_id?: number | null } | null)?.group_id ?? 0) || 0,
//                 old_group_id: ((authUser as { old_group_id?: number | null } | null)?.old_group_id ?? 0) || 0,
//                 role_ids: []
//             })
//         }
//     }, [isOpen, user, authUser, reset, availableRoles])

//     const roleIdsValue = ((watch('role_ids') ?? []) as number[]).map((v) => String(v))
//     const rolesErrorMessage = (errors.role_ids as unknown as { message?: string } | undefined)?.message

//     // Watch roles to conditionally hide hierarchy fields
//     const selectedRoleIds = watch('role_ids') || []
//     const hasSuperAdminRole = selectedRoleIds.some(roleId => {
//         const role = availableRoles.find(r => r.id === roleId)
//         return role?.name.toLowerCase().includes('super admin') || 
//                role?.name.toLowerCase().includes('superadmin')
//     })

//     const watchedStateId = watch('state_id')
//     const watchedRegionId = watch('region_id')
//     const watchedDistrictId = watch('district_id')
//     const watchedGroupId = watch('group_id')
//     const watchedOldGroupId = watch('old_group_id')

//     const currentStateName = useMemo(() => {
//         const match = states.find(s => s.id === watchedStateId)
//         return match?.name || ''
//     }, [states, watchedStateId])

//     const currentRegionName = useMemo(() => {
//         const match = regions.find(r => r.id === watchedRegionId)
//         return match?.name || ''
//     }, [regions, watchedRegionId])

//     const currentDistrictName = useMemo(() => {
//         const match = districts.find(d => d.id === watchedDistrictId)
//         return match?.name || ''
//     }, [districts, watchedDistrictId])

//     const currentGroupName = useMemo(() => {
//         const match = groups.find(g => g.id === watchedGroupId)
//         return match?.name || ''
//     }, [groups, watchedGroupId])

//     const currentOldGroupName = useMemo(() => {
//         const match = oldGroups.find(og => og.id === watchedOldGroupId)
//         return match?.name || ''
//     }, [oldGroups, watchedOldGroupId])

//     const filteredGroups = useMemo(() => {
//         if (!currentOldGroupName || !oldGroups || !groups) {
//             return []
//         }

//         const selectedOldGroup = oldGroups.find(og => og.name === currentOldGroupName)

//         if (!selectedOldGroup) {
//             return []
//         }

//         return groups.filter(group => group.old_group === selectedOldGroup.name)
//     }, [currentOldGroupName, oldGroups, groups])

//     const filteredRegions = useMemo(() => {
//         if (!regions || regions.length === 0 || !watchedStateId) {
//             return []
//         }
//         return regions.filter((region) => {
//             if (region.state_id != null && watchedStateId) {
//                 return Number(region.state_id) === Number(watchedStateId)
//             }
//             if (currentStateName && region.state) {
//                 return region.state.toLowerCase() === currentStateName.toLowerCase()
//             }
//             return false
//         })
//     }, [regions, watchedStateId, currentStateName])

//     const filteredDistricts = useMemo(() => {
//         if (!districts || districts.length === 0 || (!currentRegionName && !currentStateName)) {
//             return []
//         }
//         return districts.filter((d) => {
//             if (currentRegionName && currentStateName) {
//                 return d.region.toLowerCase() === currentRegionName.toLowerCase() && d.state.toLowerCase() === currentStateName.toLowerCase()
//             }

//             return false
//         })
//     }, [districts, currentStateName, currentRegionName])

//     const clearBelowRegion = () => {
//         setValue('region_id', 0, { shouldValidate: false })
//         trigger('region_id')
//         setValue('old_group_id', 0, { shouldValidate: false })
//         trigger('old_group_id')
//         setValue('group_id', 0, { shouldValidate: false })
//         trigger('group_id')
//         setValue('district_id', 0, { shouldValidate: false })
//         trigger('district_id')
//     }

//     const clearBelowOldGroup = () => {
//         setValue('old_group_id', 0, { shouldValidate: false })
//         trigger('old_group_id')
//         setValue('group_id', 0, { shouldValidate: false })
//         trigger('group_id')
//         setValue('district_id', 0, { shouldValidate: false })
//         trigger('district_id')
//     }

//     const clearBelowGroup = () => {
//         setValue('group_id', 0, { shouldValidate: false })
//         trigger('group_id')
//         setValue('district_id', 0, { shouldValidate: false })
//         trigger('district_id')
//     }

//     const onStateChange = useCallback((name: string) => {
//         const id = states.find(s => s.name.toLowerCase() === name.toLowerCase())?.id || 0
//         setValue('state_id', id, { shouldValidate: false })
//         trigger('state_id')
//         clearBelowRegion()
//     }, [states, setValue, trigger])

//     const onRegionChange = useCallback((name: string) => {
//         const id = regions.find(r => r.name.toLowerCase() === name.toLowerCase())?.id || 0
//         setValue('region_id', id, { shouldValidate: false })
//         trigger('region_id')
//         clearBelowOldGroup()
//     }, [regions, setValue, trigger])

//     const onDistrictChange = useCallback((name: string) => {
//         const id = districts.find(d => d.name.toLowerCase() === name.toLowerCase())?.id || 0
//         setValue('district_id', id, { shouldValidate: false })
//         trigger('district_id')
//     }, [districts, setValue, trigger])

//     const onGroupChange = useCallback((name: string) => {
//         const id = groups.find(g => g.name.toLowerCase() === name.toLowerCase())?.id || 0
//         setValue('group_id', id, { shouldValidate: false })
//         trigger('group_id')
//         setValue('district_id', 0, { shouldValidate: false })
//         trigger('district_id')
//     }, [groups, setValue, trigger])

//     const onOldGroupChange = useCallback((name: string) => {
//         const id = oldGroups.find(og => og.name.toLowerCase() === name.toLowerCase())?.id || 0
//         setValue('old_group_id', id, { shouldValidate: false })
//         trigger('old_group_id')
//         clearBelowGroup()
//     }, [oldGroups, setValue, trigger])

//     const onRolesChange = useCallback((val: { value: string[] }) => {
//         // Convert string values back to numbers (role IDs)
//         const selectedIds = (val.value || []).map((v) => parseInt(v, 10)).filter(id => !isNaN(id))
//         setValue('role_ids', selectedIds, { shouldValidate: true })
        
//         // If Super Admin is selected, clear all hierarchy fields
//         const hasSuperAdmin = selectedIds.some(roleId => {
//             const role = availableRoles.find(r => r.id === roleId)
//             return role?.name.toLowerCase().includes('super admin') || 
//                    role?.name.toLowerCase().includes('superadmin')
//         })
        
//         if (hasSuperAdmin) {
//             setValue('state_id', 0, { shouldValidate: false })
//             setValue('region_id', 0, { shouldValidate: false })
//             setValue('district_id', 0, { shouldValidate: false })
//             setValue('group_id', 0, { shouldValidate: false })
//             setValue('old_group_id', 0, { shouldValidate: false })
//         }
//     }, [setValue, availableRoles])

//     return (
//         <Dialog.Root
//             role="alertdialog"
//             open={isOpen}
//             onOpenChange={(e) => {
//                 if (!e.open) {
//                     handleClose()
//                 }
//             }}
//             size="md"
//         >
//             <Portal>
//                 <Dialog.Backdrop />
//                 <Dialog.Positioner>
//                     <Dialog.Content rounded="xl" maxW={{ base: "sm", md: "md", lg: "3xl" }}>
//                         <Dialog.Header>
//                             <Dialog.Title>
//                                 {mode === 'add' ? 'Add New User' : 'Update User'}
//                             </Dialog.Title>
//                         </Dialog.Header>

//                         <Dialog.Body>
//                             <form noValidate id="user-form" onSubmit={handleSubmit(onSubmit, onInvalid)}>
//                                 <VStack gap="4" colorPalette={"accent"}>
//                                     {!canSubmit && mode === 'add' && !isSuperAdmin && (
//                                         <Text color="red.500" fontSize="sm">
//                                             Your account does not have a valid State / Region / District assigned. Please update your profile or contact an administrator before adding users.
//                                         </Text>
//                                     )}
//                                     <Field.Root required invalid={!!errors.name}>
//                                         <Field.Label>Full Name
//                                             <Field.RequiredIndicator />
//                                         </Field.Label>
//                                         <Input
//                                             rounded="lg"
//                                             placeholder="Enter full name"
//                                             {...register('name')}
//                                         />
//                                         <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
//                                     </Field.Root>

//                                     <Field.Root required invalid={!!errors.email}>
//                                         <Field.Label>Email
//                                             <Field.RequiredIndicator />
//                                         </Field.Label>
//                                         <Input
//                                             rounded="lg"
//                                             placeholder="Enter email address"
//                                             {...register('email')}
//                                         />
//                                         <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
//                                     </Field.Root>

//                                     <Field.Root required invalid={!!errors.phone}>
//                                         <Field.Label>Phone
//                                             <Field.RequiredIndicator />
//                                         </Field.Label>
//                                         <Input
//                                             rounded="lg"
//                                             placeholder="Enter phone number"
//                                             {...register('phone')}
//                                         />
//                                         <Field.ErrorText>{errors.phone?.message}</Field.ErrorText>
//                                     </Field.Root>

//                                     <Field.Root invalid={!!errors.role_ids}>
//                                         <Field.Label>Roles</Field.Label>
//                                         {rolesLoading ? (
//                                             <Spinner size="sm" />
//                                         ) : (
//                                             <Select.Root
//                                                 collection={rolesCollection}
//                                                 size="sm"
//                                                 value={roleIdsValue}
//                                                 onValueChange={onRolesChange}
//                                                 multiple
//                                             >
//                                                 <Select.HiddenSelect />
//                                                 <Select.Control>
//                                                     <Select.Trigger rounded="lg">
//                                                         <Select.ValueText placeholder="Select roles" />
//                                                     </Select.Trigger>
//                                                     <Select.IndicatorGroup>
//                                                         <Select.Indicator />
//                                                     </Select.IndicatorGroup>
//                                                 </Select.Control>
//                                                 <Select.Positioner>
//                                                     <Select.Content>
//                                                         {rolesCollection.items.map((item) => (
//                                                             <Select.Item item={item} key={item.value}>
//                                                                 {item.label}
//                                                                 <Select.ItemIndicator />
//                                                             </Select.Item>
//                                                         ))}
//                                                     </Select.Content>
//                                                 </Select.Positioner>
//                                             </Select.Root>
//                                         )}
//                                         <Field.ErrorText>{rolesErrorMessage}</Field.ErrorText>
//                                     </Field.Root>

//                                     <Field.Root required={mode === 'add'} invalid={!!errors.password}>
//                                         <Field.Label>Password
//                                             {mode === 'add' && <Field.RequiredIndicator />}
//                                         </Field.Label>
//                                         <InputGroup
//                                             endElement={
//                                                 <IconButton
//                                                     variant="ghost"
//                                                     aria-label={showPassword ? "Hide password" : "Show password"}
//                                                     onClick={() => setShowPassword(!showPassword)}
//                                                 >
//                                                     {showPassword ? <EyeSlash /> : <Eye />}
//                                                 </IconButton>
//                                             }
//                                         >
//                                             <Input
//                                                 rounded="lg"
//                                                 type={showPassword ? "text" : "password"}
//                                                 placeholder={mode === 'add' ? "Enter password" : "Enter new password (leave blank to keep current)"}
//                                                 {...register('password')}
//                                             />
//                                         </InputGroup>
//                                         {mode === 'edit' && (
//                                             <Field.HelperText>Leave blank to keep current password</Field.HelperText>
//                                         )}
//                                         <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
//                                     </Field.Root>

//                                     {/* Hierarchy fields - hidden if Super Admin is selected */}
//                                     {!hasSuperAdminRole && (
//                                         <>
//                                             <Field.Root required invalid={!!errors.state_id}>
//                                                 <StateIdCombobox
//                                                     value={currentStateName}
//                                                     onChange={onStateChange}
//                                                     required
//                                                     invalid={!!errors.state_id}
//                                                 />
//                                                 <Field.ErrorText>{errors.state_id?.message}</Field.ErrorText>
//                                             </Field.Root>

//                                             <Field.Root required invalid={!!errors.region_id}>
//                                                 <RegionIdCombobox
//                                                     value={watchedRegionId}
//                                                     onChange={(id) => {
//                                                         const name = regions.find(r => r.id === (id || 0))?.name || ''
//                                                         onRegionChange(name)
//                                                     }}
//                                                     required
//                                                     invalid={!!errors.region_id}
//                                                     stateId={isSuperAdmin ? watchedStateId : authUser?.state_id as number}
//                                                     disabled={isSuperAdmin ? !watchedStateId : !authUser?.state_id}
//                                                 />
//                                                 <Field.ErrorText>{errors.region_id?.message}</Field.ErrorText>
//                                             </Field.Root>

//                                             <Field.Root>
//                                                 <OldGroupIdCombobox
//                                                     value={watchedOldGroupId as number}
//                                                     onChange={(id) => {
//                                                         const name = oldGroups.find(og => og.id === (id || 0))?.name || ''
//                                                         onOldGroupChange(name)
//                                                     }}
//                                                     stateId={authUser?.state_id as number}
//                                                     regionId={isSuperAdmin ? watchedRegionId : authUser?.region_id as number}
//                                                     isRegionAdmin={(authUser?.roles || []).some(r => {
//                                                         const roleStr = typeof r === 'string' ? r : String(r)
//                                                         return roleStr.toLowerCase().includes('region admin')
//                                                     })}
//                                                 />
//                                             </Field.Root>

//                                             <Field.Root>
//                                                 <GroupIdCombobox
//                                                     value={watchedGroupId}
//                                                     onChange={(id) => {
//                                                         const name = groups.find(g => g.id === (id || 0))?.name || ''
//                                                         onGroupChange(name)
//                                                     }}
//                                                     oldGroupId={watchedOldGroupId as number}
//                                                     disabled={!watchedOldGroupId}
//                                                 />
//                                             </Field.Root>

//                                             <Field.Root invalid={!!errors.district_id}>
//                                                 <DistrictIdCombobox
//                                                     value={watchedDistrictId}
//                                                     onChange={(id) => {
//                                                         const name = districts.find(d => d.id === (id || 0))?.name || ''
//                                                         onDistrictChange(name)
//                                                     }}
//                                                     invalid={!!errors.district_id}
//                                                     disabled={!watchedGroupId}
//                                                     stateId={effectiveStateId as number}
//                                                     regionId={effectiveRegionId as number}
//                                                     oldGroupId={authUser?.old_group_id ?? undefined}
//                                                     groupId={watchedGroupId || (authUser?.group_id as number | undefined)}
//                                                     isGroupAdmin={(authUser?.roles || []).some(r => {
//                                                         const roleStr = typeof r === 'string' ? r : String(r)
//                                                         return roleStr.toLowerCase().includes('group admin')
//                                                     })}
//                                                 />
//                                                 <Field.ErrorText>{errors.district_id?.message}</Field.ErrorText>
//                                             </Field.Root>
//                                         </>
//                                     )}

//                                     {/* Hidden fields for API compatibility */}
//                                     <input type="hidden" {...register('state_id', { valueAsNumber: true })} />
//                                     <input type="hidden" {...register('region_id', { valueAsNumber: true })} />
//                                     <input type="hidden" {...register('district_id', { valueAsNumber: true })} />
//                                     <input type="hidden" {...register('group_id', { valueAsNumber: true })} />
//                                     <input type="hidden" {...register('old_group_id', { valueAsNumber: true })} />
//                                     <input type="hidden" {...register('role_ids', { valueAsNumber: true })} />
//                                 </VStack>
//                             </form>
//                         </Dialog.Body>

//                         <Dialog.Footer>
//                             <Dialog.ActionTrigger asChild>
//                                 <Button rounded="xl" variant="outline">Cancel</Button>
//                             </Dialog.ActionTrigger>

//                             <Button
//                                 rounded="xl"
//                                 type="submit"
//                                 form="user-form"
//                                 colorPalette="accent"
//                                 loading={isLoading}
//                                 loadingText={mode === 'add' ? 'Adding User' : 'Updating User'}
//                                 disabled={isLoading || (mode === 'add' && !isSuperAdmin && !canSubmit)}
//                             >
//                                 {mode === 'add' ? 'Add User' : 'Update User'}
//                             </Button>
//                         </Dialog.Footer>

//                         <Dialog.CloseTrigger asChild>
//                             <CloseButton size="sm" />
//                         </Dialog.CloseTrigger>
//                     </Dialog.Content>
//                 </Dialog.Positioner>
//             </Portal>
//         </Dialog.Root>
//     )
// }

// export default UserDialog























// "use client"

// import {
//     Dialog,
//     Portal,
//     Field,
//     CloseButton,
//     Button,
//     VStack,
//     Input,
//     InputGroup,
//     IconButton,
//     Text,
//     Select,
//     createListCollection,
// } from "@chakra-ui/react"
// import { useForm, type SubmitHandler } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useEffect, useState, useMemo, useCallback } from "react"
// import { Eye, EyeSlash } from "iconsax-reactjs"
// import { userSchema, type UserFormData } from "@/modules/admin/schemas/users.schema"
// import { useMe } from "@/hooks/useMe"
// import StateIdCombobox from "@/modules/admin/components/StateIdCombobox"
// import RegionIdCombobox from "@/modules/admin/components/RegionIdCombobox"
// import DistrictIdCombobox from "@/modules/admin/components/DistrictIdCombobox"
// import GroupIdCombobox from "@/modules/admin/components/GroupIdCombobox"
// import OldGroupIdCombobox from "@/modules/admin/components/OldGroupIdCombobox"
// import { useStates } from "@/modules/admin/hooks/useState"
// import { useRegions } from "@/modules/admin/hooks/useRegion"
// import { useDistricts } from "@/modules/admin/hooks/useDistrict"
// import { useGroups } from "@/modules/admin/hooks/useGroup"
// import { useOldGroups } from "@/modules/admin/hooks/useOldGroup"
// import { toaster } from "@/components/ui/toaster"

// import type { User as UsersType } from "@/types/users.type"

// interface UserDialogProps {
//     isLoading?: boolean
//     isOpen: boolean
//     user?: Partial<UsersType> & { group_id?: number | null; old_group_id?: number | null }
//     mode: 'add' | 'edit'
//     onClose: () => void
//     onSave: (data: UserFormData) => void
// }

// const UserDialog = ({ isLoading, isOpen, user, mode, onClose, onSave }: UserDialogProps) => {
//     const [showPassword, setShowPassword] = useState(false)
//     const { user: authUser } = useMe();
//     const { states = [] } = useStates()
//     const { regions = [] } = useRegions()
//     const { districts = [] } = useDistricts()
//     const { groups = [] } = useGroups()
//     const { oldGroups = [] } = useOldGroups()

//     // Determine effective IDs (prefer the user being edited, fallback to auth user's IDs)
//     const effectiveStateId = (user && (user.state_id ?? undefined)) ?? authUser?.state_id
//     const effectiveRegionId = (user && (user.region_id ?? undefined)) ?? authUser?.region_id
//     const effectiveDistrictId = (user && (user.district_id ?? undefined)) ?? authUser?.district_id

//     // If any of these are missing, Zod validation (which requires min(1)) will fail silently
//     // when submitting hidden fields. Disable submit and show a helpful message instead.
//     const isSuperAdmin = (authUser?.roles || []).some((r) => String(r).toLowerCase() === 'super admin')
//     const canSubmit = !!effectiveStateId && !!effectiveRegionId

//     const { register, handleSubmit, formState: { errors }, reset, setValue, watch, trigger } = useForm<UserFormData>({
//         resolver: zodResolver(userSchema(mode) as any),
//         defaultValues: {
//             name: user?.name || '',
//             email: user?.email || '',
//             phone: user?.phone || '',
//             password: '',
//             state_id: user?.state_id || authUser?.state_id || 0,
//             region_id: user?.region_id || authUser?.region_id || 0,
//             district_id: user?.district_id || authUser?.district_id || 0,
//             group_id:
//                 (user && 'group_id' in user ? (user.group_id ?? 0) : ((authUser as { group_id?: number | null } | null)?.group_id ?? 0)) || 0,
//             old_group_id:
//                 (user && 'old_group_id' in user ? (user.old_group_id ?? 0) : ((authUser as { old_group_id?: number | null } | null)?.old_group_id ?? 0)) || 0,
//             roles: Array.isArray(user?.roles)
//                 ? (user!.roles as string[]).map((r) => {
//                     const s = typeof r === 'string' ? r : String(r)
//                     const n = (() => {
//                         const t = s.trim().toLowerCase()
//                         if (t === 'super admin') return "Super Admin"
//                         if (t === 'state admin') return "State Admin"
//                         if (t === 'region admin') return "Region Admin"
//                         if (t === 'district admin') return "District Admin"
//                         if (t === 'group admin') return "Group Admin"
//                         if (t === 'viewer') return "Viewer"
//                         if (t === 'admin') return "Admin"
//                         return "Admin"
//                     })()
//                     return n
//                 })
//                 : ["Admin"]
//         }
//     })

//     const onSubmit = (data: UserFormData) => {
//         const payload = { ...data }

//         // Remove district_id if it's 0 or empty (not selected)
//         if (!payload.district_id || payload.district_id === 0) {
//             delete payload.district_id
//         }

//         console.log("payload", payload);
//         onSave(payload)
//     }

//     const onInvalid = () => {
//         toaster.create({ title: 'Please fix validation errors', type: 'error' })
//     }

//     const handleClose = () => {
//         onClose()
//         reset()
//         setShowPassword(false)
//     }

//     // Reset form when dialog opens with user data
//     useEffect(() => {
//         if (isOpen && user) {
//             reset({
//                 name: user.name || '',
//                 email: user.email || '',
//                 phone: user.phone || '',
//                 password: '',
//                 state_id: user.state_id || authUser?.state_id || undefined,
//                 region_id: user.region_id || authUser?.region_id || undefined,
//                 district_id: user.district_id || authUser?.district_id || undefined,
//                 group_id:
//                     (user && 'group_id' in user ? (user.group_id ?? 0) : ((authUser as { group_id?: number | null } | null)?.group_id ?? 0)) || undefined,
//                 old_group_id:
//                     (user && 'old_group_id' in user ? (user.old_group_id ?? 0) : ((authUser as { old_group_id?: number | null } | null)?.old_group_id ?? 0)) || 0,
//                 roles: Array.isArray(user.roles)
//                     ? (user.roles as string[]).map((r) => {
//                         const s = typeof r === 'string' ? r : String(r)
//                         const n = (() => {
//                             const t = s.trim().toLowerCase()
//                             if (t === 'super admin') return "Super Admin"
//                             if (t === 'state admin') return "State Admin"
//                             if (t === 'region admin') return "Region Admin"
//                             if (t === 'district admin') return "District Admin"
//                             if (t === 'group admin') return "Group Admin"
//                             if (t === 'viewer') return "Viewer"
//                             if (t === 'admin') return "Admin"
//                             return "Admin"
//                         })()
//                         return n
//                     })
//                     : ["Admin"]
//             })
//         } else if (isOpen && !user) {
//             // For add mode, set defaults from auth user
//             reset({
//                 name: '',
//                 email: '',
//                 phone: '',
//                 password: '',
//                 state_id: authUser?.state_id || 0,
//                 region_id: authUser?.region_id || 0,
//                 district_id: authUser?.district_id || 0,
//                 group_id: ((authUser as { group_id?: number | null } | null)?.group_id ?? 0) || 0,
//                 old_group_id: ((authUser as { old_group_id?: number | null } | null)?.old_group_id ?? 0) || 0,
//                 roles: ["Admin"]
//             })
//         }
//     }, [isOpen, user, authUser, reset])

//     const rolesCollection = createListCollection({
//         items: [
//             { label: 'Super Admin', value: 'Super Admin' },
//             { label: 'State Admin', value: 'State Admin' },
//             { label: 'Region Admin', value: 'Region Admin' },
//             { label: 'Group Admin', value: 'Group Admin' },
//             { label: 'District Admin', value: 'District Admin' },
//             { label: 'Viewer', value: 'Viewer' },
//             { label: ' Admin', value: "Admin" },
//         ]
//     })

//     const rolesValue = ((watch('roles') ?? []) as (number | string)[]).map((v) => String(v))
//     const rolesErrorMessage = (errors.roles as unknown as { message?: string } | undefined)?.message

//     const watchedStateId = watch('state_id')
//     const watchedRegionId = watch('region_id')
//     const watchedDistrictId = watch('district_id')
//     const watchedGroupId = watch('group_id')
//     const watchedOldGroupId = watch('old_group_id')

//     const currentStateName = useMemo(() => {
//         const match = states.find(s => s.id === watchedStateId)
//         return match?.name || ''
//     }, [states, watchedStateId])

//     const currentRegionName = useMemo(() => {
//         const match = regions.find(r => r.id === watchedRegionId)
//         return match?.name || ''
//     }, [regions, watchedRegionId])

//     const currentDistrictName = useMemo(() => {
//         const match = districts.find(d => d.id === watchedDistrictId)
//         return match?.name || ''
//     }, [districts, watchedDistrictId])

//     const currentGroupName = useMemo(() => {
//         const match = groups.find(g => g.id === watchedGroupId)
//         return match?.name || ''
//     }, [groups, watchedGroupId])

//     const currentOldGroupName = useMemo(() => {
//         const match = oldGroups.find(og => og.id === watchedOldGroupId)
//         return match?.name || ''
//     }, [oldGroups, watchedOldGroupId])

//     const filteredGroups = useMemo(() => {
//         if (!currentOldGroupName || !oldGroups || !groups) {
//             return []
//         }

//         const selectedOldGroup = oldGroups.find(og => og.name === currentOldGroupName)

//         if (!selectedOldGroup) {
//             return []
//         }

//         return groups.filter(group => group.old_group === selectedOldGroup.name)
//     }, [currentOldGroupName, oldGroups, groups])

//     const filteredRegions = useMemo(() => {
//         if (!regions || regions.length === 0 || !watchedStateId) {
//             return []
//         }
//         return regions.filter((region) => {
//             if (region.state_id != null && watchedStateId) {
//                 return Number(region.state_id) === Number(watchedStateId)
//             }
//             if (currentStateName && region.state) {
//                 return region.state.toLowerCase() === currentStateName.toLowerCase()
//             }
//             return false
//         })
//     }, [regions, watchedStateId, currentStateName])

//     const filteredDistricts = useMemo(() => {
//         if (!districts || districts.length === 0 || (!currentRegionName && !currentStateName)) {
//             return []
//         }
//         return districts.filter((d) => {
//             if (currentRegionName && currentStateName) {
//                 return d.region.toLowerCase() === currentRegionName.toLowerCase() && d.state.toLowerCase() === currentStateName.toLowerCase()
//             }

//             return false
//         })
//     }, [districts, currentStateName, currentRegionName])

//     const clearBelowRegion = () => {
//         setValue('region_id', 0, { shouldValidate: false })
//         trigger('region_id')
//         setValue('old_group_id', 0, { shouldValidate: false })
//         trigger('old_group_id')
//         setValue('group_id', 0, { shouldValidate: false })
//         trigger('group_id')
//         setValue('district_id', 0, { shouldValidate: false })
//         trigger('district_id')
//     }

//     const clearBelowOldGroup = () => {
//         setValue('old_group_id', 0, { shouldValidate: false })
//         trigger('old_group_id')
//         setValue('group_id', 0, { shouldValidate: false })
//         trigger('group_id')
//         setValue('district_id', 0, { shouldValidate: false })
//         trigger('district_id')
//     }

//     const clearBelowGroup = () => {
//         setValue('group_id', 0, { shouldValidate: false })
//         trigger('group_id')
//         setValue('district_id', 0, { shouldValidate: false })
//         trigger('district_id')
//     }

//     const onStateChange = useCallback((name: string) => {
//         const id = states.find(s => s.name.toLowerCase() === name.toLowerCase())?.id || 0
//         setValue('state_id', id, { shouldValidate: false })
//         trigger('state_id')
//         clearBelowRegion()
//     }, [states, setValue, trigger])

//     const onRegionChange = useCallback((name: string) => {
//         const id = regions.find(r => r.name.toLowerCase() === name.toLowerCase())?.id || 0
//         setValue('region_id', id, { shouldValidate: false })
//         trigger('region_id')
//         clearBelowOldGroup()
//     }, [regions, setValue, trigger])

//     const onDistrictChange = useCallback((name: string) => {
//         const id = districts.find(d => d.name.toLowerCase() === name.toLowerCase())?.id || 0
//         setValue('district_id', id, { shouldValidate: false })
//         trigger('district_id')
//     }, [districts, setValue, trigger])

//     const onGroupChange = useCallback((name: string) => {
//         const id = groups.find(g => g.name.toLowerCase() === name.toLowerCase())?.id || 0
//         setValue('group_id', id, { shouldValidate: false })
//         trigger('group_id')
//         setValue('district_id', 0, { shouldValidate: false })
//         trigger('district_id')
//     }, [groups, setValue, trigger])

//     const onOldGroupChange = useCallback((name: string) => {
//         const id = oldGroups.find(og => og.name.toLowerCase() === name.toLowerCase())?.id || 0
//         setValue('old_group_id', id, { shouldValidate: false })
//         trigger('old_group_id')
//         clearBelowGroup()
//     }, [oldGroups, setValue, trigger])

//     const onRolesChange = useCallback((val: { value: string[] | number[] }) => {
//         setValue('roles', (val.value || []).map((v) => String(v)), { shouldValidate: true })
//     }, [setValue])

//     return (
//         <Dialog.Root
//             role="alertdialog"
//             open={isOpen}
//             onOpenChange={(e) => {
//                 if (!e.open) {
//                     handleClose()
//                 }
//             }}
//         >
//             <Portal>
//                 <Dialog.Backdrop />
//                 <Dialog.Positioner>
//                     <Dialog.Content rounded="xl" maxW={{ base: "sm", md: "md", lg: "3xl" }}>
//                         <Dialog.Header>
//                             <Dialog.Title>
//                                 {mode === 'add' ? 'Add New User' : 'Update User'}
//                             </Dialog.Title>
//                         </Dialog.Header>

//                         <Dialog.Body>
//                             <form noValidate id="user-form" onSubmit={handleSubmit(onSubmit, onInvalid)}>
//                                 <VStack gap="4" colorPalette={"accent"}>
//                                     {!canSubmit && mode === 'add' && !isSuperAdmin && (
//                                         <Text color="red.500" fontSize="sm">
//                                             Your account does not have a valid State / Region / District assigned. Please update your profile or contact an administrator before adding users.
//                                         </Text>
//                                     )}
//                                     <Field.Root required invalid={!!errors.name}>
//                                         <Field.Label>Full Name
//                                             <Field.RequiredIndicator />
//                                         </Field.Label>
//                                         <Input
//                                             rounded="lg"
//                                             placeholder="Enter full name"
//                                             {...register('name')}
//                                         />
//                                         <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
//                                     </Field.Root>

//                                     <Field.Root required invalid={!!errors.email}>
//                                         <Field.Label>Email
//                                             <Field.RequiredIndicator />
//                                         </Field.Label>
//                                         <Input
//                                             rounded="lg"
//                                             placeholder="Enter email address"
//                                             {...register('email')}
//                                         />
//                                         <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
//                                     </Field.Root>

//                                     <Field.Root required invalid={!!errors.phone}>
//                                         <Field.Label>Phone
//                                             <Field.RequiredIndicator />
//                                         </Field.Label>
//                                         <Input
//                                             rounded="lg"
//                                             placeholder="Enter phone number"
//                                             {...register('phone')}
//                                         />
//                                         <Field.ErrorText>{errors.phone?.message}</Field.ErrorText>
//                                     </Field.Root>

//                                     <Field.Root invalid={!!errors.roles}>
//                                         <Field.Label>Roles</Field.Label>
//                                         <Select.Root
//                                             collection={rolesCollection}
//                                             size="sm"
//                                             value={rolesValue}
//                                             onValueChange={onRolesChange}
//                                         >
//                                             <Select.HiddenSelect multiple />
//                                             <Select.Control>
//                                                 <Select.Trigger rounded="lg">
//                                                     <Select.ValueText placeholder="Select roles" />
//                                                 </Select.Trigger>
//                                                 <Select.IndicatorGroup>
//                                                     <Select.Indicator />
//                                                 </Select.IndicatorGroup>
//                                             </Select.Control>
//                                             <Select.Positioner>
//                                                 <Select.Content>
//                                                     {rolesCollection.items.map((item) => (
//                                                         <Select.Item item={item} key={item.value}>
//                                                             {item.label}
//                                                             <Select.ItemIndicator />
//                                                         </Select.Item>
//                                                     ))}
//                                                 </Select.Content>
//                                             </Select.Positioner>
//                                         </Select.Root>
//                                         <Field.ErrorText>{rolesErrorMessage}</Field.ErrorText>
//                                     </Field.Root>

//                                     <Field.Root required={mode === 'add'} invalid={!!errors.password}>
//                                         <Field.Label>Password
//                                             {mode === 'add' && <Field.RequiredIndicator />}
//                                         </Field.Label>
//                                         <InputGroup
//                                             endElement={
//                                                 <IconButton
//                                                     variant="ghost"
//                                                     aria-label={showPassword ? "Hide password" : "Show password"}
//                                                     onClick={() => setShowPassword(!showPassword)}
//                                                 >
//                                                     {showPassword ? <EyeSlash /> : <Eye />}
//                                                 </IconButton>
//                                             }
//                                         >
//                                             <Input
//                                                 rounded="lg"
//                                                 type={showPassword ? "text" : "password"}
//                                                 placeholder={mode === 'add' ? "Enter password" : "Enter new password (leave blank to keep current)"}
//                                                 {...register('password')}
//                                             />
//                                         </InputGroup>
//                                         {mode === 'edit' && (
//                                             <Field.HelperText>Leave blank to keep current password</Field.HelperText>
//                                         )}
//                                         <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
//                                     </Field.Root>

//                                     {isSuperAdmin && mode === 'add' && (
//                                         <>
//                                             <Field.Root required invalid={!!errors.state_id}>
//                                                 <StateIdCombobox
//                                                     value={currentStateName}
//                                                     onChange={onStateChange}
//                                                     required
//                                                     invalid={!!errors.state_id}
//                                                 />
//                                                 <Field.ErrorText>{errors.state_id?.message}</Field.ErrorText>
//                                             </Field.Root>

//                                             <Field.Root required invalid={!!errors.region_id}>
//                                                 <RegionIdCombobox
//                                                     value={watchedRegionId}
//                                                     onChange={(id) => {
//                                                         const name = regions.find(r => r.id === (id || 0))?.name || ''
//                                                         onRegionChange(name)
//                                                     }}
//                                                     required
//                                                     invalid={!!errors.region_id}
//                                                     stateId={isSuperAdmin ? watchedStateId : authUser?.state_id as number}
//                                                     disabled={isSuperAdmin ? !watchedStateId : !authUser?.state_id}
//                                                 />
//                                                 <Field.ErrorText>{errors.region_id?.message}</Field.ErrorText>
//                                             </Field.Root>

//                                             <Field.Root>
//                                                 <OldGroupIdCombobox
//                                                     value={watchedOldGroupId as number}
//                                                     onChange={(id) => {
//                                                         const name = oldGroups.find(og => og.id === (id || 0))?.name || ''
//                                                         onOldGroupChange(name)
//                                                     }}
//                                                     stateId={authUser?.state_id as number}
//                                                     regionId={isSuperAdmin ? watchedRegionId : authUser?.region_id as number}
//                                                     isRegionAdmin={(authUser?.roles || []).includes('Region Admin')}
//                                                 />
//                                             </Field.Root>

//                                             <Field.Root>
//                                                 <GroupIdCombobox
//                                                     value={watchedGroupId}
//                                                     onChange={(id) => {
//                                                         const name = groups.find(g => g.id === (id || 0))?.name || ''
//                                                         onGroupChange(name)
//                                                     }}
//                                                     oldGroupId={watchedOldGroupId as number}
//                                                     disabled={!watchedOldGroupId}
//                                                 />
//                                             </Field.Root>

//                                             <Field.Root invalid={!!errors.district_id}>
//                                                 <DistrictIdCombobox
//                                                     value={watchedDistrictId}
//                                                     onChange={(id) => {
//                                                         const name = districts.find(d => d.id === (id || 0))?.name || ''
//                                                         onDistrictChange(name)
//                                                     }}
//                                                     invalid={!!errors.district_id}
//                                                     disabled={!watchedGroupId}
//                                                     stateId={effectiveStateId as number}
//                                                     regionId={effectiveRegionId as number}
//                                                     oldGroupId={authUser?.old_group_id ?? undefined}
//                                                     groupId={watchedGroupId || (authUser?.group_id as number | undefined)}
//                                                     isGroupAdmin={(authUser?.roles || []).includes('Group Admin')}
//                                                 />
//                                                 <Field.ErrorText>{errors.district_id?.message}</Field.ErrorText>
//                                             </Field.Root>

//                                         </>
//                                     )}

//                                     {/* Hidden fields for API compatibility */}
//                                     <input type="hidden" {...register('state_id', { valueAsNumber: true })} />
//                                     <input type="hidden" {...register('region_id', { valueAsNumber: true })} />
//                                     <input type="hidden" {...register('district_id', { valueAsNumber: true })} />
//                                     <input type="hidden" {...register('group_id', { valueAsNumber: true })} />
//                                     <input type="hidden" {...register('old_group_id', { valueAsNumber: true })} />
//                                 </VStack>
//                             </form>
//                         </Dialog.Body>

//                         <Dialog.Footer>
//                             <Dialog.ActionTrigger asChild>
//                                 <Button rounded="xl" variant="outline">Cancel</Button>
//                             </Dialog.ActionTrigger>

//                             <Button
//                                 rounded="xl"
//                                 type="submit"
//                                 form="user-form"
//                                 colorPalette="accent"
//                                 loading={isLoading}
//                                 loadingText={mode === 'add' ? 'Adding User' : 'Updating User'}
//                                 disabled={isLoading || (mode === 'add' && !isSuperAdmin && !canSubmit)}
//                             >
//                                 {mode === 'add' ? 'Add User' : 'Update User'}
//                             </Button>
//                         </Dialog.Footer>

//                         <Dialog.CloseTrigger asChild>
//                             <CloseButton size="sm" />
//                         </Dialog.CloseTrigger>
//                     </Dialog.Content>
//                 </Dialog.Positioner>
//             </Portal>
//         </Dialog.Root>
//     )
// }

// export default UserDialog;
