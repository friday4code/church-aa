// components/oldgroups/components/OldGroupDialog.tsx
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
import { oldGroupSchema, type OldGroupFormData } from "../../../schemas/oldgroups.schema"
import type { OldGroup } from "@/types/oldGroups.type"
import { useEffect, useMemo, useState } from "react"
import { useMe } from "@/hooks/useMe"
import { useStates } from "@/modules/admin/hooks/useState"
import { useRegions } from "@/modules/admin/hooks/useRegion"
import StateIdCombobox from "@/modules/admin/components/StateIdCombobox"
import RegionIdCombobox from "@/modules/admin/components/RegionIdCombobox"

interface OldGroupDialogProps {
    isLoading?: boolean
    isOpen: boolean
    group?: OldGroup
    mode: 'add' | 'edit'
    onClose: () => void
    onSave: (data: OldGroupFormData) => void
}

const OldGroupDialog = ({ isLoading, isOpen, group, mode, onClose, onSave }: OldGroupDialogProps) => {
    const { user } = useMe()
    const { states, isLoading: isStatesLoading } = useStates()
    const { regions, isLoading: isRegionsLoading } = useRegions()
    const [selectedStateName, setSelectedStateName] = useState('')
    const [selectedRegionName, setSelectedRegionName] = useState('')
    const userStateId = user?.state_id ?? 0
    const userRegionId = user?.region_id ?? 0
    const isSuperAdmin = user?.roles?.some((role) => role.toLowerCase() === 'super admin') ?? false

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<OldGroupFormData>({
        resolver: zodResolver(oldGroupSchema),
        defaultValues: {
            name: group?.name || '',
            code: group?.code || '',
            leader: group?.leader || '',
            state_id: group?.state_id ?? 0,
            region_id: group?.region_id ?? 0,
        }
    })

    const currentName = watch('name')
    const currentCode = watch('code')
    const watchedStateId = watch('state_id')
    const watchedRegionId = watch('region_id')

    const derivedStateName = useMemo(() => {
        if (selectedStateName) {
            return selectedStateName
        }

        if (watchedStateId && states?.length) {
            const matchedState = states.find((state) => state.id === watchedStateId)
            if (matchedState) {
                return matchedState.name
            }
        }

        return group?.state ?? ''
    }, [selectedStateName, states, watchedStateId, group?.state])

    const filteredRegions = useMemo(() => {
        if (!regions || regions.length === 0 || (!watchedStateId && !derivedStateName)) {
            return []
        }

        return regions.filter((region) => {
            if (region.state_id !== undefined && region.state_id !== null && watchedStateId) {
                return Number(region.state_id) === Number(watchedStateId)
            }

            if (derivedStateName && region.state) {
                return region.state.toLowerCase() === derivedStateName.toLowerCase()
            }

            return false
        })
    }, [regions, watchedStateId, derivedStateName])

    const handleNameChange = (value: string) => {
        setValue('name', value)
        // Generate code from name
        const generatedCode = value ? generateGroupCode(value) : ''
        setValue('code', generatedCode)
    }

    const handleStateChange = (stateName: string) => {
        if (!stateName) {
            setValue('state_id', 0, { shouldValidate: true })
            setValue('region_id', 0)
            return
        }

        const selectedState = states?.find(state => state.name === stateName)
        if (selectedState) {
            setValue('state_id', selectedState.id, { shouldValidate: true })
            // Reset region when state changes
            setValue('region_id', 0, { shouldValidate: true })
        }
    }

    const handleRegionChange = (regionName: string) => {
        if (!regionName) {
            setValue('region_id', 0, { shouldValidate: true })
            return
        }

        const selectedRegion = regions?.find(region => region.name === regionName)
        if (selectedRegion) {
            setValue('region_id', selectedRegion.id, { shouldValidate: true })
        }
    }

    const generateGroupCode = (groupName: string): string => {
        if (!groupName) return ''
        const cleanName = groupName.replace(/group/gi, '').trim()
        return `GRP-${cleanName.substring(0, 3).toUpperCase()}`
    }

    const onSubmit = (data: OldGroupFormData) => {
        onSave(data)
        reset()
    }

    const handleClose = () => {
        onClose()
        reset()
        setSelectedStateName('')
        setSelectedRegionName('')
    }

    const handleStateChange = (stateName: string) => {
        setSelectedStateName(stateName)

        if (!stateName) {
            setValue('state_id', 0, { shouldValidate: true })
            setSelectedRegionName('')
            setValue('region_id', 0, { shouldValidate: true })
            return
        }

        const selectedState = states?.find((state) => state.name === stateName)
        const nextStateId = selectedState?.id ?? 0

        setValue('state_id', nextStateId, { shouldValidate: true })
        setSelectedRegionName('')
        setValue('region_id', 0, { shouldValidate: true })
    }

    const handleRegionChange = (regionName: string) => {
        setSelectedRegionName(regionName)

        if (!regionName) {
            setValue('region_id', 0, { shouldValidate: true })
            return
        }

        const selectedRegion = regions?.find((region) => region.name === regionName)
        setValue('region_id', selectedRegion?.id ?? 0, { shouldValidate: true })
    }

    useEffect(() => {
        if (!isOpen) {
            return
        }

        if (group) {
            reset({
                name: group.name,
                code: group.code,
                leader: group.leader,
                state_id: (group.state_id ?? 0) as number,
                region_id: (group.region_id ?? 0) as number,
            })

            return
        }

        reset({
            name: '',
            code: '',
            leader: '',
            state_id: isSuperAdmin ? 0 : userStateId,
            region_id: isSuperAdmin ? 0 : userRegionId,
        })
    }, [group, isOpen, reset, isSuperAdmin, userStateId, userRegionId])

    useEffect(() => {
        if (!isSuperAdmin || !isOpen) {
            return
        }

        if (watchedStateId && states?.length) {
            const matchedState = states.find((state) => state.id === watchedStateId)
            if (matchedState) {
                setSelectedStateName(matchedState.name)
                return
            }
        }

        if (group?.state && states?.length) {
            const matchedState = states.find(
                (state) => state.name.toLowerCase() === group.state.toLowerCase()
            )

            if (matchedState) {
                setSelectedStateName(matchedState.name)
                setValue('state_id', matchedState.id, { shouldValidate: true })
            } else {
                setSelectedStateName(group.state)
            }
        }
    }, [isSuperAdmin, isOpen, states, watchedStateId, group?.state, setValue])

    useEffect(() => {
        if (!isSuperAdmin || !isOpen) {
            return
        }

        if (watchedRegionId && regions?.length) {
            const matchedRegion = regions.find((region) => region.id === watchedRegionId)
            if (matchedRegion) {
                setSelectedRegionName(matchedRegion.name)
                return
            }
        }

        if (group?.region && regions?.length) {
            const matchedRegion = regions.find(
                (region) => region.name.toLowerCase() === group.region.toLowerCase()
            )

            if (matchedRegion) {
                setSelectedRegionName(matchedRegion.name)
                setValue('region_id', matchedRegion.id, { shouldValidate: true })
            } else {
                setSelectedRegionName(group.region)
            }
        }
    }, [isSuperAdmin, isOpen, regions, watchedRegionId, group?.region, setValue])

    useEffect(() => {
        if (!isOpen || !group || !states?.length) {
            return
        }

        if ((!watchedStateId || watchedStateId === 0) && group.state) {
            const matchedState = states.find(
                (state) => state.name.toLowerCase() === group.state.toLowerCase()
            )

            if (matchedState) {
                setValue('state_id', matchedState.id, { shouldValidate: true })
            }
        }
    }, [isOpen, group, states, setValue, watchedStateId])

    useEffect(() => {
        if (!isOpen || !group || !regions?.length) {
            return
        }

        if ((!watchedRegionId || watchedRegionId === 0) && group.region) {
            const matchedRegion = regions.find(
                (region) => region.name.toLowerCase() === group.region.toLowerCase()
            )

            if (matchedRegion) {
                setValue('region_id', matchedRegion.id, { shouldValidate: true })
            }
        }
    }, [isOpen, group, regions, setValue, watchedRegionId])

    useEffect(() => {
        if (!isOpen || isSuperAdmin) {
            return
        }

        if (userStateId) {
            setValue('state_id', userStateId, { shouldValidate: true })
        }

        if (userRegionId) {
            setValue('region_id', userRegionId, { shouldValidate: true })
        }
    }, [isOpen, isSuperAdmin, setValue, userRegionId, userStateId])

    return (
        <>
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
                                    {mode === 'add' ? 'Add New Old Group' : 'Update Old Group'}
                                </Dialog.Title>
                            </Dialog.Header>

                            <Dialog.Body>
                                <form noValidate id="oldgroup-form" onSubmit={handleSubmit(onSubmit)}>
                                    <VStack gap="4" colorPalette={"accent"}>
                                        <Field.Root required invalid={!!errors.name}>
                                            <Field.Label>Old Group Name
                                                <Field.RequiredIndicator />
                                            </Field.Label>
                                            <Input
                                                rounded="lg"
                                                placeholder="Enter old group name"
                                                value={currentName}
                                                onChange={(e) => handleNameChange(e.target.value)}
                                            />
                                            <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                                        </Field.Root>

                                        <Field.Root required invalid={!!errors.code}>
                                            <Field.Label>Old Group Code
                                                <Field.RequiredIndicator />
                                            </Field.Label>
                                            <Input
                                                rounded="lg"
                                                placeholder="Old group code will be auto-generated"
                                                value={currentCode}
                                                readOnly
                                                {...register('code')}
                                            />
                                            <Field.HelperText>
                                                Auto-generated from old group name
                                            </Field.HelperText>
                                            <Field.ErrorText>{errors.code?.message}</Field.ErrorText>
                                        </Field.Root>

                                        <Field.Root required invalid={!!errors.leader}>
                                            <Field.Label>Old Group Leader
                                                <Field.RequiredIndicator />
                                            </Field.Label>
                                            <Input
                                                rounded="lg"
                                                placeholder="Enter old group leader name"
                                                {...register('leader')}
                                            />
                                            <Field.ErrorText>{errors.leader?.message}</Field.ErrorText>
                                        </Field.Root>

                                        {isSuperAdmin && (
                                            <Field.Root required invalid={!!errors.state_id}>
                                                <StateIdCombobox
                                                    required
                                                    value={selectedStateName}
                                                    onChange={handleStateChange}
                                                    invalid={!!errors.state_id}
                                                    disabled={isStatesLoading || isLoading}
                                                />
                                                <Field.ErrorText>{errors.state_id?.message}</Field.ErrorText>
                                            </Field.Root>
                                        )}

                                        {isSuperAdmin && (
                                            <Field.Root required invalid={!!errors.region_id}>
                                                <RegionIdCombobox
                                                    required
                                                    value={selectedRegionName}
                                                    onChange={handleRegionChange}
                                                    invalid={!!errors.region_id}
                                                    disabled={(!watchedStateId && !derivedStateName) || isRegionsLoading || isLoading}
                                                    items={filteredRegions}
                                                />
                                                <Field.ErrorText>{errors.region_id?.message}</Field.ErrorText>
                                            </Field.Root>
                                        )}

                                        {/* Hidden inputs for state_id and region_id */}
                                        <input type="hidden" {...register('state_id', { valueAsNumber: true })} />
                                        <input type="hidden" {...register('region_id', { valueAsNumber: true })} />
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
                                    form="oldgroup-form"
                                    colorPalette="accent"
                                    loading={isLoading}
                                    loadingText={mode === 'add' ? 'Adding Old Group' : 'Updating Old Group'}
                                    disabled={isLoading}
                                >
                                    {mode === 'add' ? 'Add Old Group' : 'Update Old Group'}
                                </Button>
                            </Dialog.Footer>

                            <Dialog.CloseTrigger asChild>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    )
}

export default OldGroupDialog;