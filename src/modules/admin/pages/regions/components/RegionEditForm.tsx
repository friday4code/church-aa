// components/regions/components/RegionEditForm.tsx
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
import { regionSchema, type RegionFormData } from "../../../schemas/region.schema"
import type { Region } from "@/types/regions.type"
import { useEffect } from "react"

interface RegionEditFormProps {
    region: Region
    onUpdate: (data: Partial<RegionFormData>) => void
    onCancel: () => void
}

const RegionEditForm = ({ region, onUpdate, onCancel }: RegionEditFormProps) => {
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<RegionFormData>({
        resolver: zodResolver(regionSchema),
        defaultValues: {
            name: region.name,
            state_id: 1, // You'll need to get the actual state_id from the region
            leader: region.leader,
            code: region.code
        }
    })

    const currentName = watch('name')
    const currentCode = watch('code')

    const generateRegionCode = (regionName: string): string => {
        if (!regionName) return ''
        return regionName.substring(0, 3).toUpperCase()
    }

    // Auto-generate code when name changes
    useEffect(() => {
        if (currentName && !currentCode) {
            const generatedCode = generateRegionCode(currentName)
            setValue('code', generatedCode)
        }
    }, [currentName, setValue, currentCode])

    const onSubmit = (data: RegionFormData) => {
        onUpdate(data)
    }

    return (
        <VStack gap="4" align="stretch">
            <Text fontSize="sm" color="gray.600" mb="2">
                Editing: <strong>{region.name}</strong>
            </Text>

            <form id={`region-form-${region.id}`} onSubmit={handleSubmit(onSubmit)}>
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

                    <Field.Root required invalid={!!errors.state_id}>
                        <Field.Label>State ID
                            <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                            type="number"
                            rounded="lg"
                            placeholder="Enter state ID"
                            {...register('state_id', { valueAsNumber: true })}
                        />
                        <Field.ErrorText>{errors.state_id?.message}</Field.ErrorText>
                    </Field.Root>

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

            <HStack justify="flex-end" gap="2" mt="4">
                <Button variant="outline" size="sm" onClick={onCancel}>
                    Skip
                </Button>
                <Button
                    size="sm"
                    colorPalette="accent"
                    type="submit"
                    form={`region-form-${region.id}`}
                >
                    Update & Close
                </Button>
            </HStack>
        </VStack>
    )
}

export default RegionEditForm;