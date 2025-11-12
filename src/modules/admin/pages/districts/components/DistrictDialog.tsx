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
import { useEffect } from "react"
import LGACombobox from "@/modules/admin/components/LGACombobox"
import StateCombobox from "@/modules/admin/components/StateCombobox"


interface DistrictDialogProps {
    isLoading?: boolean
    isOpen: boolean
    district?: District
    mode: 'add' | 'edit'
    onClose: () => void
    onSave: (data: DistrictFormData) => void
}

const DistrictDialog = ({ isLoading, isOpen, district, mode, onClose, onSave }: DistrictDialogProps) => {
    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<DistrictFormData>({
        resolver: zodResolver(districtSchema),
        defaultValues: {
            state: district?.state || '',
            region: district?.region || '',
            name: district?.name || '',
            leader: district?.leader || '',
            code: district?.code || ''
        }
    })

    const currentStateName = watch('state')

    const handleStateChange = (value: string) => {
        setValue('state', value)
        // Clear region when state changes
        setValue('region', '')
    }

    const handleRegionChange = (value: string) => {
        setValue('region', value)
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
                state: district.state,
                region: district.region,
                name: district.name,
                leader: district.leader,
                code: district.code
            })
        }
    }, [isOpen, district, reset])

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
                                {mode === 'add' ? 'Add New District' : 'Update District'}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <form noValidate id="district-form" onSubmit={handleSubmit(onSubmit)}>
                                <VStack gap="4" colorPalette={"accent"}>
                                    <Field.Root required invalid={!!errors.state}>
                                        <StateCombobox
                                            value={currentStateName}
                                            onChange={handleStateChange}
                                            required
                                            invalid={!!errors.state}
                                        />
                                        <Field.ErrorText>{errors.state?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.region}>
                                        <LGACombobox
                                            stateName={currentStateName}
                                            value={watch('region')}
                                            onChange={handleRegionChange}
                                            required
                                            invalid={!!errors.region}
                                        />
                                        <Field.ErrorText>{errors.region?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root required invalid={!!errors.name}>
                                        <Field.Label>District Name
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter district name"
                                            {...register('name')}
                                        />
                                        <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
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

                                    <Field.Root invalid={!!errors.code}>
                                        <Field.Label>District Code</Field.Label>
                                        <Input
                                            rounded="lg"
                                            placeholder="Enter district code (optional)"
                                            {...register('code')}
                                        />
                                        <Field.ErrorText>{errors.code?.message}</Field.ErrorText>
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