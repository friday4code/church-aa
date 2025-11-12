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
import { useStates } from "@/modules/admin/hooks/useState"
import { useRegions } from "@/modules/admin/hooks/useRegion"
import StateIdCombobox from "@/modules/admin/components/StateIdCombobox"
import type { States } from "@/types/states.type"
import type { Regions } from "@/types/regions.type"
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
    const { states } = useStates()
    const { regions } = useRegions()

    const stateId = useMemo(() => {
        return (states as States).find(s => s.name === district?.state)?.id;
    }, [states, district?.state]);

    const regionId = useMemo(() => {
        return (regions as Regions).find(r => r.name === district?.region)?.id;
    }, [regions, district?.region]);

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset, trigger } = useForm<DistrictFormData>({
        resolver: zodResolver(districtSchema),
        defaultValues: {
            state_id: stateId || 0,
            region_id: regionId || 0,
            name: district?.name || '',
            leader: district?.leader || '',
            code: district?.code || ''
        }
    })

    const currentStateId = watch('state_id')
    const currentRegionId = watch('region_id')

    const handleStateChange = (stateName: string) => {
        const state = states?.find(s => s.name === stateName)
        if (state) {
            setValue('state_id', state.id, { shouldValidate: true })
            trigger('state_id')
            // Clear region when state changes
            setValue('region_id', 0)
        }
    }

    const handleRegionChange = (regionName: string) => {
        const region = regions?.find(r => r.name === regionName)
        if (region) {
            setValue('region_id', region.id, { shouldValidate: true })
            trigger('region_id')
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

    const handleClose = () => {
        onClose()
        reset()
    }

    // Reset form when dialog opens with district data
    useEffect(() => {
        if (isOpen && district) {
            reset({
                state_id: stateId,
                region_id: regionId,
                name: district.name,
                leader: district.leader,
                code: district.code
            })
        } else if (isOpen && mode === 'add') {
            // Reset form for add mode
            reset({
                state_id: 0,
                region_id: 0,
                name: '',
                leader: '',
                code: ''
            })
        }
    }, [isOpen, district, reset, mode, stateId, regionId])

    // Get display names for selected IDs
    const getSelectedStateName = () => {
        return states?.find(s => s.id === currentStateId)?.name || ''
    }

    const getSelectedRegionName = () => {
        return regions?.find(r => r.id === currentRegionId)?.name || ''
    }

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
                            <form noValidate id="district-form" onSubmit={handleSubmit(onSubmit)}>
                                <VStack gap="4" colorPalette={"accent"}>

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

                                    <Field.Root invalid={!!errors.code}>
                                        <Field.Label>District Code</Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="District code will be auto-generated"
                                            value={watch('code')}
                                            readOnly={mode === 'add'}
                                            bg={mode === 'add' ? "gray.50" : "white"}
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