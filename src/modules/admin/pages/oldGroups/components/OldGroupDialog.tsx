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
import { useEffect, useMemo } from "react"
import { useStates } from "../../../hooks/useState"
import { useRegions } from "../../../hooks/useRegion"
import StateIdCombobox from "../../../components/StateIdCombobox"
import RegionIdCombobox from "../../../components/RegionIdCombobox"

interface OldGroupDialogProps {
    isLoading?: boolean
    isOpen: boolean
    group?: OldGroup
    mode: 'add' | 'edit'
    onClose: () => void
    onSave: (data: OldGroupFormData) => void
}

const OldGroupDialog = ({ isLoading, isOpen, group, mode, onClose, onSave }: OldGroupDialogProps) => {
    const { states } = useStates()
    const { regions } = useRegions()

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset, trigger } = useForm<OldGroupFormData>({
        resolver: zodResolver(oldGroupSchema),
        defaultValues: {
            name: group?.name || '',
            code: group?.code || '',
            leader: group?.leader || '',
            state_id: group?.state_id || 0,
            region_id: group?.region_id || 0,
        }
    })

    const currentName = watch('name')
    const currentCode = watch('code')
    const currentStateId = watch('state_id')
    const currentRegionId = watch('region_id')

    // Get the selected state name by ID
    const getStateNameById = (stateId: number) => {
        return states?.find(s => s.id === stateId)?.name || ''
    }

    // Filter regions by selected state name
    const filteredRegions = useMemo(() => {
        if (!currentStateId || currentStateId === 0) return []
        const stateName = getStateNameById(currentStateId)
        if (!stateName) return []
        return regions?.filter(r => r.state === stateName) || []
    }, [regions, currentStateId, states])

    const handleNameChange = (value: string) => {
        setValue('name', value)
        // Generate code from name
        const generatedCode = value ? generateGroupCode(value) : ''
        setValue('code', generatedCode)
    }

    const handleStateChange = (stateName: string) => {
        const state = states?.find(s => s.name === stateName)
        if (state) {
            setValue('state_id', state.id, { shouldValidate: true })
            trigger('state_id')
            // Clear dependent fields
            setValue('region_id', 0)
        }
    }

    const handleRegionChange = (regionName: string) => {
        const region = filteredRegions?.find(r => r.name === regionName)
        if (region) {
            setValue('region_id', region.id, { shouldValidate: true })
            trigger('region_id')
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
    }

    // Reset form when dialog opens with group data
    useEffect(() => {
        if (isOpen && group) {
            reset({
                name: group.name,
                code: group.code,
                leader: group.leader,
                state_id: group.state_id,
                region_id: group.region_id,
            })
        }
    }, [isOpen, group, reset])

    // Get display names for selected IDs
    const getSelectedStateName = () => {
        return states?.find(s => s.id === currentStateId)?.name || ''
    }

    const getSelectedRegionName = () => {
        return regions?.find(r => r.id === currentRegionId)?.name || ''
    }

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

                                        {/* State Selection */}
                                        <Field.Root required invalid={!!errors.state_id}>
                                            <StateIdCombobox
                                                value={getSelectedStateName()}
                                                onChange={handleStateChange}
                                                required
                                                invalid={!!errors.state_id}
                                            />
                                            <Field.ErrorText>{errors.state_id?.message}</Field.ErrorText>
                                        </Field.Root>

                                        {/* Region Selection */}
                                        <Field.Root required invalid={!!errors.region_id}>
                                            <RegionIdCombobox
                                                value={getSelectedRegionName()}
                                                onChange={handleRegionChange}
                                                required
                                                invalid={!!errors.region_id}
                                                items={filteredRegions}
                                                disabled={!currentStateId || currentStateId === 0}
                                            />
                                            <Field.ErrorText>{errors.region_id?.message}</Field.ErrorText>
                                        </Field.Root>

                                        {/* Hidden inputs for React Hook Form validation */}
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