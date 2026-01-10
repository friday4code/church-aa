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
import { stateSchema, type StateFormData } from "../../../schemas/states.schemas"
import type { State } from "@/types/states.type"
import StateCombobox from "@/modules/admin/components/StateCombobox"

interface StateEditFormProps {
    state: State
    onUpdate: (data: Partial<StateFormData>) => void
    onCancel: () => void
}

const StateEditForm = ({ state, onUpdate, onCancel }: StateEditFormProps) => {
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<StateFormData>({
        resolver: zodResolver(stateSchema),
        defaultValues: {
            stateName: state.name,
            stateCode: state.code,
            leader: state.leader,
            leader_email: state.leader_email || '',
            leader_phone: state.leader_phone || ''
        }
    })

    const currentStateName = watch('stateName')
    const currentStateCode = watch('stateCode')

    const handleStateChange = (value: string) => {
        setValue('stateName', value)
        const cleanName = value.replace(/state/gi, '').trim()
        const stateCode = cleanName.substring(0, 3).toUpperCase()
        setValue('stateCode', stateCode)
    }

    const onSubmit = (data: StateFormData) => {
        onUpdate(data)
    }

    return (
        <VStack gap="4" align="stretch">
            <Text fontSize="sm" color="gray.600" mb="2">
                Editing: <strong>{state.name}</strong>
            </Text>

            <form id={`state-form-${state.id}`} onSubmit={handleSubmit(onSubmit)}>
                <VStack gap="4" colorPalette={"accent"}>
                    <Field.Root required invalid={!!errors.stateName}>
                        <StateCombobox
                            value={currentStateName}
                            onChange={handleStateChange}
                            required
                            invalid={!!errors.stateName}
                        />
                        <Field.ErrorText>{errors.stateName?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root required invalid={!!errors.stateCode}>
                        <Field.Label>State Code
                            <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                            rounded="lg"
                            placeholder="State code will be auto-generated"
                            value={currentStateCode}
                            {...register('stateCode')}
                        />
                        <Field.HelperText>
                            Auto-generated from state name
                        </Field.HelperText>
                        <Field.ErrorText>{errors.stateCode?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root required invalid={!!errors.leader}>
                        <Field.Label>State Leader
                            <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                            rounded="lg"
                            placeholder="Enter state leader name"
                            {...register('leader')}
                        />
                        <Field.ErrorText>{errors.leader?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.leader_email}>
                        <Field.Label>Leader Email</Field.Label>
                        <Input
                            rounded="lg"
                            type="email"
                            placeholder="Enter leader email address"
                            {...register('leader_email')}
                        />
                        <Field.ErrorText>{errors.leader_email?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.leader_phone}>
                        <Field.Label>Leader Phone</Field.Label>
                        <Input
                            rounded="lg"
                            placeholder="Enter leader phone number"
                            {...register('leader_phone')}
                        />
                        <Field.ErrorText>{errors.leader_phone?.message}</Field.ErrorText>
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
                    form={`state-form-${state.id}`}
                >
                    Update & Close
                </Button>
            </HStack>
        </VStack>
    )
}

export default StateEditForm;