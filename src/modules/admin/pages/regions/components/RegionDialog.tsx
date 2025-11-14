// components/regions/components/RegionDialog.tsx
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
import { regionSchema, type RegionFormData } from "../../../schemas/region.schema"
import type { Region } from "@/types/regions.type"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useStates } from "../../../hooks/useState"
import StateIdCombobox from "@/modules/admin/components/StateIdCombobox"

interface RegionDialogProps {
    isLoading?: boolean
    isOpen: boolean
    region?: Region
    mode: 'add' | 'edit'
    onClose: () => void
    onSave: (data: RegionFormData) => void
}

const RegionDialog = ({ isLoading, isOpen, region, mode, onClose, onSave }: RegionDialogProps) => {
    const { states = [] } = useStates()
    const [selectedStateName, setSelectedStateName] = useState<string>(region?.state || '')
    const [_, setSelectedStateId] = useState<number>(0)

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset, trigger } = useForm<RegionFormData>({
        resolver: zodResolver(regionSchema),
        defaultValues: {
            name: region?.name || '',
            state_id: 0,
            leader: region?.leader || '',
            code: region?.code || ''
        }
    })

    const currentName = watch('name')
    const currentCode = watch('code')
    const currentStateId = watch('state_id')

    // Create state mapping for lookup using useMemo
    const stateMapping = useMemo(() => {
        const mapping = new Map<string, number>()
        console.log("states", states);

        if (states.length > 0) {
            states.forEach(state => {
                mapping.set(state.name, state.id)
            })
        }
        return mapping
    }, [states])

    // Handle state selection from combobox
    const handleStateChange = useCallback((stateName: string) => {
        setSelectedStateName(stateName)
        const stateId = stateMapping.get(stateName) || 0

        setSelectedStateId(stateId)
        setValue('state_id', stateId, { shouldValidate: true })

        // Force validation immediately after setting the value
        setTimeout(() => {
            trigger('state_id')
        }, 100)
    }, [stateMapping, setValue, trigger]);

    // Helper function to generate state code from state name
    const generateRegionCode = (stateName: string): string => {
        if (!stateName) return ''

        // Remove "State" from the name if present and take first 3 letters in uppercase
        const cleanName = stateName.replace(/state/gi, '').trim()
        return cleanName.substring(0, 3).toUpperCase()
    }

    const onSubmit = (data: RegionFormData) => {
        console.log("sdata",data);
        
        onSave(data)
        reset()
    }

    const handleClose = () => {
        onClose()
        reset()
        setSelectedStateName('')
        setSelectedStateId(0)
    }

    // Auto-generate code when name changes
    useEffect(() => {
        if (mode === 'add' && currentName) {
            const generatedCode = generateRegionCode(currentName)
            setValue('code', generatedCode)
        }
    }, [currentName, mode, setValue, currentCode])

    // Reset form when dialog opens with region data
    useEffect(() => {
        if (isOpen) {
            if (region) {
                // For edit mode, set the state name and find the corresponding ID
                const stateName = region.state
                const stateId = stateMapping.get(stateName) || 0

                setSelectedStateName(stateName)
                setSelectedStateId(stateId)

                reset({
                    name: region.name,
                    state_id: stateId,
                    leader: region.leader,
                    code: region.code
                })
            } else {
                // For add mode, reset everything
                setSelectedStateName('')
                setSelectedStateId(0)
                reset({
                    name: '',
                    state_id: 0,
                    leader: '',
                    code: ''
                })
            }
        }
    }, [isOpen, region, reset, states])

    return (
        <>
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
                                    {mode === 'add' ? 'Add New Region' : 'Update Region'}
                                </Dialog.Title>
                            </Dialog.Header>

                            <Dialog.Body>
                                <form noValidate id="region-form" onSubmit={handleSubmit(onSubmit)}>
                                    <VStack gap="4" colorPalette={"accent"}>
                                        <Field.Root required invalid={!!errors.name}>
                                            <Field.Label>Region Name
                                                <Field.RequiredIndicator />
                                            </Field.Label>
                                            <Input
                                                rounded="lg"
                                                placeholder="Enter region name"
                                                {...register('name')}
                                            />
                                            <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                                        </Field.Root>

                                        {/* State Selection Field */}
                                        <Field.Root required invalid={!!errors.state_id}>
                                            <StateIdCombobox
                                                value={selectedStateName}
                                                onChange={handleStateChange}
                                                required
                                                invalid={!!errors.state_id}
                                                disabled={mode === 'edit'}
                                            />
                                            <Field.HelperText>
                                                {mode === 'edit'
                                                    ? 'State cannot be changed for existing regions'
                                                    : 'Select the state for this region'
                                                }
                                            </Field.HelperText>
                                            <Field.ErrorText>
                                                {errors.state_id?.message || (currentStateId === 0 && selectedStateName ? 'Please select a valid state from the list' : '')}
                                            </Field.ErrorText>
                                        </Field.Root>

                                        {/* Hidden input for state_id that React Hook Form can validate */}
                                        <input
                                            type="hidden"
                                            {...register('state_id', {
                                                valueAsNumber: true,
                                                validate: (value) => value > 0 || 'State is required'
                                            })}
                                        />

                                        <Field.Root required invalid={!!errors.code}>
                                            <Field.Label>Region Code
                                                <Field.RequiredIndicator />
                                            </Field.Label>
                                            <Input
                                                rounded="lg"
                                                placeholder="Region code will be auto-generated"
                                                {...register('code')}
                                            />
                                            <Field.HelperText>
                                                Auto-generated from region name
                                            </Field.HelperText>
                                            <Field.ErrorText>{errors.code?.message}</Field.ErrorText>
                                        </Field.Root>

                                        <Field.Root required invalid={!!errors.leader}>
                                            <Field.Label>Region Leader
                                                <Field.RequiredIndicator />
                                            </Field.Label>
                                            <Input
                                                rounded="lg"
                                                placeholder="Enter region leader name"
                                                {...register('leader')}
                                            />
                                            <Field.ErrorText>{errors.leader?.message}</Field.ErrorText>
                                        </Field.Root>
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
                                    form="region-form"
                                    colorPalette="accent"
                                    loading={isLoading}
                                    loadingText={mode === 'add' ? 'Adding Region' : 'Updating Region'}
                                    disabled={isLoading}
                                >
                                    {mode === 'add' ? 'Add Region' : 'Update Region'}
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

export default RegionDialog;