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
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
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

import type { User as UsersType } from "@/types/users.type"

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

    // Determine effective IDs (prefer the user being edited, fallback to auth user's IDs)
    const effectiveStateId = (user && (user.state_id ?? undefined)) ?? authUser?.state_id
    const effectiveRegionId = (user && (user.region_id ?? undefined)) ?? authUser?.region_id
    const effectiveDistrictId = (user && (user.district_id ?? undefined)) ?? authUser?.district_id

    // If any of these are missing, Zod validation (which requires min(1)) will fail silently
    // when submitting hidden fields. Disable submit and show a helpful message instead.
    const isSuperAdmin = (authUser?.roles || []).some((r) => String(r).toLowerCase() === 'super admin')
    const canSubmit = !!effectiveStateId && !!effectiveRegionId && !!effectiveDistrictId

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<UserFormData>({
        resolver: zodResolver(userSchema(mode)),
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
            roles: Array.isArray(user?.roles)
                ? (user!.roles as string[]).map((r) => {
                    const s = typeof r === 'string' ? r : String(r)
                    const n = (() => {
                        const t = s.trim().toLowerCase()
                        if (t === 'super admin') return 2
                        if (t === 'state admin') return 3
                        if (t === 'region admin') return 4
                        if (t === 'district admin') return 5
                        if (t === 'group admin') return 6
                        if (t === 'viewer') return 7
                        if (t === 'admin') return 1
                        return 1
                    })()
                    return n
                })
                : [1]
        }
    })

    const onSubmit = (data: UserFormData) => {
        console.log("payload", data);

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
                group_id:
                    (user && 'group_id' in user ? (user.group_id ?? 0) : ((authUser as { group_id?: number | null } | null)?.group_id ?? 0)) || 0,
                old_group_id:
                    (user && 'old_group_id' in user ? (user.old_group_id ?? 0) : ((authUser as { old_group_id?: number | null } | null)?.old_group_id ?? 0)) || 0,
                roles: Array.isArray(user.roles)
                    ? (user.roles as string[]).map((r) => {
                        const s = typeof r === 'string' ? r : String(r)
                        const n = (() => {
                            const t = s.trim().toLowerCase()
                            if (t === 'super admin') return 2
                            if (t === 'state admin') return 3
                            if (t === 'region admin') return 4
                            if (t === 'district admin') return 5
                            if (t === 'group admin') return 6
                            if (t === 'viewer') return 7
                            if (t === 'admin') return 1
                            return 1
                        })()
                        return n
                    })
                    : [1]
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
                group_id: ((authUser as { group_id?: number | null } | null)?.group_id ?? 0) || 0,
                old_group_id: ((authUser as { old_group_id?: number | null } | null)?.old_group_id ?? 0) || 0,
                roles: [1]
            })
        }
    }, [isOpen, user, authUser, reset])

    const rolesCollection = createListCollection({
        items: [
            { label: 'Super Admin', value: '2' },
            { label: 'State Admin', value: '3' },
            { label: 'Region Admin', value: '4' },
            { label: 'Group Admin', value: '6' },
            { label: 'District Admin', value: '5' },
            { label: 'Viewer', value: '7' },
            { label: ' Admin', value: '1' },
        ]
    })

    const rolesValue = ((watch('roles') ?? []) as (number | string)[]).map((v) => String(v))
    const rolesErrorMessage = (errors.roles as unknown as { message?: string } | undefined)?.message

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

                                    <Field.Root invalid={!!errors.roles}>
                                        <Field.Label>Roles</Field.Label>
                                        <Select.Root
                                            collection={rolesCollection}
                                            size="sm"
                                            value={rolesValue}
                                            onValueChange={(val) => setValue('roles', (val.value || []).map((v) => parseInt(v, 10)), { shouldValidate: true })}
                                        >
                                            <Select.HiddenSelect multiple />
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

                                    {isSuperAdmin && (
                                        <>
                                            <Field.Root required invalid={!!errors.state_id}>
                                                <StateIdCombobox
                                                    value={(() => {
                                                        const currentId = watch('state_id')
                                                        const match = states.find(s => s.id === currentId)
                                                        return match?.name || ''
                                                    })()}
                                                    onChange={(name) => {
                                                        const id = states.find(s => s.name.toLowerCase() === name.toLowerCase())?.id || 0
                                                        setValue('state_id', id, { shouldValidate: true })
                                                    }}
                                                    required
                                                    invalid={!!errors.state_id}
                                                />
                                                <Field.ErrorText>{errors.state_id?.message}</Field.ErrorText>
                                            </Field.Root>

                                            <Field.Root required invalid={!!errors.region_id}>
                                                <RegionIdCombobox
                                                    value={(() => {
                                                        const currentId = watch('region_id')
                                                        const match = regions.find(r => r.id === currentId)
                                                        return match?.name || ''
                                                    })()}
                                                    onChange={(name) => {
                                                        const id = regions.find(r => r.name.toLowerCase() === name.toLowerCase())?.id || 0
                                                        setValue('region_id', id, { shouldValidate: true })
                                                    }}
                                                    required
                                                    invalid={!!errors.region_id}
                                                />
                                                <Field.ErrorText>{errors.region_id?.message}</Field.ErrorText>
                                            </Field.Root>

                                            <Field.Root required invalid={!!errors.district_id}>
                                                <DistrictIdCombobox
                                                    value={(() => {
                                                        const currentId = watch('district_id')
                                                        const match = districts.find(d => d.id === currentId)
                                                        return match?.name || ''
                                                    })()}
                                                    onChange={(name) => {
                                                        const id = districts.find(d => d.name.toLowerCase() === name.toLowerCase())?.id || 0
                                                        setValue('district_id', id, { shouldValidate: true })
                                                    }}
                                                    required
                                                    invalid={!!errors.district_id}
                                                />
                                                <Field.ErrorText>{errors.district_id?.message}</Field.ErrorText>
                                            </Field.Root>

                                            <Field.Root>
                                                <GroupIdCombobox
                                                    value={(() => {
                                                        const currentId = watch('group_id')
                                                        const match = groups.find(g => g.id === currentId)
                                                        return match?.name || ''
                                                    })()}
                                                    onChange={(name) => {
                                                        const id = groups.find(g => g.name.toLowerCase() === name.toLowerCase())?.id || 0
                                                        setValue('group_id', id, { shouldValidate: true })
                                                    }}
                                                />
                                            </Field.Root>

                                            <Field.Root>
                                                <OldGroupIdCombobox
                                                    value={(() => {
                                                        const currentId = watch('old_group_id')
                                                        const match = oldGroups.find(og => og.id === currentId)
                                                        return match?.name || ''
                                                    })()}
                                                    onChange={(name) => {
                                                        const id = oldGroups.find(og => og.name.toLowerCase() === name.toLowerCase())?.id || 0
                                                        setValue('old_group_id', id, { shouldValidate: true })
                                                    }}
                                                />
                                            </Field.Root>
                                        </>
                                    )}

                                    {/* Hidden fields for API compatibility */}
                                    <input type="hidden" {...register('state_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('region_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('district_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('group_id', { valueAsNumber: true })} />
                                    <input type="hidden" {...register('old_group_id', { valueAsNumber: true })} />
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
                                disabled={isLoading || (mode === 'add' && !isSuperAdmin && !canSubmit)}
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