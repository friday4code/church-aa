// components/districts/components/DistrictEditForm.tsx
"use client"

import {
    VStack,
    HStack,
    Field,
    Input,
    Button,
    Text,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { districtSchema, type DistrictFormData } from "../../../schemas/districts.schema"
import type { District } from "@/types/districts.type"
import LGACombobox from "@/modules/admin/components/LGACombobox"
import StateCombobox from "@/modules/admin/components/StateCombobox"


interface DistrictEditFormProps {
    district: District
    onUpdate: (data: Partial<DistrictFormData>) => void
    onCancel: () => void
}

const DistrictEditForm = ({ district, onUpdate, onCancel }: DistrictEditFormProps) => {
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<DistrictFormData>({
        resolver: zodResolver(districtSchema),
        defaultValues: {
            state: district.state,
            region: district.region,
            name: district.name,
            leader: district.leader,
            code: district.code
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
        onUpdate(data)
    }

    return (
        <VStack gap="4" align="stretch">
            <Text fontSize="sm" color="gray.600" mb="2">
                Editing: <strong>{district.name}</strong>
            </Text>

            <form id={`district-form-${district.id}`} onSubmit={handleSubmit(onSubmit)}>
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

            <HStack justify="flex-end" gap="2" mt="4">
                <Button variant="outline" size="sm" onClick={onCancel}>
                    Skip
                </Button>
                <Button
                    size="sm"
                    colorPalette="accent"
                    type="submit"
                    form={`district-form-${district.id}`}
                >
                    Update & Close
                </Button>
            </HStack>
        </VStack>
    )
}

export default DistrictEditForm;