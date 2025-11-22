// components/districts/components/DistrictDialog.tsx
"use client"

import {
    Dialog,
    Portal,
    Field,
    CloseButton,
    Button,
    VStack,
    Input,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { districtSchema, type DistrictFormData } from "../../../schemas/districts.schema"
import type { District } from "@/types/districts.type"
import { useEffect, useMemo } from "react"
import { useMe } from "@/hooks/useMe"
import { useOldGroups } from "@/modules/admin/hooks/useOldGroup"
import { useGroups } from "@/modules/admin/hooks/useGroup"
import { useStates } from "@/modules/admin/hooks/useState"
import { useRegions } from "@/modules/admin/hooks/useRegion"
import OldGroupIdCombobox from "@/modules/admin/components/OldGroupIdCombobox"
import GroupIdCombobox from "@/modules/admin/components/GroupIdCombobox"
import StateIdCombobox from "@/modules/admin/components/StateIdCombobox"
import RegionIdCombobox from "@/modules/admin/components/RegionIdCombobox"

interface DistrictDialogProps {
    isLoading?: boolean
    isOpen: boolean
    district?: District
    mode: 'add' | 'edit'
    onClose: () => void
    onSave: (data: DistrictFormData) => void
}

const DistrictDialog = ({ isLoading, isOpen, district, mode, onClose, onSave }: DistrictDialogProps) => {
    const { user } = useMe()
    const { oldGroups } = useOldGroups()
    const { groups: allGroups } = useGroups()
    const { states } = useStates()
    const { regions } = useRegions()
    const userStateId = user?.state_id ?? 0
    const isSuperAdmin = user?.roles?.some((role) => role.toLowerCase() === 'super admin') ?? false

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<DistrictFormData>({
        resolver: zodResolver(districtSchema),
        defaultValues: {
            state_id: district?.state_id || userStateId || 0,
            region_id: district?.region_id || 0,
            name: district?.name || '',
            leader: district?.leader || '',
            code: district?.code || '',
            old_group_id: district?.old_group_id || 0,
            group_id: district?.group_id || 0,
            old_group_name: district?.old_group || '',
            group_name: district?.group || '',
            state_name: district?.state || '',
            region_name: district?.region || '',
        }
    })

    const currentStateName = watch('state_name')
    const currentRegionName = watch('region_name')
    const currentOldGroupName = watch('old_group_name')
    const currentGroupName = watch('group_name')
    const watchedStateId = watch('state_id')

    // Filter groups based on selected old group
    const filteredGroups = useMemo(() => {
        if (!currentOldGroupName || !oldGroups || !allGroups) {
            return []
        }

        const selectedOldGroup = oldGroups.find(og => og.name === currentOldGroupName)

        if (!selectedOldGroup) {
            return []
        }

        // Filter groups that belong to the selected old group
        return allGroups.filter(group => group.old_group === selectedOldGroup.name)
    }, [currentOldGroupName, oldGroups, allGroups])

    // Get state name for display
    const selectedStateName = useMemo(() => {
        if (currentStateName) {
            return currentStateName
        }
        if (district?.state) {
            return district.state
        }
        return ''
    }, [currentStateName, district?.state])

    // Get region name for display
    const selectedRegionName = useMemo(() => {
        if (currentRegionName) {
            return currentRegionName
        }
        if (district?.region) {
            return district.region
        }
        return ''
    }, [currentRegionName, district?.region])

    const derivedStateName = useMemo(() => {
        if (selectedStateName) {
            return selectedStateName
        }

        if (!watchedStateId || !states?.length) {
            return ''
        }

        const matchedState = states.find((state) => state.id === watchedStateId)
        return matchedState?.name ?? ''
    }, [selectedStateName, states, watchedStateId])

    // Get old group name for display
    const selectedOldGroupName = useMemo(() => {
        if (currentOldGroupName) {
            return currentOldGroupName
        }
        if (district?.old_group) {
            return district.old_group
        }
        return ''
    }, [currentOldGroupName, district?.old_group])

    // Get group name for display
    const selectedGroupName = useMemo(() => {
        if (currentGroupName) {
            return currentGroupName
        }
        if (district?.group) {
            return district.group
        }
        return ''
    }, [currentGroupName, district?.group])

    // Handle state selection - convert name to ID
    const handleStateChange = (stateName: string) => {
        if (stateName) {
            const state = states?.find(s => s.name === stateName)
            if (state) {
                setValue('state_id', state.id, { shouldValidate: true })
                setValue('state_name', stateName)
                // Clear region when state changes
                setValue('region_id', undefined as any)
                setValue('region_name', '')
            }
        } else {
            setValue('state_id', undefined as any)
            setValue('state_name', '')
            setValue('region_id', undefined as any)
            setValue('region_name', '')
        }
    }

    // Handle region selection - convert name to ID
    const handleRegionChange = (regionName: string) => {
        if (regionName) {
            const region = regions?.find(r => r.name === regionName)
            if (region) {
                setValue('region_id', region.id, { shouldValidate: true })
                setValue('region_name', regionName)
            }
        } else {
            setValue('region_id', undefined as any)
            setValue('region_name', '')
        }
    }

    // Handle old group selection - convert name to ID
    const handleOldGroupChange = (oldGroupName: string) => {
        if (oldGroupName) {
            const oldGroup = oldGroups?.find(og => og.name === oldGroupName)
            if (oldGroup) {
                setValue('old_group_id', oldGroup.id, { shouldValidate: true })
                setValue('old_group_name', oldGroupName)
                // Clear group when old group changes
                setValue('group_id', undefined as any)
                setValue('group_name', '')
            }
        } else {
            setValue('old_group_id', undefined as any)
            setValue('old_group_name', '')
            setValue('group_id', undefined as any)
            setValue('group_name', '')
        }
    }

    // Handle group selection - convert name to ID
    const handleGroupChange = (groupName: string) => {
        if (groupName) {
            const group = filteredGroups.find(g => g.name === groupName)
            if (group) {
                setValue('group_id', group.id, { shouldValidate: true })
                setValue('group_name', groupName)
            }
        } else {
            setValue('group_id', undefined as any)
            setValue('group_name', '')
        }
    }



    // Helper function to generate district code from district name
    const generateDistrictCode = (districtName: string): string => {
        if (!districtName) return ''

        // Remove common words and take first 3-4 letters in uppercase
        const cleanName = districtName
            .replace(/district|area|zone|region/gi, '')
            .trim()

        // Take first 3-4 characters and convert to uppercase
        return cleanName.substring(0, 4).toUpperCase()
    }

    const handleDistrictNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const districtName = e.target.value
        setValue('name', districtName)

        // Auto-generate district code only in add mode or if code is empty
        if (mode === 'add' || !district?.code) {
            const districtCode = districtName ? generateDistrictCode(districtName) : ''
            setValue('code', districtCode)
        }
    }

    const onSubmit = (data: DistrictFormData) => {
        onSave(data)
        reset()
    }

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        handleSubmit(onSubmit)(e)
    }

    const handleClose = () => {
        onClose()
        reset()
    }

    // Reset form when dialog opens with district data or set from logged in user
    useEffect(() => {
        if (isOpen) {
            if (district) {
                // Use IDs directly if available, otherwise find from names
                let oldGroupId: number | undefined = district.old_group_id
                let groupId: number | undefined = district.group_id

                // Fallback to lookup from names if IDs are not available
                if (!oldGroupId && district.old_group && oldGroups) {
                    const foundOldGroup = oldGroups.find(og => og.name === district.old_group)
                    oldGroupId = foundOldGroup?.id
                }

                if (!groupId && district.group && allGroups) {
                    const foundGroup = allGroups.find(g => g.name === district.group)
                    groupId = foundGroup?.id
                }

                // Derive missing state/region IDs from names
                let stateId = district.state_id || 0
                let regionId = district.region_id || 0
                if (!stateId && district.state && states?.length) {
                    const foundState = states.find(s => s.name === district.state)
                    stateId = foundState?.id || 0
                }
                if (!regionId && district.region && regions?.length) {
                    const foundRegion = regions.find(r => r.name === district.region)
                    regionId = foundRegion?.id || 0
                }

                reset({
                    state_id: stateId,
                    region_id: regionId,
                    name: district.name,
                    leader: district.leader || '',
                    code: district.code || '',
                    old_group_id: oldGroupId || 0,
                    group_id: groupId || 0,
                    old_group_name: district.old_group || '',
                    group_name: district.group || '',
                    state_name: district.state || '',
                    region_name: district.region || '',
                })
            } else {
                // For new districts, use logged in user's state_id and region_id
                reset({
                    state_id: isSuperAdmin ? 0 : user?.state_id || 0,
                    region_id: user?.region_id || 0,
                    name: '',
                    leader: '',
                    code: '',
                    old_group_id: 0,
                    group_id: 0,
                    old_group_name: '',
                    group_name: '',
                    state_name: '',
                    region_name: '',
                })
            }
        }
    }, [isOpen, district, reset, mode, user, oldGroups, allGroups, isSuperAdmin])

    useEffect(() => {
        if (!isOpen || isSuperAdmin) {
            return
        }

        if (userStateId) {
            setValue('state_id', userStateId, { shouldValidate: true })
        }

        if (!currentStateName && states?.length) {
            const matchedState = states.find((state) => state.id === userStateId)
            if (matchedState) {
                setValue('state_name', matchedState.name)
            }
        }
    }, [isOpen, isSuperAdmin, setValue, states, userStateId, currentStateName])

    return (
        <Dialog.Root
            role="alertdialog"
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
                                {mode === 'add' ? 'Add New District' : 'Update District'}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <form noValidate id="district-form" onSubmit={handleFormSubmit}>
                                <VStack gap="4" colorPalette={"accent"}>
                                    {isSuperAdmin && (
                                        <Field.Root required invalid={!!errors.state_id}>
                                            <StateIdCombobox
                                                value={selectedStateName}
                                                onChange={handleStateChange}
                                                invalid={!!errors.state_id}
                                            />
                                            <Field.ErrorText>{errors.state_id?.message}</Field.ErrorText>
                                        </Field.Root>
                                    )}

                                    <Field.Root required invalid={!!errors.region_id}>
                                        <RegionIdCombobox
                                            value={selectedRegionName}
                                            onChange={handleRegionChange}
                                            invalid={!!errors.region_id}
                                            items={regions?.filter((region) => {
                                                if (region.state_id != null && watchedStateId) {
                                                    return Number(region.state_id) === Number(watchedStateId)
                                                }
                                                if (derivedStateName && region.state) {
                                                    return region.state.toLowerCase() === derivedStateName.toLowerCase()
                                                }
                                                return false
                                            }) || []}
                                            disabled={!watchedStateId && !derivedStateName}
                                        />
                                        <Field.ErrorText>{errors.region_id?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.old_group_id}>
                                        <OldGroupIdCombobox
                                            value={selectedOldGroupName}
                                            onChange={handleOldGroupChange}
                                            invalid={!!errors.old_group_id}
                                        />
                                        <Field.ErrorText>{errors.old_group_id?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.group_id}>
                                        <GroupIdCombobox
                                            value={selectedGroupName}
                                            onChange={handleGroupChange}
                                            invalid={!!errors.group_id}
                                            items={filteredGroups}
                                            disabled={!currentOldGroupName}
                                        />
                                        <Field.ErrorText>{errors.group_id?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.name}>
                                        <Field.Label>District Name
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter district name"
                                            {...register('name')}
                                            onChange={handleDistrictNameChange}
                                        />
                                        <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.code}>
                                        <Field.Label>District Code
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="District code will be auto-generated"
                                            value={watch('code')}
                                            readOnly={mode === 'add'}
                                            {...register('code')}
                                        />
                                        <Field.HelperText>
                                            {mode === 'add'
                                                ? "Auto-generated from district name"
                                                : "You can edit the district code in edit mode"}
                                        </Field.HelperText>
                                        <Field.ErrorText>{errors.code?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.leader}>
                                        <Field.Label>District Leader
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter district leader name"
                                            {...register('leader')}
                                        />
                                        <Field.ErrorText>{errors.leader?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <input type="hidden" {...register('state_id')} />
                                    <input type="hidden" {...register('region_id')} />
                                    <input type="hidden" {...register('old_group_id')} />
                                    <input type="hidden" {...register('group_id')} />
                                    <input type="hidden" {...register('state_name')} />
                                    <input type="hidden" {...register('region_name')} />
                                    <input type="hidden" {...register('old_group_name')} />
                                    <input type="hidden" {...register('group_name')} />
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
                                form="district-form"
                                colorPalette="accent"
                                loading={isLoading}
                                loadingText={mode === 'add' ? 'Adding District' : 'Updating District'}
                                disabled={isLoading}
                            >
                                {mode === 'add' ? 'Add District' : 'Update District'}
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

export default DistrictDialog;